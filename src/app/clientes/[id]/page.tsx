import type { ReactNode } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  Banknote,
  CalendarDays,
  Dumbbell,
  Flame,
  HeartPulse,
  LineChart,
  Medal,
  Ruler,
  Scale,
  Sparkles,
} from "lucide-react";
import { StatusBadge, TopNav } from "@/components/brand-nav";
import { requireAdmin } from "@/lib/auth";
import {
  formatCurrency,
  formatShortDate,
  getMembershipStatus,
  getPaymentsForMember,
  getProgressPercent,
  getRoutineForMember,
  members,
} from "@/lib/atletix-data";

export function generateStaticParams() {
  return members.map((member) => ({ id: member.id }));
}

export default async function ClientDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireAdmin();

  const { id } = await params;
  const member = members.find((item) => item.id === id);

  if (!member) {
    notFound();
  }

  const routine = getRoutineForMember(member.id);
  const memberPayments = getPaymentsForMember(member.id);
  const status = getMembershipStatus(member);
  const latest = member.progress[member.progress.length - 1];

  return (
    <main className="atletix-shell min-h-screen">
      <TopNav active="admin" />

      <section className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <Link
          href="/admin"
          className="inline-flex items-center gap-2 rounded-full border border-white/10 px-4 py-2 text-sm font-bold text-zinc-300 transition hover:border-[#ff2fa8]/50 hover:text-white"
        >
          <ArrowLeft size={16} />
          Volver al admin
        </Link>

        <div className="mt-6 grid gap-6 lg:grid-cols-[0.85fr_1.35fr]">
          <aside className="space-y-6">
            <section className="glass-panel rounded-3xl p-5 sm:p-6">
              <div className="flex items-center gap-4">
                <div className="avatar-aura grid size-20 place-items-center rounded-full border border-[#ff2fa8]/50 bg-[#ff2fa8]/10 text-2xl font-black text-white">
                  {member.initials}
                </div>
                <div>
                  <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#ff8bd8]">
                    Ficha clienta
                  </p>
                  <h1 className="mt-1 text-3xl font-black text-white">{member.name}</h1>
                  <p className="mt-1 text-sm text-zinc-400">{member.email}</p>
                </div>
              </div>

              <div className="mt-6 grid grid-cols-2 gap-3">
                <ProfileMetric icon={<Scale size={18} />} label="Peso" value={`${member.currentWeightKg} kg`} />
                <ProfileMetric icon={<Ruler size={18} />} label="Estatura" value={`${member.heightCm} cm`} />
                <ProfileMetric icon={<Sparkles size={18} />} label="XP" value={`${member.xp}`} />
                <ProfileMetric icon={<Flame size={18} />} label="Racha" value={`${member.streakDays} dias`} />
              </div>
            </section>

            <section className="glass-panel rounded-3xl p-5 sm:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold uppercase tracking-[0.2em] text-zinc-500">
                    Membresia
                  </p>
                  <h2 className="mt-1 text-2xl font-black text-white">
                    {formatShortDate(member.membershipEnd)}
                  </h2>
                </div>
                <StatusBadge status={status} />
              </div>
              <div className="mt-5 space-y-3">
                {memberPayments.map((payment) => (
                  <div
                    key={payment.id}
                    className="rounded-2xl border border-white/10 bg-white/[0.035] p-4"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <p className="font-black text-white">{formatCurrency(payment.amount)}</p>
                      <Banknote className="text-[#ff8bd8]" size={18} />
                    </div>
                    <p className="mt-2 text-sm text-zinc-500">
                      {payment.method} - {formatShortDate(payment.paidAt)}
                    </p>
                  </div>
                ))}
              </div>
            </section>
          </aside>

          <div className="space-y-6">
            <section className="glass-panel rounded-3xl p-5 sm:p-6">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <p className="text-sm font-semibold uppercase tracking-[0.2em] text-zinc-500">
                    Rutina asignada
                  </p>
                  <h2 className="mt-1 text-3xl font-black text-white">{routine.name}</h2>
                  <p className="mt-2 text-zinc-400">{routine.coachNotes}</p>
                </div>
                <span className="rounded-full bg-[#ff2fa8] px-3 py-1 text-xs font-black uppercase tracking-[0.16em] text-white">
                  {routine.day}
                </span>
              </div>

              <div className="mt-5 grid gap-3">
                {routine.exercises.map((exercise) => (
                  <div
                    key={exercise.name}
                    className="grid gap-3 rounded-2xl border border-white/10 bg-white/[0.035] p-4 sm:grid-cols-[1fr_auto]"
                  >
                    <div className="flex items-start gap-3">
                      <Dumbbell className="mt-1 text-[#ff2fa8]" size={18} />
                      <div>
                        <p className="font-black text-white">{exercise.name}</p>
                        <p className="text-sm text-zinc-500">{exercise.note}</p>
                      </div>
                    </div>
                    <p className="font-mono text-sm text-zinc-300">
                      {exercise.sets} x {exercise.reps} / {exercise.load}
                    </p>
                  </div>
                ))}
              </div>
            </section>

            <section className="grid gap-6 xl:grid-cols-[1fr_0.8fr]">
              <div className="glass-panel rounded-3xl p-5 sm:p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold uppercase tracking-[0.2em] text-zinc-500">
                      Evolucion
                    </p>
                    <h2 className="mt-1 text-2xl font-black text-white">
                      Medidas y peso
                    </h2>
                  </div>
                  <LineChart className="text-[#ff8bd8]" size={24} />
                </div>

                <div className="mt-6 flex h-56 items-end gap-3">
                  {member.progress.map((entry) => {
                    const height = 44 + (entry.weightKg - member.initialWeightKg + 3) * 20;

                    return (
                      <div key={entry.date} className="flex flex-1 flex-col items-center gap-2">
                        <div
                          className="w-full rounded-t-xl bg-gradient-to-t from-[#ff2fa8] to-[#ff8bd8]"
                          style={{ height: `${height}px` }}
                        />
                        <span className="font-mono text-xs text-zinc-500">
                          {entry.weightKg}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="glass-panel rounded-3xl p-5 sm:p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold uppercase tracking-[0.2em] text-zinc-500">
                      Check-in
                    </p>
                    <h2 className="mt-1 text-2xl font-black text-white">
                      Ultimo registro
                    </h2>
                  </div>
                  <HeartPulse className="text-emerald-300" size={24} />
                </div>

                <div className="mt-5 grid grid-cols-2 gap-3">
                  <ProfileMetric icon={<Scale size={18} />} label="Peso" value={`${latest.weightKg} kg`} />
                  <ProfileMetric icon={<Ruler size={18} />} label="Cintura" value={`${latest.waistCm} cm`} />
                  <ProfileMetric icon={<Medal size={18} />} label="Cadera" value={`${latest.hipCm} cm`} />
                  <ProfileMetric icon={<CalendarDays size={18} />} label="Semana" value={`${getProgressPercent(member)}%`} />
                </div>
              </div>
            </section>
          </div>
        </div>
      </section>
    </main>
  );
}

function ProfileMetric({
  icon,
  label,
  value,
}: {
  icon: ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.035] p-4">
      <div className="text-[#ff8bd8]">{icon}</div>
      <p className="mt-3 text-xs font-black uppercase tracking-[0.16em] text-zinc-500">
        {label}
      </p>
      <p className="metric-number mt-1 text-lg font-black text-white">{value}</p>
    </div>
  );
}
