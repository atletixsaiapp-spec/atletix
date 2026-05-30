import type { ReactNode } from "react";
import Link from "next/link";
import { ArrowLeft, Clock3, UsersRound } from "lucide-react";
import { AdminNotice } from "@/components/ui/atoms/admin-notice";
import { PendingSubmitButton } from "@/components/ui/atoms/pending-submit-button";
import { ConfirmationModal } from "@/components/ui/organisms/confirmation-modal";
import { TopNav } from "@/components/ui/organisms/top-nav";
import {
  createTrainingGroup,
  deleteTrainingGroup,
  updateTrainingGroup,
} from "@/app/admin/grupos/actions";
import { requireAdmin } from "@/lib/auth";
import { getTrainingGroups, type TrainingGroup } from "@/lib/training-groups";

const fieldClass =
  "mt-2 min-h-12 w-full rounded-2xl border border-white/10 bg-black/30 px-4 text-sm font-semibold text-white outline-none transition placeholder:text-zinc-700 focus:border-[#ff2fa8]/60";
const labelClass =
  "text-[0.72rem] font-black uppercase tracking-[0.16em] text-zinc-500";

const noticeCopy: Record<string, { body: string; tone: "success" | "warning" | "error" }> = {
  group_created: {
    body: "Grupo creado.",
    tone: "success",
  },
  group_create_failed: {
    body: "No se pudo crear el grupo.",
    tone: "error",
  },
  group_deleted: {
    body: "Grupo eliminado. Las cuentas asignadas quedaron sin grupo.",
    tone: "warning",
  },
  group_delete_failed: {
    body: "No se pudo eliminar el grupo.",
    tone: "error",
  },
  group_updated: {
    body: "Grupo actualizado.",
    tone: "success",
  },
  group_update_failed: {
    body: "No se pudo actualizar el grupo.",
    tone: "error",
  },
  invalid_group: {
    body: "Revisa nombre, hora y cupos.",
    tone: "error",
  },
  missing_supabase_admin: {
    body: "Falta SUPABASE_SERVICE_ROLE_KEY para gestionar grupos reales.",
    tone: "error",
  },
};

export default async function AdminGroupsPage({
  searchParams,
}: {
  searchParams: Promise<{ notice?: string }>;
}) {
  await requireAdmin();

  const [{ notice }, data] = await Promise.all([
    searchParams,
    getTrainingGroups(),
  ]);
  const noticeConfig = notice ? noticeCopy[notice] : null;

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
            Grupos
          </p>
          <h1 className="mt-2 text-3xl font-black tracking-normal text-white sm:text-5xl">
            Horarios y cupos
          </h1>
        </div>

        {noticeConfig ? <AdminNotice {...noticeConfig} /> : null}
        {data.setupMessage ? (
          <AdminNotice body={data.setupMessage} tone="warning" />
        ) : null}

        <section className="grid gap-6 lg:grid-cols-[0.8fr_1.2fr]">
          <section className="glass-panel rounded-3xl p-5 sm:p-6">
            <SectionHeading
              icon={<Clock3 size={22} />}
              title="Crear grupo"
              subtitle="Agrega un horario con cupos definidos."
            />

            <form action={createTrainingGroup} className="mt-5 grid gap-4">
              <label className={labelClass}>
                Nombre
                <input
                  className={fieldClass}
                  name="name"
                  placeholder="7:00 a.m."
                  required
                  type="text"
                />
              </label>

              <label className={labelClass}>
                Hora
                <input className={fieldClass} name="startTime" required type="time" />
              </label>

              <label className={labelClass}>
                Cupos
                <input
                  className={fieldClass}
                  min="1"
                  name="capacity"
                  placeholder="10"
                  required
                  type="number"
                />
              </label>

              <PendingSubmitButton
                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-[#ff2fa8] px-5 py-3 text-sm font-black text-white transition hover:bg-[#ff58b9]"
                pendingLabel="Creando grupo..."
              >
                Crear grupo
              </PendingSubmitButton>
            </form>
          </section>

          <section className="glass-panel rounded-3xl p-5 sm:p-6">
            <SectionHeading
              icon={<UsersRound size={22} />}
              title={`${data.groups.length} grupos`}
              subtitle="Edita cupos, horario, estado o elimina grupos."
            />

            <div className="mt-5 grid gap-4">
              {data.groups.length ? (
                data.groups.map((group) => (
                  <GroupEditor key={group.id} group={group} />
                ))
              ) : (
                <div className="rounded-2xl border border-dashed border-white/10 p-5 text-center text-sm text-zinc-500">
                  Sin grupos creados.
                </div>
              )}
            </div>
          </section>
        </section>
      </section>
    </main>
  );
}

function GroupEditor({ group }: { group: TrainingGroup }) {
  return (
    <div className="rounded-3xl border border-white/10 bg-white/[0.025] p-4 sm:p-5">
      <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-black text-white">{group.name}</p>
          <p className="text-sm text-zinc-500">
            {group.memberCount}/{group.capacity} membresias activas /{" "}
            {group.availableSeats} cupos
          </p>
        </div>
        <span
          className={`w-fit rounded-full border px-3 py-1 text-xs font-black uppercase tracking-[0.16em] ${
            group.isActive
              ? "border-emerald-300/20 bg-emerald-400/10 text-emerald-100"
              : "border-zinc-400/20 bg-white/5 text-zinc-400"
          }`}
        >
          {group.isActive ? "Activo" : "Pausado"}
        </span>
      </div>

      <form action={updateTrainingGroup} className="grid gap-4 md:grid-cols-4">
        <input name="groupId" type="hidden" value={group.id} />
        <label className={labelClass}>
          Nombre
          <input
            className={fieldClass}
            defaultValue={group.name}
            name="name"
            required
            type="text"
          />
        </label>
        <label className={labelClass}>
          Hora
          <input
            className={fieldClass}
            defaultValue={group.startTime.slice(0, 5)}
            name="startTime"
            required
            type="time"
          />
        </label>
        <label className={labelClass}>
          Cupos
          <input
            className={fieldClass}
            defaultValue={group.capacity}
            min="1"
            name="capacity"
            required
            type="number"
          />
        </label>
        <label className={`${labelClass} flex items-end gap-3 pb-3`}>
          <input
            className="size-5 accent-[#ff2fa8]"
            defaultChecked={group.isActive}
            name="isActive"
            type="checkbox"
          />
          Activo
        </label>

        <div className="md:col-span-4">
          <PendingSubmitButton
            className="inline-flex min-h-12 w-full items-center justify-center rounded-full bg-white px-5 py-3 text-sm font-black text-black transition hover:bg-zinc-200"
            pendingLabel="Guardando..."
          >
            Guardar cambios
          </PendingSubmitButton>
        </div>
      </form>
      <div className="mt-3">
        <ConfirmationModal
          action={deleteTrainingGroup}
          confirmLabel="Eliminar grupo"
          description="Eliminar este grupo deja sin grupo a las cuentas asignadas. Puedes pausarlo si solo quieres ocultarlo temporalmente."
          hiddenFields={[{ name: "groupId", value: group.id }]}
          title="Eliminar grupo"
          triggerLabel="Eliminar"
        />
      </div>
    </div>
  );
}

function SectionHeading({
  icon,
  subtitle,
  title,
}: {
  icon: ReactNode;
  subtitle: string;
  title: string;
}) {
  return (
    <div className="flex items-start justify-between gap-4">
      <div>
        <h2 className="text-2xl font-black text-white">{title}</h2>
        <p className="mt-1 text-sm leading-6 text-zinc-500">{subtitle}</p>
      </div>
      <span className="grid size-11 shrink-0 place-items-center rounded-2xl bg-[#ff2fa8]/15 text-[#ff8bd8]">
        {icon}
      </span>
    </div>
  );
}
