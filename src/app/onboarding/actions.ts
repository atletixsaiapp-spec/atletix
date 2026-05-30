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
  const { supabase: userSupabase, user } = await requireUser();

  if (!hasSupabaseAdminConfig()) {
    redirectWithNotice("missing_supabase_admin", false);
  }

  const shouldSetPassword = formData.get("passwordSetup") === "true";
  const password = String(formData.get("password") ?? "");
  const confirmPassword = String(formData.get("confirmPassword") ?? "");
  const fullName = requiredText(formData.get("fullName"));
  const phone = requiredText(formData.get("phone"));
  const dateOfBirth = requiredText(formData.get("dateOfBirth"));
  const goal = requiredText(formData.get("goal"));
  const gender = optionalText(formData.get("gender"));
  const groupId = requiredText(formData.get("groupId"));
  const heightCm = positiveNumber(formData.get("heightCm"));
  const currentWeightKg = positiveNumber(formData.get("currentWeightKg"));

  if (
    !fullName ||
    !phone ||
    !isRealDate(dateOfBirth) ||
    !goals.has(goal) ||
    !genders.has(gender ?? "") ||
    !isUuid(groupId) ||
    heightCm === null ||
    currentWeightKg === null
  ) {
    redirectWithNotice("invalid_onboarding", shouldSetPassword);
  }

  if (shouldSetPassword) {
    if (password.length < 8) {
      redirectWithNotice("password_short", shouldSetPassword);
    }

    if (password !== confirmPassword) {
      redirectWithNotice("password_mismatch", shouldSetPassword);
    }

    const { error: passwordError } = await userSupabase.auth.updateUser({
      password,
    });

    if (passwordError && !isSamePasswordError(passwordError)) {
      console.error("ATLETIX onboarding password update failed", passwordError);
      redirectWithNotice("password_update_failed", shouldSetPassword);
    }
  }

  const supabase = createAdminClient();
  const { data: member, error: memberReadError } = await supabase
    .from("members")
    .select("id,email,group_id,initial_weight_kg")
    .eq("user_id", user.id)
    .maybeSingle();

  if (memberReadError || !member) {
    redirectWithNotice("missing_member", shouldSetPassword);
  }

  const groupValidationError = await validateTrainingGroupSelection({
    currentGroupId: member.group_id,
    groupId,
    supabase,
  });

  if (groupValidationError) {
    redirectWithNotice(groupValidationError, shouldSetPassword);
  }

  const baselineWeightKg =
    positiveNumber(member.initial_weight_kg) ?? currentWeightKg;

  const { error: memberError } = await supabase
    .from("members")
    .update({
      current_weight_kg: currentWeightKg,
      date_of_birth: dateOfBirth,
      full_name: fullName,
      goal,
      group_id: groupId,
      height_cm: heightCm,
      initial_weight_kg: baselineWeightKg,
      phone,
      updated_at: new Date().toISOString(),
    })
    .eq("id", member.id);

  if (memberError) {
    redirectWithNotice("member_update_failed", shouldSetPassword);
  }

  const progressError = await saveInitialProgressEntry({
    memberId: member.id,
    supabase,
    weightKg: currentWeightKg,
  });

  if (progressError) {
    redirectWithNotice("progress_update_failed", shouldSetPassword);
  }

  const { error: profileError } = await supabase
    .from("profiles")
    .update({
      full_name: fullName,
      phone,
    })
    .eq("id", user.id);

  if (profileError) {
    redirectWithNotice("profile_update_failed", shouldSetPassword);
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
    redirectWithNotice("profile_update_failed", shouldSetPassword);
  }

  redirect("/dashboard");
}

function isSamePasswordError(error: { code?: string }) {
  return error.code === "same_password";
}

function redirectWithNotice(notice: string, passwordSetup: boolean): never {
  redirect(`/onboarding?notice=${notice}${passwordSetup ? "&setup=1" : ""}`);
}

function requiredText(value: FormDataEntryValue | null) {
  return String(value ?? "").trim();
}

function optionalText(value: FormDataEntryValue | null) {
  const text = requiredText(value);

  return text || null;
}

function positiveNumber(value: unknown) {
  const text =
    typeof value === "number"
      ? String(value)
      : requiredText(value as FormDataEntryValue);

  if (!text) {
    return null;
  }

  const number = Number(text);

  return Number.isFinite(number) && number > 0 ? number : null;
}

async function saveInitialProgressEntry({
  memberId,
  supabase,
  weightKg,
}: {
  memberId: string;
  supabase: ReturnType<typeof createAdminClient>;
  weightKg: number;
}) {
  const entryDate = getBogotaDateKey();
  const { data: existingEntry, error: readError } = await supabase
    .from("progress_entries")
    .select("id")
    .eq("member_id", memberId)
    .eq("entry_date", entryDate)
    .limit(1)
    .maybeSingle();

  if (readError) {
    return readError;
  }

  if (existingEntry) {
    const { error } = await supabase
      .from("progress_entries")
      .update({ weight_kg: weightKg })
      .eq("id", existingEntry.id);

    return error;
  }

  const { error } = await supabase.from("progress_entries").insert({
    entry_date: entryDate,
    member_id: memberId,
    weight_kg: weightKg,
  });

  return error;
}

function getBogotaDateKey() {
  const parts = new Intl.DateTimeFormat("en", {
    day: "2-digit",
    month: "2-digit",
    timeZone: "America/Bogota",
    year: "numeric",
  }).formatToParts(new Date());
  const values = Object.fromEntries(parts.map((part) => [part.type, part.value]));

  return `${values.year}-${values.month}-${values.day}`;
}

async function validateTrainingGroupSelection({
  currentGroupId,
  groupId,
  supabase,
}: {
  currentGroupId: string | null;
  groupId: string;
  supabase: ReturnType<typeof createAdminClient>;
}) {
  const { data: group, error: groupError } = await supabase
    .from("training_groups")
    .select("id,capacity,is_active")
    .eq("id", groupId)
    .maybeSingle();

  if (groupError || !group?.is_active) {
    return "invalid_group";
  }

  if (currentGroupId === groupId) {
    return null;
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

function isUuid(value: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    value,
  );
}
