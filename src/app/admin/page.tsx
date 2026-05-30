import type { ReactNode } from "react";
import Link from "next/link";
import {
  Activity,
  CalendarX,
  CircleDollarSign,
  Clock3,
  ListChecks,
  QrCode,
  UsersRound,
  WalletCards,
} from "lucide-react";
import { AdminNotice } from "@/components/ui/atoms/admin-notice";
import { AdminMembersTable } from "@/components/ui/organisms/admin-members-table";
import { TopNav } from "@/components/ui/organisms/top-nav";
import { getAdminDashboardData } from "@/lib/admin-data";
import { requireAdmin } from "@/lib/auth";
import { formatCurrency, trainer } from "@/lib/atletix-data";

export default async function AdminPage() {
  await requireAdmin();

  const dashboard = await getAdminDashboardData();
  const previewMembers = dashboard.members.slice(0, 5);

  return (
    <main className="atletix-shell min-h-screen">
      <TopNav active="admin" mode="admin" />

      <section className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="pb-6">
          <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[#ff8bd8]">
            Panel admin
          </p>
          <h1 className="mt-2 text-3xl font-black tracking-normal text-white sm:text-5xl">
            {trainer.gym} Control Center
          </h1>
        </div>

        {dashboard.setupMessage ? (
          <AdminNotice body={dashboard.setupMessage} tone="warning" />
        ) : null}

        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <AdminMetric
            icon={<UsersRound size={22} />}
            label="Total cuentas"
            value={`${dashboard.stats.totalMembers}`}
            detail={`${dashboard.stats.activeMembers} con membresia activa`}
          />
          <AdminMetric
            icon={<CalendarX size={22} />}
            label="Vencimientos"
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

        <section className="mt-6 grid gap-4 lg:grid-cols-4">
          <AdminShortcut
            href="/admin/asistencia"
            icon={<QrCode size={22} />}
            label="QR asistencia"
            title="Registrar entradas"
          />
          <AdminShortcut
            href="/admin/grupos"
            icon={<Clock3 size={22} />}
            label="Grupos"
            title="Horarios y cupos"
          />
          <AdminShortcut
            href="/admin/lista-espera"
            icon={<ListChecks size={22} />}
            label="Lista de espera"
            title="Gestionar solicitudes"
          />
          <AdminShortcut
            href="/admin/pagos"
            icon={<WalletCards size={22} />}
            label="Pagos"
            title="Validar comprobantes"
          />
        </section>

        <section className="glass-panel mt-6 overflow-hidden rounded-3xl">
          <div className="flex flex-col gap-4 border-b border-white/10 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-zinc-500">
                Cuentas
              </p>
              <h2 className="mt-1 text-2xl font-black text-white">
                Estado de membresias
              </h2>
            </div>
          </div>

          <AdminMembersTable members={previewMembers} />

          <div className="flex border-t border-white/10 p-5 sm:justify-end">
            <Link
              href="/admin/cuentas"
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

function AdminShortcut({
  href,
  icon,
  label,
  title,
}: {
  href: string;
  icon: ReactNode;
  label: string;
  title: string;
}) {
  return (
    <Link
      href={href}
      className="glass-panel flex flex-col gap-4 rounded-3xl p-5 transition hover:border-[#ff2fa8]/45 hover:bg-[#ff2fa8]/10 sm:flex-row sm:items-center sm:justify-between"
    >
      <span className="flex items-center gap-3">
        <span className="grid size-12 place-items-center rounded-2xl bg-[#ff2fa8]/15 text-[#ff8bd8]">
          {icon}
        </span>
        <span>
          <span className="block text-sm font-black uppercase tracking-[0.18em] text-zinc-500">
            {label}
          </span>
          <span className="mt-1 block text-xl font-black text-white">
            {title}
          </span>
        </span>
      </span>
      <span className="inline-flex min-h-11 items-center justify-center rounded-full bg-white px-5 text-sm font-black text-black">
        Abrir
      </span>
    </Link>
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
      <div
        className={`grid size-11 place-items-center rounded-2xl bg-white/[0.05] ${tones[tone]}`}
      >
        {icon}
      </div>
      <p className="mt-5 text-xs font-black uppercase tracking-[0.18em] text-zinc-500">
        {label}
      </p>
      <p className="metric-number mt-2 text-3xl font-black text-white">
        {value}
      </p>
      <p className="mt-1 text-sm text-zinc-500">{detail}</p>
    </div>
  );
}
