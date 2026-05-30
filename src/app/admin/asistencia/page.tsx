import Link from "next/link";
import { ArrowLeft, CheckCircle2, Search, UserRound } from "lucide-react";
import { AdminNotice } from "@/components/ui/atoms/admin-notice";
import { PendingSubmitButton } from "@/components/ui/atoms/pending-submit-button";
import { SearchableMemberSelect } from "@/components/ui/atoms/searchable-member-select";
import { AttendanceScanner } from "@/components/ui/organisms/attendance-scanner";
import { TopNav } from "@/components/ui/organisms/top-nav";
import {
  trackAttendanceFromQr,
  trackAttendanceManually,
} from "@/app/admin/asistencia/actions";
import { getAdminAttendanceData } from "@/lib/admin-attendance";
import { requireAdmin } from "@/lib/auth";

const noticeCopy: Record<string, { body: string; tone: "success" | "warning" | "error" }> = {
  attendance_duplicate: {
    body: "Esta cuenta ya tiene asistencia registrada hoy.",
    tone: "warning",
  },
  attendance_failed: {
    body: "No se pudo registrar la asistencia.",
    tone: "error",
  },
  attendance_registered: {
    body: "Asistencia registrada.",
    tone: "success",
  },
  invalid_member: {
    body: "Selecciona una cuenta valida.",
    tone: "error",
  },
  invalid_qr: {
    body: "El QR no es valido o ya vencio.",
    tone: "error",
  },
  missing_supabase_admin: {
    body: "Falta SUPABASE_SERVICE_ROLE_KEY para registrar asistencia real.",
    tone: "error",
  },
};

export default async function AdminAttendancePage({
  searchParams,
}: {
  searchParams: Promise<{ member?: string; notice?: string }>;
}) {
  await requireAdmin();

  const [{ member, notice }, data] = await Promise.all([
    searchParams,
    getAdminAttendanceData(),
  ]);
  const noticeConfig = notice ? noticeCopy[notice] : null;
  const activeMembers = data.members.filter((item) => item.isActive);

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
            Asistencia
          </p>
          <h1 className="mt-2 text-3xl font-black tracking-normal text-white sm:text-5xl">
            Registro de entrada
          </h1>
        </div>

        {noticeConfig ? (
          <AdminNotice
            body={member ? `${noticeConfig.body} ${member}` : noticeConfig.body}
            tone={noticeConfig.tone}
          />
        ) : null}
        {data.setupMessage ? (
          <AdminNotice body={data.setupMessage} tone="warning" />
        ) : null}

        <section className="grid gap-6 lg:grid-cols-[1fr_0.95fr]">
          <AttendanceScanner action={trackAttendanceFromQr} />

          <div className="rounded-3xl border border-white/10 bg-white/[0.025] p-4 sm:p-5">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.2em] text-zinc-500">
                  Sin telefono
                </p>
                <h2 className="mt-1 text-2xl font-black text-white">
                  Registro manual
                </h2>
              </div>
              <Search className="shrink-0 text-[#ff8bd8]" size={24} />
            </div>

            <form action={trackAttendanceManually} className="mt-5 grid gap-4">
              <div>
                <p className="text-[0.72rem] font-black uppercase tracking-[0.16em] text-zinc-500">
                  Cuenta
                </p>
                <div className="mt-2">
                  <SearchableMemberSelect
                    emptyMessage="No hay cuentas activas disponibles."
                    name="memberId"
                    options={activeMembers}
                  />
                </div>
              </div>

              <PendingSubmitButton
                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-white px-5 py-3 text-sm font-black text-black transition hover:bg-zinc-200"
                pendingLabel="Registrando..."
              >
                <CheckCircle2 size={18} />
                Registrar asistencia
              </PendingSubmitButton>
            </form>
          </div>
        </section>

        <section className="glass-panel mt-6 rounded-3xl p-5 sm:p-6">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-zinc-500">
                Hoy
              </p>
              <h2 className="mt-1 text-2xl font-black text-white">
                {data.todayLogs.length} asistencias
              </h2>
            </div>
            <UserRound className="text-[#ff2fa8]" size={24} />
          </div>

          <div className="mt-5 grid gap-3">
            {data.todayLogs.length ? (
              data.todayLogs.map((log) => (
                <div
                  key={log.id}
                  className="grid gap-2 rounded-2xl border border-white/10 bg-white/[0.035] p-4 sm:grid-cols-[1fr_auto] sm:items-center"
                >
                  <div>
                    <p className="font-black text-white">{log.memberName}</p>
                    <p className="mt-1 text-sm font-semibold text-[#ff8bd8]">
                      {log.groupName}
                    </p>
                  </div>
                  <p className="text-sm font-semibold text-zinc-400">
                    {formatAttendanceTime(log.completedAt)}
                  </p>
                </div>
              ))
            ) : (
              <div className="rounded-2xl border border-dashed border-white/10 p-5 text-center text-sm text-zinc-500">
                Sin asistencias registradas hoy.
              </div>
            )}
          </div>
        </section>
      </section>
    </main>
  );
}

function formatAttendanceTime(value: string) {
  return new Intl.DateTimeFormat("es-CO", {
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "America/Bogota",
  }).format(new Date(value));
}
