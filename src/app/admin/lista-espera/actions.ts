"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/auth";
import { inviteMember } from "@/lib/member-invite";
import {
  createAdminClient,
  hasSupabaseAdminConfig,
} from "@/utils/supabase/admin";

const waitlistAdminPath = "/admin/lista-espera";

export async function inviteWaitlistEntry(formData: FormData) {
  await requireAdmin();

  if (!hasSupabaseAdminConfig()) {
    redirectWithNotice("missing_supabase_admin");
  }

  const entryId = requiredText(formData.get("entryId"));
  const groupId = requiredText(formData.get("groupId"));

  if (!isUuid(entryId) || !isUuid(groupId)) {
    redirectWithNotice("invalid_waitlist_invite");
  }

  const supabase = createAdminClient();
  const groupValidationError = await validateAvailableGroup(supabase, groupId);

  if (groupValidationError) {
    redirectWithNotice(groupValidationError);
  }

  const { data: entry, error: entryError } = await supabase
    .from("waitlist_entries")
    .select("id,full_name,email,phone,date_of_birth,status")
    .eq("id", entryId)
    .maybeSingle();

  if (entryError || !entry || entry.status !== "pending") {
    redirectWithNotice("invalid_waitlist_entry");
  }

  const result = await inviteMember(supabase, {
    dateOfBirth: entry.date_of_birth,
    email: entry.email,
    fullName: entry.full_name,
    groupId,
    phone: entry.phone,
  });

  if (
    result.status === "created" ||
    result.status === "email_failed" ||
    result.status === "link_failed"
  ) {
    const { error: updateError } = await supabase
      .from("waitlist_entries")
      .update({
        invited_at: new Date().toISOString(),
        invited_member_id: result.memberId,
        preferred_group_id: groupId,
        status: "invited",
        updated_at: new Date().toISOString(),
      })
      .eq("id", entry.id);

    if (updateError) {
      redirectWithNotice("waitlist_status_failed");
    }

    revalidateWaitlistPaths();

    if (result.status === "email_failed") {
      redirectWithNotice("waitlist_invited_email_failed");
    }

    if (result.status === "link_failed") {
      redirectWithNotice("waitlist_invited_link_failed");
    }

    redirectWithNotice(
      result.emailSent ? "waitlist_invited" : "waitlist_invited_email_missing",
    );
  }

  const noticeByStatus: Record<typeof result.status, string> = {
    auth_failed: "member_auth_failed",
    duplicate: "member_duplicate",
    profile_failed: "member_profile_failed",
    record_failed: "member_record_failed",
  };

  redirectWithNotice(noticeByStatus[result.status]);
}

export async function archiveWaitlistEntry(formData: FormData) {
  await requireAdmin();

  if (!hasSupabaseAdminConfig()) {
    redirectWithNotice("missing_supabase_admin");
  }

  const entryId = requiredText(formData.get("entryId"));

  if (!isUuid(entryId)) {
    redirectWithNotice("invalid_waitlist_entry");
  }

  const supabase = createAdminClient();
  const { error } = await supabase
    .from("waitlist_entries")
    .update({
      status: "archived",
      updated_at: new Date().toISOString(),
    })
    .eq("id", entryId)
    .eq("status", "pending");

  if (error) {
    redirectWithNotice("waitlist_archive_failed");
  }

  revalidateWaitlistPaths();
  redirectWithNotice("waitlist_archived");
}

async function validateAvailableGroup(
  supabase: ReturnType<typeof createAdminClient>,
  groupId: string,
) {
  const { data: group, error: groupError } = await supabase
    .from("training_groups")
    .select("id,capacity,is_active")
    .eq("id", groupId)
    .maybeSingle();

  if (groupError || !group?.is_active) {
    return "invalid_group";
  }

  const { count, error: countError } = await supabase
    .from("members")
    .select("id", { count: "exact", head: true })
    .eq("group_id", groupId)
    .eq("is_active", true);

  if (countError) {
    return "invalid_group";
  }

  return (count ?? 0) >= group.capacity ? "group_full" : null;
}

function requiredText(value: FormDataEntryValue | null) {
  return String(value ?? "").trim();
}

function isUuid(value: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    value,
  );
}

function revalidateWaitlistPaths() {
  revalidatePath(waitlistAdminPath);
  revalidatePath("/admin");
  revalidatePath("/admin/clientas");
  revalidatePath("/onboarding");
}

function redirectWithNotice(notice: string): never {
  redirect(`${waitlistAdminPath}?notice=${notice}`);
}
