"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { isValidEmail } from "@/lib/bulk-invite";
import { hasEmailConfig, sendPasswordResetEmail } from "@/lib/email";
import { getSiteUrl } from "@/lib/site";
import { createAdminClient, hasSupabaseAdminConfig } from "@/utils/supabase/admin";

const forgotPasswordPath = "/forgot-password";

export async function requestPasswordReset(formData: FormData) {
  const email = String(formData.get("email") ?? "")
    .trim()
    .toLowerCase();

  if (!email || !isValidEmail(email)) {
    redirectWithNotice("invalid_email");
  }

  if (!hasSupabaseAdminConfig()) {
    redirectWithNotice("missing_supabase_admin");
  }

  if (!hasEmailConfig()) {
    redirectWithNotice("missing_email_config");
  }

  const supabase = createAdminClient();
  const fullName = await getProfileNameByEmail(supabase, email);
  const { data: recoveryLink, error: recoveryLinkError } =
    await supabase.auth.admin.generateLink({
      email,
      type: "recovery",
    });

  if (recoveryLinkError || !recoveryLink.properties?.hashed_token) {
    console.error("ATLETIX password reset link failed", recoveryLinkError);
    redirectWithNotice("sent");
  }

  const siteUrl = await getPasswordResetSiteUrl();
  const resetUrl = new URL("/auth/confirm", siteUrl);
  resetUrl.searchParams.set("token_hash", recoveryLink.properties.hashed_token);
  resetUrl.searchParams.set("type", "recovery");
  resetUrl.searchParams.set("next", "/reset-password");

  try {
    await sendPasswordResetEmail({
      actionUrl: resetUrl.toString(),
      email,
      fullName,
      loginUrl: `${siteUrl}/login`,
    });
  } catch (error) {
    console.error("ATLETIX password reset email failed", error);
    redirectWithNotice("send_failed");
  }

  redirectWithNotice("sent");
}

async function getProfileNameByEmail(
  supabase: ReturnType<typeof createAdminClient>,
  email: string,
) {
  const { data, error } = await supabase
    .from("profiles")
    .select("full_name")
    .eq("email", email)
    .maybeSingle();

  if (error) {
    console.error("ATLETIX password reset profile lookup failed", error);
  }

  return data?.full_name ?? null;
}

async function getPasswordResetSiteUrl() {
  const headerStore = await headers();
  const forwardedHost = headerStore.get("x-forwarded-host");
  const host = forwardedHost ?? headerStore.get("host");

  if (!host || !isLocalHost(host)) {
    return getSiteUrl();
  }

  const protocol = headerStore.get("x-forwarded-proto") ?? "http";
  return `${protocol}://${host}`;
}

function isLocalHost(host: string) {
  const hostname = host.split(":")[0];
  return (
    hostname === "localhost" ||
    hostname === "127.0.0.1" ||
    hostname === "0.0.0.0"
  );
}

function redirectWithNotice(notice: string): never {
  redirect(`${forgotPasswordPath}?notice=${notice}`);
}
