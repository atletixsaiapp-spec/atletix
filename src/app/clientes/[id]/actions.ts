"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/auth";
import { createAdminClient, hasSupabaseAdminConfig } from "@/utils/supabase/admin";

const goals = new Set([
  "Bajar grasa",
  "Ganar masa muscular",
  "Tonificar",
  "Fuerza",
  "Salud general",
]);
const levels = new Set(["Rookie", "Warrior", "Elite", "Titan", "Goddess", "Legend"]);
const paymentMethods = new Set(["cash", "transfer", "nequi", "daviplata", "other"]);
const paymentSources = new Set(["whatsapp", "front_desk", "manual"]);

export async function updateMemberProfile(formData: FormData) {
  await requireAdmin();

  const memberId = requiredText(formData.get("memberId"));

  if (!hasSupabaseAdminConfig()) {
    redirectWithNotice(memberId, "missing_supabase_admin");
  }

  const fullName = requiredText(formData.get("fullName"));
  const email = requiredText(formData.get("email")).toLowerCase();
  const phone = requiredText(formData.get("phone"));
  const goal = requiredText(formData.get("goal"));
  const level = requiredText(formData.get("level"));
  const dateOfBirth = optionalText(formData.get("dateOfBirth"));
  const heightCm = optionalNumber(formData.get("heightCm"));
  const initialWeightKg = optionalNumber(formData.get("initialWeightKg"));
  const currentWeightKg = optionalNumber(formData.get("currentWeightKg"));
  const xp = optionalInteger(formData.get("xp")) ?? 0;
  const streakDays = optionalInteger(formData.get("streakDays")) ?? 0;

  if (!fullName || !email || !phone || !goals.has(goal) || !levels.has(level)) {
    redirectWithNotice(memberId, "invalid_member_update");
  }

  const supabase = createAdminClient();
  const { data: member, error: readError } = await supabase
    .from("members")
    .select("user_id")
    .eq("id", memberId)
    .maybeSingle();

  if (readError || !member) {
    redirectWithNotice(memberId, "member_update_failed");
  }

  const { error: memberError } = await supabase
    .from("members")
    .update({
      current_weight_kg: currentWeightKg,
      date_of_birth: dateOfBirth,
      email,
      full_name: fullName,
      goal,
      height_cm: heightCm,
      initial_weight_kg: initialWeightKg,
      level,
      phone,
      streak_days: streakDays,
      updated_at: new Date().toISOString(),
      xp,
    })
    .eq("id", memberId);

  if (memberError) {
    redirectWithNotice(memberId, "member_update_failed");
  }

  if (member.user_id) {
    const { error: profileError } = await supabase
      .from("profiles")
      .update({
        email,
        full_name: fullName,
        phone,
      })
      .eq("id", member.user_id);

    if (profileError) {
      redirectWithNotice(memberId, "profile_update_failed");
    }
  }

  revalidateMemberPaths(memberId);
  redirectWithNotice(memberId, "member_updated");
}

export async function activateMemberMembership(formData: FormData) {
  await requireAdmin();

  const memberId = requiredText(formData.get("memberId"));

  if (!hasSupabaseAdminConfig()) {
    redirectWithNotice(memberId, "missing_supabase_admin");
  }

  const startDate = requiredText(formData.get("startDate"));
  const endDate = requiredText(formData.get("endDate"));

  if (!isDateKey(startDate) || !isDateKey(endDate) || endDate < startDate) {
    redirectWithNotice(memberId, "invalid_membership_dates");
  }

  const supabase = createAdminClient();
  const { error: membershipError } = await supabase.from("memberships").insert({
    end_date: endDate,
    member_id: memberId,
    start_date: startDate,
    status: "active",
  });

  if (membershipError) {
    redirectWithNotice(memberId, "membership_activate_failed");
  }

  const { error: memberError } = await supabase
    .from("members")
    .update({
      is_active: true,
      updated_at: new Date().toISOString(),
    })
    .eq("id", memberId);

  if (memberError) {
    redirectWithNotice(memberId, "membership_activate_failed");
  }

  revalidateMemberPaths(memberId);
  redirectWithNotice(memberId, "membership_activated");
}

export async function revokeMemberMembership(formData: FormData) {
  await requireAdmin();

  const memberId = requiredText(formData.get("memberId"));

  if (!hasSupabaseAdminConfig()) {
    redirectWithNotice(memberId, "missing_supabase_admin");
  }

  const today = dateKey(new Date());
  const supabase = createAdminClient();
  const { data: memberships, error: membershipReadError } = await supabase
    .from("memberships")
    .select("id")
    .eq("member_id", memberId)
    .order("end_date", { ascending: false })
    .limit(1);

  if (membershipReadError) {
    redirectWithNotice(memberId, "membership_revoke_failed");
  }

  const latestMembership = memberships?.[0];

  if (latestMembership) {
    const { error: membershipError } = await supabase
      .from("memberships")
      .update({
        end_date: today,
        status: "expired",
      })
      .eq("id", latestMembership.id);

    if (membershipError) {
      redirectWithNotice(memberId, "membership_revoke_failed");
    }
  }

  const { error: memberError } = await supabase
    .from("members")
    .update({
      is_active: false,
      updated_at: new Date().toISOString(),
    })
    .eq("id", memberId);

  if (memberError) {
    redirectWithNotice(memberId, "membership_revoke_failed");
  }

  revalidateMemberPaths(memberId);
  redirectWithNotice(memberId, "membership_revoked");
}

export async function addManualPayment(formData: FormData) {
  await requireAdmin();

  const memberId = requiredText(formData.get("memberId"));

  if (!hasSupabaseAdminConfig()) {
    redirectWithNotice(memberId, "missing_supabase_admin");
  }

  const amountCop = optionalInteger(formData.get("amountCop"));
  const paidAt = requiredText(formData.get("paidAt"));
  const periodStart = requiredText(formData.get("periodStart"));
  const periodEnd = requiredText(formData.get("periodEnd"));
  const method = requiredText(formData.get("method"));
  const source = requiredText(formData.get("source"));
  const notes = optionalText(formData.get("notes"));

  if (
    !amountCop ||
    amountCop <= 0 ||
    !isDateKey(paidAt) ||
    !isDateKey(periodStart) ||
    !isDateKey(periodEnd) ||
    periodEnd < periodStart ||
    !paymentMethods.has(method) ||
    !paymentSources.has(source)
  ) {
    redirectWithNotice(memberId, "invalid_payment");
  }

  const supabase = createAdminClient();
  const { error: paymentError } = await supabase.from("payments").insert({
    amount_cop: amountCop,
    member_id: memberId,
    method: method as "cash" | "transfer" | "nequi" | "daviplata" | "other",
    notes,
    paid_at: paidAt,
    period_end: periodEnd,
    period_start: periodStart,
    source: source as "whatsapp" | "front_desk" | "manual",
  });

  if (paymentError) {
    redirectWithNotice(memberId, "payment_failed");
  }

  const { error: membershipError } = await supabase.from("memberships").insert({
    end_date: periodEnd,
    member_id: memberId,
    start_date: periodStart,
    status: "active",
  });

  if (membershipError) {
    redirectWithNotice(memberId, "payment_membership_failed");
  }

  await supabase
    .from("members")
    .update({
      is_active: true,
      updated_at: new Date().toISOString(),
    })
    .eq("id", memberId);

  revalidateMemberPaths(memberId);
  redirectWithNotice(memberId, "payment_added");
}

export async function deleteMemberAccount(formData: FormData) {
  await requireAdmin();

  const memberId = requiredText(formData.get("memberId"));

  if (!hasSupabaseAdminConfig()) {
    redirectWithNotice(memberId, "missing_supabase_admin");
  }

  const confirmation = requiredText(formData.get("confirmation")).toLowerCase();
  const supabase = createAdminClient();
  const { data: member, error: memberReadError } = await supabase
    .from("members")
    .select("email,user_id")
    .eq("id", memberId)
    .maybeSingle();

  if (memberReadError || !member) {
    redirectWithNotice(memberId, "member_delete_failed");
  }

  if (confirmation !== member.email.toLowerCase()) {
    redirectWithNotice(memberId, "invalid_delete_confirmation");
  }

  const { error: memberDeleteError } = await supabase
    .from("members")
    .delete()
    .eq("id", memberId);

  if (memberDeleteError) {
    redirectWithNotice(memberId, "member_delete_failed");
  }

  if (member.user_id) {
    const { error: authDeleteError } = await supabase.auth.admin.deleteUser(
      member.user_id,
    );

    if (authDeleteError) {
      revalidateAdminListPaths();
      redirect("/admin/clientas?notice=member_deleted_auth_failed");
    }
  }

  revalidateAdminListPaths();
  redirect("/admin/clientas?notice=member_deleted");
}

function requiredText(value: FormDataEntryValue | null) {
  return String(value ?? "").trim();
}

function optionalText(value: FormDataEntryValue | null) {
  const text = requiredText(value);

  return text || null;
}

function optionalNumber(value: FormDataEntryValue | null) {
  const text = requiredText(value);

  if (!text) {
    return null;
  }

  const number = Number(text);

  return Number.isFinite(number) ? number : null;
}

function optionalInteger(value: FormDataEntryValue | null) {
  const number = optionalNumber(value);

  return number === null ? null : Math.trunc(number);
}

function isDateKey(value: string) {
  return /^\d{4}-\d{2}-\d{2}$/.test(value);
}

function dateKey(date: Date) {
  return date.toISOString().slice(0, 10);
}

function revalidateMemberPaths(memberId: string) {
  revalidateAdminListPaths();
  revalidatePath(`/clientes/${memberId}`);
}

function revalidateAdminListPaths() {
  revalidatePath("/admin");
  revalidatePath("/admin/clientas");
}

function redirectWithNotice(memberId: string, notice: string): never {
  redirect(`/clientes/${memberId}?notice=${notice}`);
}
