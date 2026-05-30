import {
  hasEmailConfig,
  sendMembershipDeactivationWarningEmail,
  sendMembershipEndedEmail,
} from "@/lib/email";
import { getSiteUrl } from "@/lib/site";
import { createAdminClient, hasSupabaseAdminConfig } from "@/utils/supabase/admin";

const gracePeriodDays = 5;

type MemberRow = {
  email: string;
  full_name: string;
  id: string;
  is_active: boolean;
};

type MembershipRow = {
  end_date: string;
  id: string;
  member_id: string;
  status: "active" | "expiring" | "expired";
};

type MembershipReminderRow = {
  membership_id: string;
  reminder_type: "ended_today" | "deactivation_warning";
};

export type ExpireMembershipsResult =
  | {
      cutoffDate: string;
      deactivatedMembers: number;
      emailReminderFailures: number;
      emailRemindersSent: number;
      emailRemindersSkipped: number;
      expiredMemberships: number;
      ok: true;
      today: string;
    }
  | {
      message: string;
      ok: false;
    };

export async function expireOverdueMemberships(): Promise<ExpireMembershipsResult> {
  if (!hasSupabaseAdminConfig()) {
    return {
      message:
        "Falta SUPABASE_SERVICE_ROLE_KEY para expirar membresias automaticamente.",
      ok: false,
    };
  }

  const today = getBogotaDateKey(new Date());
  const cutoffDate = subtractDays(today, gracePeriodDays);
  const warningDate = subtractDays(today, gracePeriodDays - 1);
  const supabase = createAdminClient();
  const [membersResult, membershipsResult, remindersResult] = await Promise.all([
    supabase
      .from("members")
      .select("id,email,full_name,is_active")
      .eq("is_active", true),
    supabase
      .from("memberships")
      .select("id,member_id,end_date,status")
      .order("end_date", { ascending: false }),
    supabase
      .from("membership_reminders")
      .select("membership_id,reminder_type"),
  ]);

  const firstError =
    membersResult.error ?? membershipsResult.error ?? remindersResult.error;

  if (firstError) {
    return {
      message: firstError.message,
      ok: false,
    };
  }

  const activeMembers = (membersResult.data ?? []) as MemberRow[];
  const memberships = (membershipsResult.data ?? []) as MembershipRow[];
  const sentReminders = new Set(
    ((remindersResult.data ?? []) as MembershipReminderRow[]).map(
      (reminder) => `${reminder.membership_id}:${reminder.reminder_type}`,
    ),
  );
  const latestMembershipByMember = new Map<string, MembershipRow>();

  memberships.forEach((membership) => {
    if (!latestMembershipByMember.has(membership.member_id)) {
      latestMembershipByMember.set(membership.member_id, membership);
    }
  });

  const overdueMembershipIds: string[] = [];
  const overdueMemberIds: string[] = [];
  let emailReminderFailures = 0;
  let emailRemindersSent = 0;
  let emailRemindersSkipped = 0;

  for (const member of activeMembers) {
    const latestMembership = latestMembershipByMember.get(member.id);

    if (!latestMembership) {
      continue;
    }

    const reminderType =
      latestMembership.end_date === today
        ? "ended_today"
        : latestMembership.end_date === warningDate
          ? "deactivation_warning"
          : null;

    if (!reminderType) {
      continue;
    }

    if (sentReminders.has(`${latestMembership.id}:${reminderType}`)) {
      continue;
    }

    if (!hasEmailConfig()) {
      emailRemindersSkipped += 1;
      continue;
    }

    try {
      const input = {
        email: member.email,
        fullName: member.full_name,
        loginUrl: `${getSiteUrl()}/login`,
        membershipEndDate: latestMembership.end_date,
      };

      if (reminderType === "ended_today") {
        await sendMembershipEndedEmail(input);
      } else {
        await sendMembershipDeactivationWarningEmail(input);
      }

      const { error } = await supabase.from("membership_reminders").insert({
        email: member.email,
        membership_id: latestMembership.id,
        reminder_type: reminderType,
      });

      if (error && error.code !== "23505") {
        throw error;
      }

      emailRemindersSent += 1;
      sentReminders.add(`${latestMembership.id}:${reminderType}`);
    } catch {
      emailReminderFailures += 1;
    }
  }

  activeMembers.forEach((member) => {
    const latestMembership = latestMembershipByMember.get(member.id);

    if (!latestMembership || latestMembership.end_date > cutoffDate) {
      return;
    }

    overdueMemberIds.push(member.id);

    if (latestMembership.status !== "expired") {
      overdueMembershipIds.push(latestMembership.id);
    }
  });

  if (overdueMembershipIds.length) {
    const { error } = await supabase
      .from("memberships")
      .update({ status: "expired" })
      .in("id", overdueMembershipIds);

    if (error) {
      return { message: error.message, ok: false };
    }
  }

  if (overdueMemberIds.length) {
    const { error } = await supabase
      .from("members")
      .update({
        group_id: null,
        is_active: false,
        updated_at: new Date().toISOString(),
      })
      .in("id", overdueMemberIds);

    if (error) {
      return { message: error.message, ok: false };
    }
  }

  return {
    cutoffDate,
    deactivatedMembers: overdueMemberIds.length,
    emailReminderFailures,
    emailRemindersSent,
    emailRemindersSkipped,
    expiredMemberships: overdueMembershipIds.length,
    ok: true,
    today,
  };
}

function getBogotaDateKey(date: Date) {
  const parts = new Intl.DateTimeFormat("en", {
    day: "2-digit",
    month: "2-digit",
    timeZone: "America/Bogota",
    year: "numeric",
  }).formatToParts(date);
  const values = Object.fromEntries(parts.map((part) => [part.type, part.value]));

  return `${values.year}-${values.month}-${values.day}`;
}

function subtractDays(dateKey: string, days: number) {
  const date = new Date(`${dateKey}T12:00:00-05:00`);
  date.setDate(date.getDate() - days);

  return getBogotaDateKey(date);
}
