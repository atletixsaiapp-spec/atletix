import type { ReactNode } from "react";
import Link from "next/link";
import {
  Activity,
  CalendarX,
  CircleDollarSign,
  Search,
  UsersRound,
} from "lucide-react";
import { AdminMembersTable } from "@/components/ui/organisms/admin-members-table";
import { TopNav } from "@/components/ui/organisms/top-nav";
import { getAdminDashboardData } from "@/lib/admin-data";
import { requireAdmin } from "@/lib/auth";
import { formatCurrency, trainer } from "@/lib/atletix-data";

const noticeCopy: Record<string, { body: string; tone: "success" | "warning" | "error" }> = {
  invalid_member_form: {
    body: "Revisa los datos de la clienta. Nombre, correo, telefono y objetivo son obligatorios.",
    tone: "error",
  },
  member_auth_failed: {
    body: "No se pudo crear el usuario en Supabase Auth. Revisa si ese correo ya existe.",
    tone: "error",
  },
  member_created: {
    body: "Clienta creada y correo de activacion enviado.",
    tone: "success",
  },
  member_created_email_failed: {
    body: "Clienta creada, pero Resend no pudo enviar el correo.",
    tone: "warning",
  },
  member_created_email_missing: {
    body: "Clienta creada. Falta RESEND_API_KEY para enviar el correo.",
    tone: "warning",
  },
  member_created_link_failed: {
    body: "Clienta creada, pero Supabase no genero el link para resetear password.",
    tone: "warning",
  },
  member_profile_failed: {
    body: "No se pudo crear el perfil de la clienta.",
    tone: "error",
  },
  member_record_failed: {
    body: "No se pudo crear la ficha de la clienta.",
    tone: "error",
  },
  missing_supabase_admin: {
    body: "Falta SUPABASE_SERVICE_ROLE_KEY para crear clientas reales.",
    tone: "error",
  },
};

export default async function AdminPage({
  searchParams,
}: {
  searchParams: Promise<{ notice?: string }>;
}) {
  await requireAdmin();

  const [{ notice }, dashboard] = await Promise.all([
    searchParams,
    getAdminDashboardData(),
  ]);
  const noticeConfig = notice ? noticeCopy[notice] : null;
  const previewMembers = dashboard.members.slice(0, 5);

  return (
    <main className="atletix-shell min-h-screen">
      <TopNav active="admin" />

      <section className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="pb-6">
          <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[#ff8bd8]">
            Panel entrenador
          </p>
          <h1 className="mt-2 text-3xl font-black tracking-normal text-white sm:text-5xl">
            {trainer.gym} Control Center
          </h1>
        </div>

        {noticeConfig ? <AdminNotice {...noticeConfig} /> : null}
        {dashboard.setupMessage ? (
          <AdminNotice body={dashboard.setupMessage} tone="warning" />
        ) : null}

        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <AdminMetric
            icon={<UsersRound size={22} />}
            label="Total clientas"
            value={`${dashboard.stats.totalMembers}`}
            detail={`${dashboard.stats.activeMembers} activas`}
          />
          <AdminMetric
            icon={<CalendarX size={22} />}
            label="Vencidas"
            value={`${dashboard.stats.expiredMembers}`}
            detail={`${dashboard.stats.expiringMembers} por vencer`}
            tone="warning"
          />
          <AdminMetric
            icon={<CircleDollarSign size={22} />}
            label="Ingresos mes"
            value={formatCurrency(dashboard.stats.revenueMonth)}
            detail={`${formatCurrency(dashboard.stats.revenueToday)} hoy`}
            tone="money"
          />
          <AdminMetric
            icon={<Activity size={22} />}
            label="Asistencia"
            value={`${dashboard.stats.weeklyAttendance}`}
            detail="entrenos esta semana"
            tone="green"
          />
        </section>

        <section className="glass-panel mt-6 overflow-hidden rounded-3xl">
          <div className="flex flex-col gap-4 border-b border-white/10 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-zinc-500">
                Clientas
              </p>
              <h2 className="mt-1 text-2xl font-black text-white">
                Estado de membresias
              </h2>
            </div>
            <div className="flex min-h-11 w-full items-center justify-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-4 text-zinc-400 sm:w-auto">
              <Search size={17} />
              <span className="text-sm">Datos reales de Supabase</span>
            </div>
          </div>

          <AdminMembersTable members={previewMembers} />

          <div className="flex border-t border-white/10 p-5 sm:justify-end">
            <Link
              href="/admin/clientas"
              className="inline-flex w-full items-center justify-center rounded-full bg-white px-5 py-3 text-sm font-black text-black transition hover:bg-zinc-200 sm:w-auto"
            >
              Ver todo
            </Link>
          </div>
        </section>
      </section>
    </main>
  );
}

function AdminMetric({
  icon,
  label,
  value,
  detail,
  tone = "pink",
}: {
  icon: ReactNode;
  label: string;
  value: string;
  detail: string;
  tone?: "pink" | "warning" | "money" | "green";
}) {
  const tones = {
    green: "text-emerald-200",
    money: "text-cyan-200",
    pink: "text-[#ff8bd8]",
    warning: "text-amber-200",
  };

  return (
    <div className="glass-panel rounded-3xl p-5">
      <div className={`grid size-11 place-items-center rounded-2xl bg-white/[0.05] ${tones[tone]}`}>
        {icon}
      </div>
      <p className="mt-5 text-xs font-black uppercase tracking-[0.18em] text-zinc-500">
        {label}
      </p>
      <p className="metric-number mt-2 text-3xl font-black text-white">{value}</p>
      <p className="mt-1 text-sm text-zinc-500">{detail}</p>
    </div>
  );
}

function AdminNotice({
  body,
  tone,
}: {
  body: string;
  tone: "success" | "warning" | "error";
}) {
  const tones = {
    error: "border-red-300/20 bg-red-400/10 text-red-100",
    success: "border-emerald-300/20 bg-emerald-400/10 text-emerald-100",
    warning: "border-amber-300/20 bg-amber-400/10 text-amber-100",
  };

  return (
    <div className={`mb-6 rounded-2xl border px-4 py-3 text-sm font-semibold ${tones[tone]}`}>
      {body}
    </div>
  );
}
