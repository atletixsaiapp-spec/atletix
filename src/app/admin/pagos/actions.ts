"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/auth";
import {
  createAdminClient,
  hasSupabaseAdminConfig,
} from "@/utils/supabase/admin";

const adminPaymentsPath = "/admin/pagos";
const paymentMethods = new Set([
  "cash",
  "transfer",
  "nequi",
  "daviplata",
  "other",
]);

export async function approvePayment(formData: FormData) {
  const { user } = await requireAdmin();

  if (!hasSupabaseAdminConfig()) {
    redirectWithNotice("missing_supabase_admin");
  }

  const paymentId = requiredText(formData.get("paymentId"));
  const memberId = requiredText(formData.get("memberId"));
  const amountCop = positiveInteger(formData.get("amountCop"));
  const paidAt = requiredText(formData.get("paidAt"));
  const periodStart = requiredText(formData.get("periodStart"));
  const periodEnd = requiredText(formData.get("periodEnd"));
  const method = requiredText(formData.get("method"));
  const membershipPlanIdInput = formData.get("membershipPlanId");
  const notes = optionalText(formData.get("notes"));

  if (
    !isUuid(paymentId) ||
    !isUuid(memberId) ||
    !amountCop ||
    !isDateKey(paidAt) ||
    !isDateKey(periodStart) ||
    !isDateKey(periodEnd) ||
    periodEnd < periodStart ||
    !paymentMethods.has(method)
  ) {
    redirectWithNotice("invalid_payment_review");
  }

  const supabase = createAdminClient();
  const membershipPlanId = await resolveMembershipPlanId(
    supabase,
    membershipPlanIdInput,
  );
  const reviewerId = isUuid(user.id) ? user.id : null;
  const now = new Date().toISOString();
  const { error: paymentError } = await supabase
    .from("payments")
    .update({
      amount_cop: amountCop,
      confirmed_by: reviewerId,
      method: method as "cash" | "transfer" | "nequi" | "daviplata" | "other",
      notes,
      paid_at: paidAt,
      period_end: periodEnd,
      period_start: periodStart,
      reviewed_at: now,
      source: "manual",
      status: "approved",
    })
    .eq("id", paymentId)
    .eq("member_id", memberId);

  if (paymentError) {
    redirectWithNotice("payment_approve_failed");
  }

  const { error: membershipError } = await supabase.from("memberships").insert({
    end_date: periodEnd,
    member_id: memberId,
    membership_plan_id: membershipPlanId,
    start_date: periodStart,
    status: "active",
  });

  if (membershipError) {
    redirectWithNotice("payment_membership_failed");
  }

  const { error: memberError } = await supabase
    .from("members")
    .update({
      is_active: true,
      membership_plan_id: membershipPlanId,
      updated_at: now,
    })
    .eq("id", memberId);

  if (memberError) {
    redirectWithNotice("payment_membership_failed");
  }

  revalidatePaymentPaths(memberId);
  redirectWithNotice("payment_approved");
}

export async function rejectPayment(formData: FormData) {
  const { user } = await requireAdmin();

  if (!hasSupabaseAdminConfig()) {
    redirectWithNotice("missing_supabase_admin");
  }

  const paymentId = requiredText(formData.get("paymentId"));
  const memberId = requiredText(formData.get("memberId"));
  const notes = optionalText(formData.get("notes"));

  if (!isUuid(paymentId) || !isUuid(memberId)) {
    redirectWithNotice("invalid_payment_review");
  }

  const supabase = createAdminClient();
  const { error } = await supabase
    .from("payments")
    .update({
      confirmed_by: isUuid(user.id) ? user.id : null,
      notes,
      reviewed_at: new Date().toISOString(),
      status: "rejected",
    })
    .eq("id", paymentId)
    .eq("member_id", memberId);

  if (error) {
    redirectWithNotice("payment_reject_failed");
  }

  revalidatePaymentPaths(memberId);
  redirectWithNotice("payment_rejected");
}

function requiredText(value: FormDataEntryValue | null) {
  return String(value ?? "").trim();
}

function optionalText(value: FormDataEntryValue | null) {
  const text = requiredText(value);

  return text || null;
}

function positiveInteger(value: FormDataEntryValue | null) {
  const number = Number(requiredText(value));

  return Number.isInteger(number) && number > 0 ? number : null;
}

async function resolveMembershipPlanId(
  supabase: ReturnType<typeof createAdminClient>,
  value: FormDataEntryValue | null,
) {
  const membershipPlanId = optionalText(value);

  if (!membershipPlanId) {
    return null;
  }

  const { data, error } = await supabase
    .from("membership_plans")
    .select("id")
    .eq("id", membershipPlanId)
    .eq("is_active", true)
    .maybeSingle();

  if (error || !data) {
    redirectWithNotice("invalid_membership_plan");
  }

  return data.id;
}

function isDateKey(value: string) {
  return /^\d{4}-\d{2}-\d{2}$/.test(value);
}

function isUuid(value: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    value,
  );
}

function revalidatePaymentPaths(memberId: string) {
  revalidatePath(adminPaymentsPath);
  revalidatePath("/admin");
  revalidatePath("/admin/cuentas");
  revalidatePath(`/cuentas/${memberId}`);
  revalidatePath("/dashboard");
  revalidatePath("/pagos");
}

function redirectWithNotice(notice: string): never {
  redirect(`${adminPaymentsPath}?notice=${notice}`);
}
