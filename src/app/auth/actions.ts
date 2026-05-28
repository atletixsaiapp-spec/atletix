"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import {
  clearAdminSessionCookie,
  createAdminSessionCookie,
  getAdminCredentials,
  isAdminCredentialMatch,
} from "@/lib/admin-session";
import {
  getMemberOnboardingRecord,
  isMemberOnboardingComplete,
} from "@/lib/auth";

export async function signIn(formData: FormData) {
  const password = String(formData.get("password") ?? "");
  const role = formData.get("role") === "admin" ? "admin" : "member";

  if (role === "admin") {
    const username = String(formData.get("username") ?? "").trim();

    if (!username || !password) {
      redirect("/admin/login?error=missing_credentials");
    }

    if (!getAdminCredentials()) {
      redirect("/admin/login?error=admin_not_configured");
    }

    if (!isAdminCredentialMatch({ password, username })) {
      redirect("/admin/login?error=invalid_credentials");
    }

    createAdminSessionCookie(await cookies());
    redirect("/admin");
  }

  const email = String(formData.get("email") ?? "").trim();

  if (!email || !password) {
    redirect("/login?error=missing_credentials");
  }

  const supabase = createClient(await cookies());
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    redirect("/login?error=invalid_credentials");
  }

  if (data.user) {
    const member = await getMemberOnboardingRecord(supabase, data.user.id);

    if (!isMemberOnboardingComplete(member)) {
      redirect("/onboarding");
    }
  }

  redirect("/dashboard");
}

export async function signOut(formData: FormData) {
  const destination =
    formData.get("destination") === "admin" ? "/admin/login" : "/login";
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  clearAdminSessionCookie(cookieStore);
  await supabase.auth.signOut();

  redirect(destination);
}
