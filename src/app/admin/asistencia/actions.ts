"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { verifyAttendanceToken } from "@/lib/attendance-qr";
import { getBogotaDayRange } from "@/lib/admin-attendance";
import { requireAdmin } from "@/lib/auth";
import { createAdminClient, hasSupabaseAdminConfig } from "@/utils/supabase/admin";

const attendancePath = "/admin/asistencia";

export async function trackAttendanceFromQr(formData: FormData) {
  await requireAdmin();

  if (!hasSupabaseAdminConfig()) {
    redirectWithNotice("missing_supabase_admin");
  }

  const qrToken = requiredText(formData.get("qrToken"));
  const verified = verifyAttendanceToken(qrToken);

  if (!verified) {
    redirectWithNotice("invalid_qr");
  }

  await recordAttendance(verified.memberId, "qr");
}

export async function trackAttendanceManually(formData: FormData) {
  await requireAdmin();

  if (!hasSupabaseAdminConfig()) {
    redirectWithNotice("missing_supabase_admin");
  }

  const memberId = requiredText(formData.get("memberId"));

  if (!isUuid(memberId)) {
    redirectWithNotice("invalid_member");
  }

  await recordAttendance(memberId, "manual");
}

async function recordAttendance(memberId: string, source: "manual" | "qr") {
  const supabase = createAdminClient();
  const { data: member, error: memberError } = await supabase
    .from("members")
    .select("id,full_name,group_id,is_active")
    .eq("id", memberId)
    .maybeSingle();

  if (memberError || !member) {
    redirectWithNotice("invalid_member");
  }

  const { start, end } = getBogotaDayRange(new Date());
  const { data: existingLog, error: existingLogError } = await supabase
    .from("workout_logs")
    .select("id")
    .eq("member_id", memberId)
    .gte("completed_at", start.toISOString())
    .lt("completed_at", end.toISOString())
    .limit(1)
    .maybeSingle();

  if (existingLogError) {
    redirectWithNotice("attendance_failed");
  }

  if (existingLog) {
    redirectWithNotice("attendance_duplicate", member.full_name);
  }

  const { error: insertError } = await supabase.from("workout_logs").insert({
    completed_at: new Date().toISOString(),
    group_id: member.group_id,
    member_id: memberId,
    notes: `Asistencia registrada por ${source === "qr" ? "QR" : "seleccion manual"}.`,
    xp_awarded: 50,
  });

  if (insertError) {
    redirectWithNotice("attendance_failed");
  }

  revalidatePath("/admin");
  revalidatePath(attendancePath);
  revalidatePath(`/cuentas/${memberId}`);
  revalidatePath("/dashboard");
  redirectWithNotice("attendance_registered", member.full_name);
}

function redirectWithNotice(notice: string, memberName?: string): never {
  const params = new URLSearchParams({ notice });

  if (memberName) {
    params.set("member", memberName);
  }

  redirect(`${attendancePath}?${params.toString()}`);
}

function requiredText(value: FormDataEntryValue | null) {
  return String(value ?? "").trim();
}

function isUuid(value: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    value,
  );
}
