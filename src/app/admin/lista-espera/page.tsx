import type { ReactNode } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Clock3,
  ListChecks,
  Mail,
  Phone,
  UserPlus,
} from "lucide-react";
import {
  archiveWaitlistEntry,
  inviteWaitlistEntry,
} from "@/app/admin/lista-espera/actions";
import { AdminNotice } from "@/components/ui/atoms/admin-notice";
import { PendingSubmitButton } from "@/components/ui/atoms/pending-submit-button";
import { ConfirmationModal } from "@/components/ui/organisms/confirmation-modal";
import { TopNav } from "@/components/ui/organisms/top-nav";
import { requireAdmin } from "@/lib/auth";
import { getTrainingGroups, type TrainingGroup } from "@/lib/training-groups";
import { getWaitlistEntries, type WaitlistEntry } from "@/lib/waitlist";

const fieldClass =
  "min-h-12 w-full rounded-2xl border border-white/10 bg-black/30 px-4 text-sm font-semibold text-white outline-none transition placeholder:text-zinc-700 focus:border-[#ff2fa8]/60";
const labelClass =
  "text-[0.72rem] font-black uppercase tracking-[0.16em] text-zinc-500";

const noticeCopy: Record<
  string,
  { body: string; tone: "success" | "warning" | "error" }
> = {
  group_full: {
    body: "Ese grupo ya no tiene cupos libres para membresias activas.",
    tone: "warning",
  },
  invalid_group: {
    body: "Selecciona un grupo activo con cupos libres.",
    tone: "error",
  },
  invalid_waitlist_entry: {
    body: "No encontramos esa solicitud pendiente.",
    tone: "error",
  },
  invalid_waitlist_invite: {
    body: "Selecciona una solicitud y un grupo valido.",
    tone: "error",
  },
  member_auth_failed: {
    body: "No se pudo crear el acceso de la cuenta.",
    tone: "error",
  },
  member_duplicate: {
    body: "Ese correo ya existe como cuenta ATLETIX.",
    tone: "warning",
  },
  member_profile_failed: {
    body: "Se creo el acceso, pero fallo el perfil. Revisa Supabase.",
    tone: "error",
  },
  member_record_failed: {
    body: "No se pudo crear la ficha de la cuenta.",
    tone: "error",
  },
  missing_supabase_admin: {
    body: "Falta SUPABASE_SERVICE_ROLE_KEY para gestionar la lista de espera.",
    tone: "error",
  },
  waitlist_archived: {
    body: "Solicitud archivada.",
    tone: "warning",
  },
  waitlist_archive_failed: {
    body: "No se pudo archivar la solicitud.",
    tone: "error",
  },
  waitlist_invited: {
    body: "Cuenta creada e invitacion enviada.",
    tone: "success",
  },
  waitlist_invited_email_failed: {
    body: "Cuenta creada, pero fallo el envio del correo.",
    tone: "warning",
  },
  waitlist_invited_email_missing: {
    body: "Cuenta creada. Falta configurar Resend para enviar el correo.",
    tone: "warning",
  },
  waitlist_invited_link_failed: {
    body: "Cuenta creada, pero fallo el enlace de activacion.",
    tone: "warning",
  },
  waitlist_status_failed: {
    body: "La cuenta se creo, pero no se pudo actualizar la lista de espera.",
    tone: "warning",
  },
};

export default async function AdminWaitlistPage({
  searchParams,
}: {
  searchParams: Promise<{ notice?: string }>;
}) {
  await requireAdmin();

  const [{ notice }, waitlist, groups] = await Promise.all([
    searchParams,
    getWaitlistEntries(),
    getTrainingGroups({ activeOnly: true }),
  ]);
  const noticeConfig = notice ? noticeCopy[notice] : null;
  const groupNameById = new Map(
    groups.groups.map((group) => [group.id, group.name]),
  );
  const availableGroups = groups.groups.filter(
    (group) => group.availableSeats > 0,
  );
  const pendingCount = waitlist.entries.filter(
    (entry) => entry.status === "pending",
  ).length;

  return (
    <main className="atletix-shell min-h-screen">
      <TopNav active="admin" mode="admin" />

      <section className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <Link
          href="/admin"
          className="inline-flex items-center gap-2 rounded-full border border-white/10 px-4 py-2 text-sm font-bold text-zinc-300 transition hover:border-[#ff2fa8]/50 hover:text-white"
        >
          <ArrowLeft size={16} />
          Volver al panel
        </Link>

        <div className="mt-6 pb-6">
          <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[#ff8bd8]">
            Lista de espera
          </p>
          <h1 className="mt-2 text-3xl font-black tracking-normal text-white sm:text-5xl">
            Solicitudes pendientes
          </h1>
        </div>

        {noticeConfig ? <AdminNotice {...noticeConfig} /> : null}
        {waitlist.setupMessage ? (
          <AdminNotice body={waitlist.setupMessage} tone="warning" />
        ) : null}
        {groups.setupMessage ? (
          <AdminNotice body={groups.setupMessage} tone="warning" />
        ) : null}

        <section className="grid gap-4 md:grid-cols-3">
          <SummaryCard
            icon={<ListChecks size={22} />}
            label="Pendientes"
            value={`${pendingCount}`}
          />
          <SummaryCard
            icon={<Clock3 size={22} />}
            label="Grupos con cupo"
            value={`${availableGroups.length}`}
          />
          <SummaryCard
            icon={<UserPlus size={22} />}
            label="Total solicitudes"
            value={`${waitlist.entries.length}`}
          />
        </section>

        <section className="glass-panel mt-6 rounded-3xl p-5 sm:p-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-zinc-500">
                Cola
              </p>
              <h2 className="mt-1 text-2xl font-black text-white">
                Personas en espera
              </h2>
            </div>
            <Link
              href="/admin/grupos"
              className="inline-flex min-h-11 w-full items-center justify-center rounded-full border border-white/10 px-4 text-sm font-black text-zinc-200 transition hover:border-[#ff2fa8]/50 hover:text-white sm:w-auto"
            >
              Editar grupos
            </Link>
          </div>

          <div className="mt-5 grid gap-4">
            {waitlist.entries.length ? (
              waitlist.entries.map((entry) => (
                <WaitlistCard
                  availableGroups={availableGroups}
                  entry={entry}
                  groupName={getGroupName(
                    groupNameById,
                    entry.preferredGroupId,
                  )}
                  key={entry.id}
                />
              ))
            ) : (
              <div className="rounded-2xl border border-dashed border-white/10 p-6 text-center text-sm text-zinc-500">
                Sin solicitudes en la lista de espera.
              </div>
            )}
          </div>
        </section>
      </section>
    </main>
  );
}

function WaitlistCard({
  availableGroups,
  entry,
  groupName,
}: {
  availableGroups: TrainingGroup[];
  entry: WaitlistEntry;
  groupName: string;
}) {
  const defaultGroupId = getDefaultGroupId(
    availableGroups,
    entry.preferredGroupId,
  );
  const canInvite = entry.status === "pending" && Boolean(defaultGroupId);

  return (
    <article className="rounded-3xl border border-white/10 bg-white/[0.025] p-4 sm:p-5">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-xl font-black text-white">{entry.fullName}</h3>
            <StatusBadge status={entry.status} />
          </div>
          <div className="mt-3 grid gap-2 text-sm text-zinc-400 sm:grid-cols-2">
            <InfoLine icon={<Mail size={16} />} value={entry.email} />
            <InfoLine icon={<Phone size={16} />} value={entry.phone} />
            <InfoLine
              icon={<Clock3 size={16} />}
              value={`Preferido: ${groupName}`}
            />
            <InfoLine value={`Solicitud: ${formatDate(entry.createdAt)}`} />
          </div>
          {entry.notes ? (
            <p className="mt-4 rounded-2xl border border-white/10 bg-black/20 p-3 text-sm leading-6 text-zinc-300">
              {entry.notes}
            </p>
          ) : null}
          {entry.invitedAt ? (
            <p className="mt-3 text-xs font-black uppercase tracking-[0.16em] text-emerald-200">
              Invitacion enviada {formatDate(entry.invitedAt)}
            </p>
          ) : null}
        </div>

        {entry.status === "pending" ? (
          <div className="w-full shrink-0 lg:w-80">
            <form action={inviteWaitlistEntry} className="grid gap-3">
              <input name="entryId" type="hidden" value={entry.id} />
              <label className={labelClass}>
                Grupo para asignar
                <select
                  className={`${fieldClass} mt-2`}
                  defaultValue={defaultGroupId}
                  disabled={!availableGroups.length}
                  name="groupId"
                  required
                >
                  {availableGroups.length ? null : (
                    <option value="">Sin cupos disponibles</option>
                  )}
                  {availableGroups.map((group) => (
                    <option key={group.id} value={group.id}>
                      {group.name} / {group.availableSeats} cupos
                    </option>
                  ))}
                </select>
              </label>
              <PendingSubmitButton
                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-[#ff2fa8] px-5 py-3 text-sm font-black text-white transition hover:bg-[#ff58b9]"
                disabled={!canInvite}
                pendingLabel="Creando cuenta..."
              >
                <UserPlus size={18} />
                Crear cuenta
              </PendingSubmitButton>
            </form>

            <div className="mt-3">
              <ConfirmationModal
                action={archiveWaitlistEntry}
                confirmLabel="Archivar"
                description="Archivar oculta esta solicitud como pendiente, pero la conserva en el historial."
                hiddenFields={[{ name: "entryId", value: entry.id }]}
                title="Archivar solicitud"
                triggerLabel="Archivar"
              />
            </div>
          </div>
        ) : null}
      </div>
    </article>
  );
}

function SummaryCard({
  icon,
  label,
  value,
}: {
  icon: ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="glass-panel rounded-3xl p-5">
      <div className="grid size-11 place-items-center rounded-2xl bg-[#ff2fa8]/15 text-[#ff8bd8]">
        {icon}
      </div>
      <p className="mt-5 text-xs font-black uppercase tracking-[0.18em] text-zinc-500">
        {label}
      </p>
      <p className="metric-number mt-2 text-3xl font-black text-white">
        {value}
      </p>
    </div>
  );
}

function StatusBadge({ status }: { status: WaitlistEntry["status"] }) {
  const styles = {
    archived: "border-zinc-400/20 bg-white/5 text-zinc-400",
    invited: "border-emerald-300/20 bg-emerald-400/10 text-emerald-100",
    pending: "border-amber-300/20 bg-amber-400/10 text-amber-100",
  };
  const labels = {
    archived: "Archivado",
    invited: "Invitacion enviada",
    pending: "Pendiente",
  };

  return (
    <span
      className={`rounded-full border px-3 py-1 text-xs font-black uppercase tracking-[0.14em] ${styles[status]}`}
    >
      {labels[status]}
    </span>
  );
}

function InfoLine({ icon, value }: { icon?: ReactNode; value: string }) {
  return (
    <p className="flex min-w-0 items-center gap-2">
      {icon ? <span className="shrink-0 text-[#ff8bd8]">{icon}</span> : null}
      <span className="min-w-0 break-words">{value}</span>
    </p>
  );
}

function getDefaultGroupId(
  availableGroups: TrainingGroup[],
  preferredGroupId: string | null,
) {
  if (
    preferredGroupId &&
    availableGroups.some((group) => group.id === preferredGroupId)
  ) {
    return preferredGroupId;
  }

  return availableGroups[0]?.id ?? "";
}

function getGroupName(
  groupNameById: Map<string, string>,
  preferredGroupId: string | null,
) {
  return preferredGroupId
    ? (groupNameById.get(preferredGroupId) ?? "No disponible")
    : "Sin preferencia";
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("es-CO", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(value));
}
