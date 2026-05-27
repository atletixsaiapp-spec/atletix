"use server";

import { redirect } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { createAdminClient, hasSupabaseAdminConfig } from "@/utils/supabase/admin";

const goals = new Set([
  "Bajar grasa",
  "Ganar masa muscular",
  "Tonificar",
  "Fuerza",
  "Salud general",
]);

const genders = new Set(["", "woman", "man", "non_binary", "other", "prefer_not"]);

export async function completeOnboarding(formData: FormData) {
  const { user } = await requireUser();

  if (!hasSupabaseAdminConfig()) {
    redirect("/onboarding?notice=missing_supabase_admin");
  }

  const fullName = requiredText(formData.get("fullName"));
  const phone = requiredText(formData.get("phone"));
  const dateOfBirth = requiredText(formData.get("dateOfBirth"));
  const goal = requiredText(formData.get("goal"));
  const gender = optionalText(formData.get("gender"));
  const heightCm = optionalNumber(formData.get("heightCm"));
  const initialWeightKg = optionalNumber(formData.get("initialWeightKg"));
  const currentWeightKg = optionalNumber(formData.get("currentWeightKg"));

  if (
    !fullName ||
    !phone ||
    !isRealDate(dateOfBirth) ||
    !goals.has(goal) ||
    !genders.has(gender ?? "") ||
    heightCm === null ||
    initialWeightKg === null ||
    currentWeightKg === null
  ) {
    redirect("/onboarding?notice=invalid_onboarding");
  }

  const supabase = createAdminClient();
  const { data: member, error: memberReadError } = await supabase
    .from("members")
    .select("id,email")
    .eq("user_id", user.id)
    .maybeSingle();

  if (memberReadError || !member) {
    redirect("/onboarding?notice=missing_member");
  }

  const { error: memberError } = await supabase
    .from("members")
    .update({
      current_weight_kg: currentWeightKg,
      date_of_birth: dateOfBirth,
      full_name: fullName,
      goal,
      height_cm: heightCm,
      initial_weight_kg: initialWeightKg,
      phone,
      updated_at: new Date().toISOString(),
    })
    .eq("id", member.id);

  if (memberError) {
    redirect("/onboarding?notice=member_update_failed");
  }

  const { error: profileError } = await supabase
    .from("profiles")
    .update({
      full_name: fullName,
      phone,
    })
    .eq("id", user.id);

  if (profileError) {
    redirect("/onboarding?notice=profile_update_failed");
  }

  const metadata = {
    ...(user.user_metadata ?? {}),
    full_name: fullName,
    gender,
    phone,
  };

  const { error: authMetadataError } = await supabase.auth.admin.updateUserById(
    user.id,
    {
      user_metadata: metadata,
    },
  );

  if (authMetadataError) {
    redirect("/onboarding?notice=profile_update_failed");
  }

  redirect("/dashboard");
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

  return Number.isFinite(number) && number > 0 ? number : null;
}

function isRealDate(value: string) {
  const match = value.match(/^(\d{4})-(\d{2})-(\d{2})$/);

  if (!match) {
    return false;
  }

  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const date = new Date(Date.UTC(year, month - 1, day));

  return (
    date.getUTCFullYear() === year &&
    date.getUTCMonth() === month - 1 &&
    date.getUTCDate() === day
  );
}
