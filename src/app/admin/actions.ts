"use server";

import crypto from "node:crypto";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/auth";
import { hasEmailConfig, sendWelcomeEmail } from "@/lib/email";
import { getSiteUrl } from "@/lib/site";
import { createAdminClient, hasSupabaseAdminConfig } from "@/utils/supabase/admin";

const goals = new Set([
  "Bajar grasa",
  "Ganar masa muscular",
  "Tonificar",
  "Fuerza",
  "Salud general",
]);

export async function createMemberAccount(formData: FormData) {
  await requireAdmin();

  if (!hasSupabaseAdminConfig()) {
    redirectWithNotice("missing_supabase_admin");
  }

  const fullName = String(formData.get("fullName") ?? "").trim();
  const email = String(formData.get("email") ?? "")
    .trim()
    .toLowerCase();
  const phone = String(formData.get("phone") ?? "").trim();
  const dateOfBirth = optionalString(formData.get("dateOfBirth"));
  const goal = String(formData.get("goal") ?? "").trim();
  const heightCm = optionalNumber(formData.get("heightCm"));
  const initialWeightKg = optionalNumber(formData.get("initialWeightKg"));

  if (!fullName || !email || !phone || !goals.has(goal)) {
    redirectWithNotice("invalid_member_form");
  }

  const supabase = createAdminClient();
  const temporaryPassword = crypto.randomBytes(24).toString("base64url");
  const siteUrl = getSiteUrl();
  const loginUrl = `${siteUrl}/login`;
  const resetUrl = `${siteUrl}/reset-password`;

  const { data: createdUser, error: createUserError } =
    await supabase.auth.admin.createUser({
      email,
      email_confirm: true,
      password: temporaryPassword,
      user_metadata: {
        full_name: fullName,
        phone,
      },
    });

  if (createUserError || !createdUser.user) {
    redirectWithNotice("member_auth_failed");
  }

  const userId = createdUser.user.id;

  const { error: profileError } = await supabase.from("profiles").upsert({
    email,
    full_name: fullName,
    id: userId,
    phone,
    role: "member",
  });

  if (profileError) {
    await supabase.auth.admin.deleteUser(userId);
    redirectWithNotice("member_profile_failed");
  }

  const { error: memberError } = await supabase.from("members").insert({
    current_weight_kg: initialWeightKg,
    date_of_birth: dateOfBirth,
    email,
    full_name: fullName,
    goal,
    height_cm: heightCm,
    initial_weight_kg: initialWeightKg,
    phone,
    user_id: userId,
  });

  if (memberError) {
    await supabase.auth.admin.deleteUser(userId);
    redirectWithNotice("member_record_failed");
  }

  if (!hasEmailConfig()) {
    revalidatePath("/admin");
    revalidatePath("/admin/clientas");
    revalidatePath("/admin/clientas/nueva");
    redirectWithNotice("member_created_email_missing");
  }

  const { data: recoveryLink, error: recoveryLinkError } =
    await supabase.auth.admin.generateLink({
      email,
      options: {
        redirectTo: resetUrl,
      },
      type: "recovery",
    });

  if (recoveryLinkError || !recoveryLink.properties?.action_link) {
    revalidatePath("/admin");
    revalidatePath("/admin/clientas");
    revalidatePath("/admin/clientas/nueva");
    redirectWithNotice("member_created_link_failed");
  }

  try {
    await sendWelcomeEmail({
      actionUrl: recoveryLink.properties.action_link,
      email,
      fullName,
      loginUrl,
    });
  } catch {
    revalidatePath("/admin");
    revalidatePath("/admin/clientas");
    revalidatePath("/admin/clientas/nueva");
    redirectWithNotice("member_created_email_failed");
  }

  revalidatePath("/admin");
  revalidatePath("/admin/clientas");
  revalidatePath("/admin/clientas/nueva");
  redirectWithNotice("member_created");
}

function optionalString(value: FormDataEntryValue | null) {
  const text = String(value ?? "").trim();

  return text || null;
}

function optionalNumber(value: FormDataEntryValue | null) {
  const text = String(value ?? "").trim();

  if (!text) {
    return null;
  }

  const number = Number(text);

  return Number.isFinite(number) ? number : null;
}

function redirectWithNotice(notice: string): never {
  redirect(`/admin/clientas/nueva?notice=${notice}`);
}
