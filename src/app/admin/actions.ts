"use server";

import crypto from "node:crypto";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/auth";
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

type BulkContactRow = InviteMemberInput & {
  rowNumber: number;
};

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

  const pastedContacts = String(formData.get("bulkContacts") ?? "").trim();

  if (!pastedContacts) {
    redirectWithNotice(importClientPath, "invalid_bulk_input");
  }

  const parsed = parseBulkContacts(pastedContacts);

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

function parseBulkContacts(raw: string) {
  const lines = raw
    .replace(/^\uFEFF/, "")
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

  if (!lines.length) {
    return { invalidRows: 0, validRows: [] as BulkContactRow[] };
  }

  const delimiter = getDelimiter(lines[0]);
  const firstRow = parseDelimitedLine(lines[0], delimiter);
  const headerIndexes = getHeaderIndexes(firstRow);
  const hasHeader = headerIndexes.hasAnyHeader;
  const dataLines = hasHeader ? lines.slice(1) : lines;
  const indexes = hasHeader ? headerIndexes : getDefaultBulkIndexes(firstRow);

  const validRows: BulkContactRow[] = [];
  let invalidRows = 0;

  dataLines.forEach((line, index) => {
    const cells = parseDelimitedLine(line, delimiter);
    const fullName = getCell(cells, indexes.fullName);
    const email = getCell(cells, indexes.email).toLowerCase();
    const phone = getCell(cells, indexes.phone);
    const birthDateInput = getCell(cells, indexes.dateOfBirth);
    const dateOfBirth = normalizeBirthDate(birthDateInput);

    if (!fullName || !email || !isValidEmail(email) || !phone || !dateOfBirth) {
      invalidRows += 1;
      return;
    }

    validRows.push({
      dateOfBirth,
      email,
      fullName,
      phone,
      rowNumber: hasHeader ? index + 2 : index + 1,
    });
  });

  return { invalidRows, validRows };
}

function getDelimiter(line: string) {
  if (line.includes("\t")) {
    return "\t";
  }

  const commaCount = countOccurrences(line, ",");
  const semicolonCount = countOccurrences(line, ";");

  return semicolonCount > commaCount ? ";" : ",";
}

function countOccurrences(value: string, character: string) {
  return value.split(character).length - 1;
}

function parseDelimitedLine(line: string, delimiter: string) {
  const cells: string[] = [];
  let current = "";
  let isQuoted = false;

  for (let index = 0; index < line.length; index += 1) {
    const character = line[index];
    const nextCharacter = line[index + 1];

    if (character === '"' && nextCharacter === '"') {
      current += '"';
      index += 1;
      continue;
    }

    if (character === '"') {
      isQuoted = !isQuoted;
      continue;
    }

    if (character === delimiter && !isQuoted) {
      cells.push(current.trim());
      current = "";
      continue;
    }

    current += character;
  }

  cells.push(current.trim());

  return cells;
}

function getHeaderIndexes(headers: string[]) {
  const normalizedHeaders = headers.map(normalizeHeader);

  return {
    dateOfBirth: findHeaderIndex(normalizedHeaders, [
      "fechadecumpleanos",
      "cumpleanos",
      "fechadenacimiento",
      "nacimiento",
      "birthday",
      "birthdate",
      "dateofbirth",
    ]),
    email: findHeaderIndex(normalizedHeaders, [
      "correoelectronico",
      "correo",
      "email",
      "mail",
    ]),
    fullName: findHeaderIndex(normalizedHeaders, [
      "nombrecompleto",
      "nombre",
      "fullname",
      "name",
    ]),
    hasAnyHeader: normalizedHeaders.some((header) =>
      [
        "nombrecompleto",
        "correoelectronico",
        "fechadenacimiento",
        "fechadecumpleanos",
        "celular",
      ].some((candidate) => header.includes(candidate)),
    ),
    phone: findHeaderIndex(normalizedHeaders, [
      "celular",
      "telefono",
      "whatsapp",
      "phone",
      "mobile",
    ]),
  };
}

function getDefaultBulkIndexes(cells: string[]) {
  const legacyBirthDate = getCell(cells, 3);

  if (cells.length >= 5 && normalizeBirthDate(legacyBirthDate)) {
    return {
      dateOfBirth: 3,
      email: 1,
      fullName: 0,
      hasAnyHeader: false,
      phone: 4,
    };
  }

  return {
    dateOfBirth: 2,
    email: 1,
    fullName: 0,
    hasAnyHeader: false,
    phone: 3,
  };
}

function normalizeHeader(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "");
}

function findHeaderIndex(headers: string[], candidates: string[]) {
  const index = headers.findIndex((header) =>
    candidates.some((candidate) => header === candidate || header.includes(candidate)),
  );

  return index === -1 ? null : index;
}

function getCell(cells: string[], index: number | null) {
  if (index === null) {
    return "";
  }

  return String(cells[index] ?? "").trim();
}

function normalizeBirthDate(value: string) {
  const trimmed = value.trim();

  if (!trimmed) {
    return null;
  }

  if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed) && isRealDate(trimmed)) {
    return trimmed;
  }

  if (/^\d{5}$/.test(trimmed)) {
    const excelDate = new Date(Date.UTC(1899, 11, 30) + Number(trimmed) * 86400000);
    const dateKey = excelDate.toISOString().slice(0, 10);

    return isRealDate(dateKey) ? dateKey : null;
  }

  const match = trimmed.match(/^(\d{1,2})[/. -](\d{1,2})[/. -](\d{2,4})$/);

  if (!match) {
    return null;
  }

  const day = Number(match[1]);
  const month = Number(match[2]);
  const year = normalizeYear(Number(match[3]));
  const dateKey = `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(
    2,
    "0",
  )}`;

  return isRealDate(dateKey) ? dateKey : null;
}

function normalizeYear(year: number) {
  if (year >= 100) {
    return year;
  }

  const currentTwoDigitYear = Number(String(new Date().getFullYear()).slice(-2));

  return year > currentTwoDigitYear ? 1900 + year : 2000 + year;
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

function isValidEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
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
