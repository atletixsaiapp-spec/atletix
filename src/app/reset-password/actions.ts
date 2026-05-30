"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import {
  getMemberOnboardingRecord,
  isMemberOnboardingComplete,
} from "@/lib/auth";
import { createClient } from "@/utils/supabase/server";

export async function updatePassword(formData: FormData) {
  const password = String(formData.get("password") ?? "");
  const confirmPassword = String(formData.get("confirmPassword") ?? "");

  if (password.length < 8) {
    redirectWithNotice("password_short");
  }

  if (password !== confirmPassword) {
    redirectWithNotice("password_mismatch");
  }

  const supabase = createClient(await cookies());
  const { data: userData, error: userError } = await supabase.auth.getUser();

  if (userError || !userData.user) {
    redirectWithNotice("missing_session");
  }

  const { error } = await supabase.auth.updateUser({ password });

  if (error) {
    console.error("ATLETIX password update failed", error);
    redirectWithNotice("update_failed");
  }

  const member = await getMemberOnboardingRecord(supabase, userData.user.id);
  redirect(isMemberOnboardingComplete(member) ? "/dashboard" : "/onboarding");
}

function redirectWithNotice(notice: string): never {
  redirect(`/reset-password?notice=${notice}`);
}
