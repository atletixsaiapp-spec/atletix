export type BulkInviteContact = {
  dateOfBirth: string;
  email: string;
  fullName: string;
  phone: string;
  rowNumber: number;
};

export type BulkInviteParseResult = {
  invalidRows: number;
  validRows: BulkInviteContact[];
};

type HeaderIndexes = {
  dateOfBirth: number | null;
  email: number | null;
  fullName: number | null;
  hasAnyHeader: boolean;
  phone: number | null;
};

export function parseBulkContacts(raw: string): BulkInviteParseResult {
  const lines = raw
    .replace(/^\uFEFF/, "")
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

  if (!lines.length) {
    return { invalidRows: 0, validRows: [] };
  }

  const delimiter = getDelimiter(lines[0] ?? "");
  const firstRow = parseDelimitedLine(lines[0] ?? "", delimiter);
  const headerIndexes = getHeaderIndexes(firstRow);
  const hasHeader = headerIndexes.hasAnyHeader;
  const dataLines = hasHeader ? lines.slice(1) : lines;
  const indexes = hasHeader ? headerIndexes : getDefaultBulkIndexes(firstRow);

  const validRows: BulkInviteContact[] = [];
  let invalidRows = 0;

  dataLines.forEach((line, index) => {
    const cells = parseDelimitedLine(line, delimiter);
    const contact = normalizeContact({
      dateOfBirth: getCell(cells, indexes.dateOfBirth),
      email: getCell(cells, indexes.email),
      fullName: getCell(cells, indexes.fullName),
      phone: getCell(cells, indexes.phone),
      rowNumber: hasHeader ? index + 2 : index + 1,
    });

    if (!contact) {
      invalidRows += 1;
      return;
    }

    validRows.push(contact);
  });

  return { invalidRows, validRows };
}

export function parseBulkContactsJson(raw: string): BulkInviteParseResult {
  let parsed: unknown;

  try {
    parsed = JSON.parse(raw);
  } catch {
    return { invalidRows: 1, validRows: [] };
  }

  if (!Array.isArray(parsed)) {
    return { invalidRows: 1, validRows: [] };
  }

  const validRows: BulkInviteContact[] = [];
  let invalidRows = 0;

  parsed.forEach((item, index) => {
    if (!item || typeof item !== "object") {
      invalidRows += 1;
      return;
    }

    const row = item as Record<string, unknown>;
    const contact = normalizeContact({
      dateOfBirth: String(row.dateOfBirth ?? ""),
      email: String(row.email ?? ""),
      fullName: String(row.fullName ?? ""),
      phone: String(row.phone ?? ""),
      rowNumber: Number(row.rowNumber ?? index + 1),
    });

    if (!contact) {
      invalidRows += 1;
      return;
    }

    validRows.push(contact);
  });

  return { invalidRows, validRows };
}

export function normalizeBirthDate(value: string) {
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

export function isValidEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function normalizeContact({
  dateOfBirth,
  email,
  fullName,
  phone,
  rowNumber,
}: {
  dateOfBirth: string;
  email: string;
  fullName: string;
  phone: string;
  rowNumber: number;
}) {
  const normalizedDate = normalizeBirthDate(dateOfBirth);
  const normalizedEmail = email.trim().toLowerCase();
  const normalizedName = fullName.trim();
  const normalizedPhone = phone.trim();

  if (
    !normalizedName ||
    !normalizedEmail ||
    !isValidEmail(normalizedEmail) ||
    !normalizedPhone ||
    !normalizedDate
  ) {
    return null;
  }

  return {
    dateOfBirth: normalizedDate,
    email: normalizedEmail,
    fullName: normalizedName,
    phone: normalizedPhone,
    rowNumber: Number.isFinite(rowNumber) ? rowNumber : 0,
  };
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

function getHeaderIndexes(headers: string[]): HeaderIndexes {
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

function getDefaultBulkIndexes(cells: string[]): HeaderIndexes {
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
