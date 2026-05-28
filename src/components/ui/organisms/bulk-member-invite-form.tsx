"use client";

import { useMemo, useState } from "react";
import { ListChecks, Trash2, Upload } from "lucide-react";
import { LoadingSpinner } from "@/components/ui/atoms/loading-spinner";
import { PendingSubmitButton } from "@/components/ui/atoms/pending-submit-button";
import {
  type BulkInviteContact,
  isValidEmail,
  normalizeBirthDate,
  parseBulkContacts,
} from "@/lib/bulk-invite";

const fieldClass =
  "mt-2 min-h-64 w-full rounded-3xl border border-white/10 bg-black/30 px-4 py-4 text-sm font-semibold leading-6 text-white outline-none transition placeholder:text-zinc-700 focus:border-[#ff2fa8]/60";
const labelClass =
  "text-[0.72rem] font-black uppercase tracking-[0.16em] text-zinc-500";
const inputClass =
  "min-h-11 w-full rounded-2xl border border-white/10 bg-black/30 px-3 text-sm font-semibold text-white outline-none transition placeholder:text-zinc-700 focus:border-[#ff2fa8]/60";

type EditableInviteContact = BulkInviteContact & {
  id: string;
};

export function BulkMemberInviteForm({
  action,
}: {
  action: (formData: FormData) => Promise<void> | void;
}) {
  const [bulkContacts, setBulkContacts] = useState("");
  const [invalidRows, setInvalidRows] = useState(0);
  const [isParsing, setIsParsing] = useState(false);
  const [parseMessage, setParseMessage] = useState("");
  const [rows, setRows] = useState<EditableInviteContact[]>([]);

  const rowIssues = useMemo(
    () =>
      rows.map((row) => ({
        dateOfBirth: !normalizeBirthDate(row.dateOfBirth),
        email: !isValidEmail(row.email),
        fullName: !row.fullName.trim(),
        phone: !row.phone.trim(),
      })),
    [rows],
  );
  const hasInvalidEditedRows = rowIssues.some((issue) =>
    Object.values(issue).some(Boolean),
  );
  const canSubmit = rows.length > 0 && !hasInvalidEditedRows;
  const contactsJson = JSON.stringify(
    rows.map(({ dateOfBirth, email, fullName, phone, rowNumber }) => ({
      dateOfBirth,
      email,
      fullName,
      phone,
      rowNumber,
    })),
  );

  function readRows() {
    setIsParsing(true);

    window.setTimeout(() => {
      const parsed = parseBulkContacts(bulkContacts);

      setRows(
        parsed.validRows.map((row) => ({
          ...row,
          id: `${row.rowNumber}-${row.email}-${row.phone}`,
        })),
      );
      setInvalidRows(parsed.invalidRows);
      setParseMessage(
        parsed.validRows.length
          ? `${parsed.validRows.length} registros listos para revisar.`
          : "No encontramos registros validos. Revisa que cada fila tenga nombre, correo, fecha de nacimiento y celular.",
      );
      setIsParsing(false);
    }, 0);
  }

  function updateRow(
    id: string,
    field: keyof Omit<EditableInviteContact, "id" | "rowNumber">,
    value: string,
  ) {
    setRows((current) =>
      current.map((row) => (row.id === id ? { ...row, [field]: value } : row)),
    );
  }

  function deleteRow(id: string) {
    setRows((current) => current.filter((row) => row.id !== id));
  }

  return (
    <div className="mt-5 grid gap-5">
      <label className={labelClass}>
        Datos pegados desde Excel o CSV
        <textarea
          className={fieldClass}
          name="bulkContacts"
          onChange={(event) => setBulkContacts(event.target.value)}
          placeholder={`nombre Completo\tCorreo electronico\tFecha de nacimiento\tCelular
Maria Perez\tmaria@email.com\t15/04/1997\t3001234567`}
          value={bulkContacts}
        />
        <span className="mt-2 block text-xs font-semibold normal-case tracking-normal text-zinc-500">
          Pega desde Excel o usa coma/punto y coma en CSV. Los espacios dentro del
          nombre no separan columnas.
        </span>
      </label>

      <button
        className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-full border border-[#ff2fa8]/40 px-5 py-3 text-sm font-black text-white transition hover:bg-[#ff2fa8]/10 disabled:cursor-not-allowed disabled:opacity-60 sm:w-fit"
        disabled={!bulkContacts.trim() || isParsing}
        onClick={readRows}
        type="button"
      >
        {isParsing ? <LoadingSpinner /> : <ListChecks size={18} />}
        Leer datos
      </button>

      {parseMessage ? (
        <div className="rounded-2xl border border-white/10 bg-white/[0.035] px-4 py-3 text-sm font-semibold text-zinc-300">
          {parseMessage}
          {invalidRows ? (
            <span className="ml-2 text-amber-200">
              {invalidRows} filas quedaron por fuera.
            </span>
          ) : null}
        </div>
      ) : null}

      {rows.length ? (
        <form action={action} className="grid gap-5">
          <input name="bulkContactsJson" type="hidden" value={contactsJson} />

          <section className="overflow-hidden rounded-3xl border border-white/10 bg-white/[0.025]">
            <div className="hidden grid-cols-[1.2fr_1.2fr_0.9fr_0.9fr_auto] gap-3 border-b border-white/10 px-4 py-3 text-[0.68rem] font-black uppercase tracking-[0.16em] text-zinc-500 lg:grid">
              <span>Nombre</span>
              <span>Correo</span>
              <span>Fecha nacimiento</span>
              <span>Celular</span>
              <span>Quitar</span>
            </div>

            <div className="divide-y divide-white/10">
              {rows.map((row, index) => {
                const issue = rowIssues[index] ?? {
                  dateOfBirth: false,
                  email: false,
                  fullName: false,
                  phone: false,
                };

                return (
                  <div
                    key={row.id}
                    className="grid gap-3 p-4 lg:grid-cols-[1.2fr_1.2fr_0.9fr_0.9fr_auto] lg:items-center"
                  >
                    <EditableCell
                      hasError={issue.fullName}
                      label="Nombre"
                      onChange={(value) => updateRow(row.id, "fullName", value)}
                      value={row.fullName}
                    />
                    <EditableCell
                      hasError={issue.email}
                      label="Correo"
                      onChange={(value) => updateRow(row.id, "email", value)}
                      type="email"
                      value={row.email}
                    />
                    <EditableCell
                      hasError={issue.dateOfBirth}
                      label="Fecha nacimiento"
                      onChange={(value) => updateRow(row.id, "dateOfBirth", value)}
                      type="date"
                      value={normalizeBirthDate(row.dateOfBirth) ?? row.dateOfBirth}
                    />
                    <EditableCell
                      hasError={issue.phone}
                      label="Celular"
                      onChange={(value) => updateRow(row.id, "phone", value)}
                      type="tel"
                      value={row.phone}
                    />
                    <div className="flex lg:justify-end">
                      <button
                        aria-label={`Quitar ${row.fullName}`}
                        className="inline-grid size-11 place-items-center rounded-2xl border border-red-300/20 bg-red-400/10 text-red-100 transition hover:bg-red-400/20"
                        onClick={() => deleteRow(row.id)}
                        type="button"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          {hasInvalidEditedRows ? (
            <div className="rounded-2xl border border-amber-300/20 bg-amber-400/10 px-4 py-3 text-sm font-semibold text-amber-100">
              Corrige los campos marcados antes de guardar.
            </div>
          ) : null}

          <PendingSubmitButton
            className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-full bg-[#ff2fa8] px-5 py-3 text-sm font-black text-white transition hover:bg-[#ff58b9] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#ff8bd8] sm:w-fit"
            disabled={!canSubmit}
            pendingLabel="Guardando..."
          >
            <Upload size={18} />
            Guardar y enviar {rows.length} invitaciones
          </PendingSubmitButton>
        </form>
      ) : null}
    </div>
  );
}

function EditableCell({
  hasError,
  label,
  onChange,
  type = "text",
  value,
}: {
  hasError: boolean;
  label: string;
  onChange: (value: string) => void;
  type?: string;
  value: string;
}) {
  return (
    <label className="grid gap-2">
      <span className="text-[0.68rem] font-black uppercase tracking-[0.14em] text-zinc-500 lg:hidden">
        {label}
      </span>
      <input
        className={`${inputClass} ${hasError ? "border-amber-300/70" : ""}`}
        onChange={(event) => onChange(event.target.value)}
        type={type}
        value={value}
      />
    </label>
  );
}
