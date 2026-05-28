"use server";

import crypto from "node:crypto";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/auth";
import {
  isValidEmail,
  normalizeBirthDate,
  parseBulkContacts,
  parseBulkContactsJson,
} from "@/lib/bulk-invite";
import { hasEmailConfig, sendWelcomeEmail } from "@/lib/email";
import { getSiteUrl } from "@/lib/site";
import { createAdminClient, hasSupabaseAdminConfig } from "@/utils/supabase/admin";

const defaultInviteGoal = "Salud general";
const createClientPath = "/admin/clientas/nueva";
const importClientPath = "/admin/clientas/importar";

type InviteMemberInput = {
  dateOfBirth: string | null;
  email: string;
  fullName: string;
  phone: string;
};

type InviteMemberResult =
  | { status: "created"; emailSent: boolean }
  | {
      status:
        | "auth_failed"
        | "duplicate"
        | "link_failed"
        | "profile_failed"
        | "record_failed";
    emailSent: false;
  }
  | { status: "email_failed"; emailSent: false };

export async function createMemberAccount(formData: FormData) {
  await requireAdmin();

  if (!hasSupabaseAdminConfig()) {
    redirectWithNotice(createClientPath, "missing_supabase_admin");
  }

  const fullName = String(formData.get("fullName") ?? "").trim();
  const email = String(formData.get("email") ?? "")
    .trim()
    .toLowerCase();
  const phone = String(formData.get("phone") ?? "").trim();
  const dateOfBirth = normalizeBirthDate(String(formData.get("dateOfBirth") ?? ""));

  if (!fullName || !email || !phone || !dateOfBirth || !isValidEmail(email)) {
    redirectWithNotice(createClientPath, "invalid_member_form");
  }

  const supabase = createAdminClient();
  const result = await inviteMember(supabase, {
    dateOfBirth,
    email,
    fullName,
    phone,
  });

  revalidateAdminPaths();

  switch (result.status) {
    case "created":
      redirectWithNotice(
        createClientPath,
        result.emailSent ? "member_created" : "member_created_email_missing",
      );
    case "duplicate":
      redirectWithNotice(createClientPath, "member_duplicate");
    case "auth_failed":
      redirectWithNotice(createClientPath, "member_auth_failed");
    case "profile_failed":
      redirectWithNotice(createClientPath, "member_profile_failed");
    case "record_failed":
      redirectWithNotice(createClientPath, "member_record_failed");
    case "link_failed":
      redirectWithNotice(createClientPath, "member_created_link_failed");
    case "email_failed":
      redirectWithNotice(createClientPath, "member_created_email_failed");
  }
}

export async function bulkInviteMembers(formData: FormData) {
  await requireAdmin();

  if (!hasSupabaseAdminConfig()) {
    redirectWithNotice(importClientPath, "missing_supabase_admin");
  }

  const contactsJson = String(formData.get("bulkContactsJson") ?? "").trim();
  const pastedContacts = String(formData.get("bulkContacts") ?? "").trim();

  if (!contactsJson && !pastedContacts) {
    redirectWithNotice(importClientPath, "invalid_bulk_input");
  }

  const parsed = contactsJson
    ? parseBulkContactsJson(contactsJson)
    : parseBulkContacts(pastedContacts);

  if (!parsed.validRows.length) {
    redirectWithNotice(importClientPath, "invalid_bulk_input");
  }

  const supabase = createAdminClient();
  const totals = {
    created: 0,
    duplicates: 0,
    emailFailed: 0,
    emailMissing: 0,
    failed: parsed.invalidRows,
    linkFailed: 0,
  };

  for (const contact of parsed.validRows) {
    const result = await inviteMember(supabase, contact);

    if (result.status === "created") {
      totals.created += 1;

      if (!result.emailSent) {
        totals.emailMissing += 1;
      }
      continue;
    }

    if (result.status === "duplicate") {
      totals.duplicates += 1;
      continue;
    }

    if (result.status === "email_failed") {
      totals.created += 1;
      totals.emailFailed += 1;
      continue;
    }

    if (result.status === "link_failed") {
      totals.created += 1;
      totals.linkFailed += 1;
      continue;
    }

    totals.failed += 1;
  }

  revalidateAdminPaths();
  redirect(
    `${importClientPath}?notice=bulk_invite_complete&created=${totals.created}&duplicates=${totals.duplicates}&failed=${totals.failed}&emailFailed=${totals.emailFailed}&emailMissing=${totals.emailMissing}&linkFailed=${totals.linkFailed}`,
  );
}

async function inviteMember(
  supabase: ReturnType<typeof createAdminClient>,
  input: InviteMemberInput,
): Promise<InviteMemberResult> {
  const { data: existingMember, error: existingMemberError } = await supabase
    .from("members")
    .select("id")
    .eq("email", input.email)
    .maybeSingle();

  if (existingMemberError) {
    return { emailSent: false, status: "record_failed" };
  }

  if (existingMember) {
    return { emailSent: false, status: "duplicate" };
  }

  const temporaryPassword = crypto.randomBytes(24).toString("base64url");
  const siteUrl = getSiteUrl();
  const loginUrl = `${siteUrl}/login`;
  const { data: createdUser, error: createUserError } =
    await supabase.auth.admin.createUser({
      email: input.email,
      email_confirm: true,
      password: temporaryPassword,
      user_metadata: {
        full_name: input.fullName,
        phone: input.phone,
      },
    });

  if (createUserError || !createdUser.user) {
    return { emailSent: false, status: "auth_failed" };
  }

  const userId = createdUser.user.id;

  const { error: profileError } = await supabase.from("profiles").upsert({
    email: input.email,
    full_name: input.fullName,
    id: userId,
    phone: input.phone,
    role: "member",
  });

  if (profileError) {
    await supabase.auth.admin.deleteUser(userId);
    return { emailSent: false, status: "profile_failed" };
  }

  const { error: memberError } = await supabase.from("members").insert({
    current_weight_kg: null,
    date_of_birth: input.dateOfBirth,
    email: input.email,
    full_name: input.fullName,
    goal: defaultInviteGoal,
    height_cm: null,
    initial_weight_kg: null,
    is_active: false,
    phone: input.phone,
    user_id: userId,
  });

  if (memberError) {
    await supabase.auth.admin.deleteUser(userId);
    return { emailSent: false, status: "record_failed" };
  }

  if (!hasEmailConfig()) {
    return { emailSent: false, status: "created" };
  }

  const { data: recoveryLink, error: recoveryLinkError } =
    await supabase.auth.admin.generateLink({
      email: input.email,
      type: "recovery",
    });

  if (recoveryLinkError || !recoveryLink.properties?.hashed_token) {
    return { emailSent: false, status: "link_failed" };
  }

  const activationUrl = new URL("/auth/confirm", siteUrl);
  activationUrl.searchParams.set(
    "token_hash",
    recoveryLink.properties.hashed_token,
  );
  activationUrl.searchParams.set("type", "recovery");
  activationUrl.searchParams.set("next", "/reset-password");

  try {
    await sendWelcomeEmail({
      actionUrl: activationUrl.toString(),
      email: input.email,
      fullName: input.fullName,
      loginUrl,
    });
  } catch (error) {
    console.error("ATLETIX invite email failed", error);
    return { emailSent: false, status: "email_failed" };
  }

  return { emailSent: true, status: "created" };
}


function revalidateAdminPaths() {
  revalidatePath("/admin");
  revalidatePath("/admin/clientas");
  revalidatePath(createClientPath);
  revalidatePath(importClientPath);
}

function redirectWithNotice(path: string, notice: string): never {
  redirect(`${path}?notice=${notice}`);
}
