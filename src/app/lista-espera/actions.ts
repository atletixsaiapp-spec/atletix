"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { isValidEmail, normalizeBirthDate } from "@/lib/bulk-invite";
import {
  createAdminClient,
  hasSupabaseAdminConfig,
} from "@/utils/supabase/admin";

const waitlistPath = "/lista-espera";

export async function joinWaitlist(formData: FormData) {
  if (!hasSupabaseAdminConfig()) {
    redirectWithNotice("missing_supabase_admin");
  }

  const fullName = requiredText(formData.get("fullName"));
  const email = requiredText(formData.get("email")).toLowerCase();
  const phone = requiredText(formData.get("phone"));
  const dateOfBirth = normalizeBirthDate(
    requiredText(formData.get("dateOfBirth")),
  );
  const preferredGroupId = optionalText(formData.get("preferredGroupId"));
  const notes = trimToLength(optionalText(formData.get("notes")), 500);

  if (
    !fullName ||
    !email ||
    !isValidEmail(email) ||
    !phone ||
    !dateOfBirth ||
    (preferredGroupId && !isUuid(preferredGroupId))
  ) {
    redirectWithNotice("invalid_waitlist");
  }

  const supabase = createAdminClient();

  if (preferredGroupId) {
    const { data: group, error: groupError } = await supabase
      .from("training_groups")
      .select("id")
      .eq("id", preferredGroupId)
      .eq("is_active", true)
      .maybeSingle();

    if (groupError || !group) {
      redirectWithNotice("invalid_group");
    }
  }

  const { data: existingMember, error: memberError } = await supabase
    .from("members")
    .select("id")
    .eq("email", email)
    .maybeSingle();

  if (memberError) {
    redirectWithNotice("waitlist_failed");
  }

  if (existingMember) {
    redirectWithNotice("already_member");
  }

  const { error } = await supabase.from("waitlist_entries").insert({
    date_of_birth: dateOfBirth,
    email,
    full_name: fullName,
    notes,
    phone,
    preferred_group_id: preferredGroupId,
  });

  if (error) {
    redirectWithNotice(
      error.code === "23505" ? "waitlist_duplicate" : "waitlist_failed",
    );
  }

  revalidatePath("/admin/lista-espera");
  redirectWithNotice("waitlist_joined");
}

function requiredText(value: FormDataEntryValue | null) {
  return String(value ?? "").trim();
}

function optionalText(value: FormDataEntryValue | null) {
  const text = requiredText(value);

  return text || null;
}

function trimToLength(value: string | null, maxLength: number) {
  return value ? value.slice(0, maxLength) : null;
}

function isUuid(value: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    value,
  );
}

function redirectWithNotice(notice: string): never {
  redirect(`${waitlistPath}?notice=${notice}`);
}
