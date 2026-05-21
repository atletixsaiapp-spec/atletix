import Link from "next/link";
import type { ReactNode } from "react";
import {
  Activity,
  Banknote,
  CalendarClock,
  CalendarX,
  CheckCircle2,
  CircleDollarSign,
  ClipboardList,
  MessageCircle,
  Plus,
  Search,
  TrendingUp,
  UsersRound,
} from "lucide-react";
import { StatusBadge, TopNav } from "@/components/brand-nav";
import {
  calculateAdminStats,
  formatCurrency,
  formatShortDate,
  getDaysUntil,
  getMembershipStatus,
  getProgressPercent,
  getRoutineForMember,
  members,
  trainer,
} from "@/lib/atletix-data";

const stats = calculateAdminStats();
const attentionMembers = members.filter((member) => {
  const status = getMembershipStatus(member);
  return status === "expired" || status === "expiring";
});

export default function AdminPage() {
  return (
    <main className="atletix-shell min-h-screen">
      <TopNav active="admin" />

      <section className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-4 pb-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[#ff8bd8]">
              Panel entrenador
            </p>
            <h1 className="mt-2 text-3xl font-black tracking-normal text-white sm:text-5xl">
              {trainer.gym} Control Center
            </h1>
          </div>
          <div className="flex flex-wrap gap-3">
            <button className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-3 text-sm font-black text-black transition hover:bg-zinc-200">
              <Plus size={18} />
              Nueva clienta
            </button>
            <button className="inline-flex items-center gap-2 rounded-full border border-[#ff2fa8]/50 bg-[#ff2fa8]/12 px-4 py-3 text-sm font-black text-white transition hover:bg-[#ff2fa8]/20">
              <Banknote size={18} />
              Registrar pago
            </button>
          </div>
        </div>

        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <AdminMetric
            icon={<UsersRound size={22} />}
            label="Total clientas"
            value={`${stats.totalMembers}`}
            detail={`${stats.activeMembers} activas`}
          />
          <AdminMetric
            icon={<CalendarX size={22} />}
            label="Vencidas"
            value={`${stats.expiredMembers}`}
            detail={`${stats.expiringMembers} por vencer`}
            tone="warning"
          />
          <AdminMetric
            icon={<CircleDollarSign size={22} />}
            label="Ingresos mes"
            value={formatCurrency(stats.revenueMonth)}
            detail={`${formatCurrency(stats.revenueToday)} ultimo registro`}
            tone="money"
          />
          <AdminMetric
            icon={<Activity size={22} />}
            label="Asistencia"
            value={`${stats.weeklyAttendance}`}
            detail="entrenos esta semana"
            tone="green"
          />
        </section>

        <section className="mt-6 grid gap-6 xl:grid-cols-[1.4fr_0.8fr]">
          <div className="glass-panel overflow-hidden rounded-3xl">
            <div className="flex flex-col gap-4 border-b border-white/10 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.2em] text-zinc-500">
                  Clientas
                </p>
                <h2 className="mt-1 text-2xl font-black text-white">
                  Estado de membresias
                </h2>
              </div>
              <div className="flex min-h-11 items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-4 text-zinc-400">
                <Search size={17} />
                <span className="text-sm">Buscar clienta</span>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full min-w-[760px] text-left">
                <thead className="border-b border-white/10 text-xs uppercase tracking-[0.18em] text-zinc-500">
                  <tr>
                    <th className="px-5 py-4 font-black">Clienta</th>
                    <th className="px-5 py-4 font-black">Membresia</th>
                    <th className="px-5 py-4 font-black">Progreso</th>
                    <th className="px-5 py-4 font-black">Rutina</th>
                    <th className="px-5 py-4 font-black">Accion</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/10">
                  {members.map((member) => {
                    const status = getMembershipStatus(member);
                    const routine = getRoutineForMember(member.id);
                    const days = getDaysUntil(member.membershipEnd);

                    return (
                      <tr key={member.id} className="bg-white/[0.015]">
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            <div className="grid size-11 place-items-center rounded-2xl bg-[#ff2fa8]/15 font-black text-[#ff8bd8]">
                              {member.initials}
                            </div>
                            <div>
                              <p className="font-black text-white">{member.name}</p>
                              <p className="text-sm text-zinc-500">{member.goal}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-5 py-4">
                          <div className="space-y-2">
                            <StatusBadge status={status} />
                            <p className="text-sm text-zinc-500">
                              {days >= 0 ? `${days} dias restantes` : `${Math.abs(days)} dias vencida`}
                            </p>
                          </div>
                        </td>
                        <td className="px-5 py-4">
                          <div className="w-36">
                            <div className="flex items-center justify-between text-sm">
                              <span className="text-zinc-500">Semana</span>
                              <span className="font-black text-white">
                                {getProgressPercent(member)}%
                              </span>
                            </div>
                            <div className="mt-2 h-2 overflow-hidden rounded-full bg-white/10">
                              <div
                                className="h-full rounded-full bg-[#ff2fa8]"
                                style={{ width: `${getProgressPercent(member)}%` }}
                              />
                            </div>
                          </div>
                        </td>
                        <td className="px-5 py-4">
                          <p className="font-semibold text-white">{routine.name}</p>
                          <p className="text-sm text-zinc-500">{routine.day}</p>
                        </td>
                        <td className="px-5 py-4">
                          <Link
                            href={`/clientes/${member.id}`}
                            className="rounded-full border border-white/10 px-4 py-2 text-sm font-bold text-white transition hover:border-[#ff2fa8]/60 hover:bg-[#ff2fa8]/10"
                          >
                            Ver ficha
                          </Link>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          <div className="space-y-6">
            <section className="glass-panel rounded-3xl p-5 sm:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold uppercase tracking-[0.2em] text-zinc-500">
                    Pagos manuales
                  </p>
                  <h2 className="mt-1 text-2xl font-black text-white">
                    Activar membresia
                  </h2>
                </div>
                <CheckCircle2 className="text-emerald-300" size={26} />
              </div>

              <form className="mt-5 space-y-3">
                <Field label="Clienta" value="Isabella Rojas" />
                <Field label="Monto" value="150000" />
                <Field label="Metodo" value="Nequi" />
                <Field label="Vence" value="2026-06-08" />
                <button className="mt-2 inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-[#ff2fa8] px-4 py-3 font-black text-white shadow-[0_0_26px_rgba(255,47,168,0.35)] transition hover:bg-[#ff007a]">
                  <Banknote size={18} />
                  Guardar pago
                </button>
              </form>
            </section>

            <section className="glass-panel rounded-3xl p-5 sm:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold uppercase tracking-[0.2em] text-zinc-500">
                    Atencion
                  </p>
                  <h2 className="mt-1 text-2xl font-black text-white">
                    WhatsApp rapido
                  </h2>
                </div>
                <MessageCircle className="text-[#ff8bd8]" size={26} />
              </div>

              <div className="mt-5 space-y-3">
                {attentionMembers.map((member) => (
                  <a
                    key={member.id}
                    href={whatsappLink(member.name, member.phone)}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center justify-between gap-4 rounded-2xl border border-white/10 bg-white/[0.035] p-4 transition hover:border-emerald-300/40 hover:bg-emerald-300/10"
                  >
                    <div>
                      <p className="font-black text-white">{member.name}</p>
                      <p className="text-sm text-zinc-500">
                        Vence {formatShortDate(member.membershipEnd)}
                      </p>
                    </div>
                    <MessageCircle className="text-emerald-300" size={20} />
                  </a>
                ))}
              </div>
            </section>
          </div>
        </section>

        <section className="mt-6 grid gap-6 lg:grid-cols-3">
          <AdminWorkPanel
            icon={<ClipboardList size={22} />}
            title="Rutinas"
            body="Asignacion de ejercicios, series, repeticiones, carga y notas del coach."
          />
          <AdminWorkPanel
            icon={<TrendingUp size={22} />}
            title="Progreso"
            body="Peso, medidas, racha, fotos futuras y comparacion de avances."
          />
          <AdminWorkPanel
            icon={<CalendarClock size={22} />}
            title="Vencimientos"
            body="Control diario de activas, por vencer, vencidas y pagos confirmados."
          />
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
    pink: "text-[#ff8bd8]",
    warning: "text-amber-200",
    money: "text-cyan-200",
    green: "text-emerald-200",
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

function Field({ label, value }: { label: string; value: string }) {
  return (
    <label className="block">
      <span className="text-xs font-black uppercase tracking-[0.16em] text-zinc-500">
        {label}
      </span>
      <input
        defaultValue={value}
        className="mt-2 h-12 w-full rounded-2xl border border-white/10 bg-black/30 px-4 text-sm font-semibold text-white outline-none transition placeholder:text-zinc-600 focus:border-[#ff2fa8]/60"
      />
    </label>
  );
}

function AdminWorkPanel({
  icon,
  title,
  body,
}: {
  icon: ReactNode;
  title: string;
  body: string;
}) {
  return (
    <div className="glass-panel rounded-3xl p-5">
      <div className="flex items-start gap-4">
        <div className="grid size-11 place-items-center rounded-2xl bg-[#ff2fa8]/15 text-[#ff8bd8]">
          {icon}
        </div>
        <div>
          <h3 className="text-xl font-black text-white">{title}</h3>
          <p className="mt-2 leading-6 text-zinc-400">{body}</p>
        </div>
      </div>
    </div>
  );
}

function whatsappLink(name: string, phone: string) {
  const text = `Hola ${name}, tu mensualidad de ATLETIX necesita revision. Enviame el comprobante por WhatsApp y activo tu membresia.`;

  return `https://wa.me/${phone}?text=${encodeURIComponent(text)}`;
}
