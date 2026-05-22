"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import {
  createAdminSessionCookie,
  getAdminCredentials,
  isAdminCredentialMatch,
} from "@/lib/admin-session";

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
  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    redirect("/login?error=invalid_credentials");
  }

  redirect("/dashboard");
}
