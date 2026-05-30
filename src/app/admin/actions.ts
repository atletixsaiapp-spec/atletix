"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/auth";
import {
  isValidEmail,
  normalizeBirthDate,
  parseBulkContacts,
  parseBulkContactsJson,
} from "@/lib/bulk-invite";
import { inviteMember } from "@/lib/member-invite";
import {
  createAdminClient,
  hasSupabaseAdminConfig,
} from "@/utils/supabase/admin";

const createClientPath = "/admin/clientas/nueva";
const importClientPath = "/admin/clientas/importar";

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
  const dateOfBirth = normalizeBirthDate(
    String(formData.get("dateOfBirth") ?? ""),
  );

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

function revalidateAdminPaths() {
  revalidatePath("/admin");
  revalidatePath("/admin/clientas");
  revalidatePath(createClientPath);
  revalidatePath(importClientPath);
}

function redirectWithNotice(path: string, notice: string): never {
  redirect(`${path}?notice=${notice}`);
}
