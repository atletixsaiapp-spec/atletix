"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/auth";
import { createAdminClient, hasSupabaseAdminConfig } from "@/utils/supabase/admin";

const groupsPath = "/admin/grupos";

export async function createTrainingGroup(formData: FormData) {
  await requireAdmin();

  if (!hasSupabaseAdminConfig()) {
    redirectWithNotice("missing_supabase_admin");
  }

  const name = requiredText(formData.get("name"));
  const startTime = normalizeTime(formData.get("startTime"));
  const capacity = positiveInteger(formData.get("capacity"));

  if (!name || !startTime || !capacity) {
    redirectWithNotice("invalid_group");
  }

  const supabase = createAdminClient();
  const { error } = await supabase.from("training_groups").insert({
    capacity,
    name,
    sort_order: timeToSortOrder(startTime),
    start_time: startTime,
  });

  if (error) {
    redirectWithNotice("group_create_failed");
  }

  revalidateGroups();
  redirectWithNotice("group_created");
}

export async function updateTrainingGroup(formData: FormData) {
  await requireAdmin();

  if (!hasSupabaseAdminConfig()) {
    redirectWithNotice("missing_supabase_admin");
  }

  const groupId = requiredText(formData.get("groupId"));
  const name = requiredText(formData.get("name"));
  const startTime = normalizeTime(formData.get("startTime"));
  const capacity = positiveInteger(formData.get("capacity"));
  const isActive = formData.get("isActive") === "on";

  if (!isUuid(groupId) || !name || !startTime || !capacity) {
    redirectWithNotice("invalid_group");
  }

  const supabase = createAdminClient();
  const { error } = await supabase
    .from("training_groups")
    .update({
      capacity,
      is_active: isActive,
      name,
      sort_order: timeToSortOrder(startTime),
      start_time: startTime,
      updated_at: new Date().toISOString(),
    })
    .eq("id", groupId);

  if (error) {
    redirectWithNotice("group_update_failed");
  }

  revalidateGroups();
  redirectWithNotice("group_updated");
}

export async function deleteTrainingGroup(formData: FormData) {
  await requireAdmin();

  if (!hasSupabaseAdminConfig()) {
    redirectWithNotice("missing_supabase_admin");
  }

  const groupId = requiredText(formData.get("groupId"));

  if (!isUuid(groupId)) {
    redirectWithNotice("invalid_group");
  }

  const supabase = createAdminClient();
  const { error } = await supabase
    .from("training_groups")
    .delete()
    .eq("id", groupId);

  if (error) {
    redirectWithNotice("group_delete_failed");
  }

  revalidateGroups();
  redirectWithNotice("group_deleted");
}

function requiredText(value: FormDataEntryValue | null) {
  return String(value ?? "").trim();
}

function positiveInteger(value: FormDataEntryValue | null) {
  const number = Number(requiredText(value));

  return Number.isInteger(number) && number > 0 ? number : null;
}

function normalizeTime(value: FormDataEntryValue | null) {
  const text = requiredText(value);

  return /^\d{2}:\d{2}$/.test(text) ? text : null;
}

function timeToSortOrder(value: string) {
  const [hours = "0", minutes = "0"] = value.split(":");

  return Number(hours) * 60 + Number(minutes);
}

function isUuid(value: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    value,
  );
}

function revalidateGroups() {
  revalidatePath(groupsPath);
  revalidatePath("/admin");
  revalidatePath("/onboarding");
}

function redirectWithNotice(notice: string): never {
  redirect(`${groupsPath}?notice=${notice}`);
}
