import type { ReactNode } from "react";
import {
  Activity,
  BadgeCheck,
  CalendarDays,
  Dumbbell,
  Flame,
  HeartPulse,
  Medal,
  ShieldCheck,
  Sparkles,
  Trophy,
  UserRound,
  WalletCards,
} from "lucide-react";
import { StatusBadge, TopNav } from "@/components/brand-nav";
import {
  formatCurrency,
  formatShortDate,
  getMembershipStatus,
  getPaymentsForMember,
  getProgressPercent,
  getRoutineForMember,
  getWeightDelta,
  members,
  motivationalMessages,
  trainer,
} from "@/lib/atletix-data";

const featuredMember = members[0];
const routine = getRoutineForMember(featuredMember.id);
const memberPayments = getPaymentsForMember(featuredMember.id);
const membershipStatus = getMembershipStatus(featuredMember);
const weeklyPercent = getProgressPercent(featuredMember);
const weightDelta = getWeightDelta(featuredMember);

export default function Home() {
  return (
    <main className="atletix-shell min-h-screen">
      <TopNav active="demo" />

      <div className="mx-auto w-full max-w-7xl px-4 pt-6 sm:px-6 lg:px-8">
        <div className="rounded-2xl border border-amber-300/20 bg-amber-300/10 px-4 py-3 text-sm font-semibold text-amber-100">
          Demo visual con datos ficticios. La app real requiere login y datos de Supabase.
        </div>
      </div>

      <section className="mx-auto grid w-full max-w-7xl gap-6 px-4 py-6 sm:px-6 lg:grid-cols-[0.9fr_1.45fr] lg:px-8">
        <aside className="space-y-6">
          <section className="glass-panel rounded-3xl p-5 sm:p-6">
            <div className="flex items-center gap-4">
              <div className="avatar-aura grid size-20 place-items-center rounded-full border border-[#ff2fa8]/50 bg-[#ff2fa8]/10 text-2xl font-black text-white">
                {featuredMember.initials}
              </div>
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#ff8bd8]">
                  Perfil activo
                </p>
                <h1 className="mt-1 text-2xl font-black tracking-normal text-white">
                  Bienvenida, {featuredMember.name.split(" ")[0]}
                </h1>
                <p className="mt-1 text-sm text-zinc-400">
                  {featuredMember.goal} / {featuredMember.heightCm} cm
                </p>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-3 gap-3">
              <MiniStat label="Nivel" value={featuredMember.level} icon={<Trophy size={16} />} />
              <MiniStat label="XP" value={`${featuredMember.xp}`} icon={<Sparkles size={16} />} />
              <MiniStat label="Racha" value={`${featuredMember.streakDays}d`} icon={<Flame size={16} />} />
            </div>
          </section>

          <section className="glass-panel rounded-3xl p-5 sm:p-6">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.2em] text-zinc-500">
                  Membresia
                </p>
                <h2 className="mt-1 text-xl font-black text-white">
                  {formatShortDate(featuredMember.membershipEnd)}
                </h2>
              </div>
              <StatusBadge status={membershipStatus} />
            </div>

            <div className="mt-5 space-y-3 text-sm">
              <InfoRow
                icon={<CalendarDays size={16} />}
                label="Inicio"
                value={formatShortDate(featuredMember.membershipStart)}
              />
              <InfoRow
                icon={<ShieldCheck size={16} />}
                label="Vence"
                value={formatShortDate(featuredMember.membershipEnd)}
              />
              <InfoRow
                icon={<WalletCards size={16} />}
                label="Ultimo pago"
                value={formatCurrency(memberPayments[0]?.amount ?? 0)}
              />
            </div>
          </section>

          <section className="glass-panel rounded-3xl p-5 sm:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.2em] text-zinc-500">
                  Avatar
                </p>
                <h2 className="mt-1 text-xl font-black text-white">
                  {featuredMember.level}
                </h2>
              </div>
              <Medal className="text-[#ff2fa8]" size={28} />
            </div>

            <div className="mt-5 grid place-items-center">
              <ProgressAvatar level={featuredMember.level} />
            </div>

            <div className="mt-5 flex flex-wrap gap-2">
              {featuredMember.avatarUnlocks.map((unlock) => (
                <span
                  key={unlock}
                  className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-xs font-semibold text-zinc-300"
                >
                  {unlock}
                </span>
              ))}
            </div>
          </section>
        </aside>

        <div className="space-y-6">
          <section className="glass-panel overflow-hidden rounded-3xl">
            <div className="border-b border-white/10 p-5 sm:p-6">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#ff8bd8]">
                    {trainer.gym} / {trainer.slogan}
                  </p>
                  <h2 className="mt-2 max-w-2xl text-3xl font-black tracking-normal text-white sm:text-5xl">
                    {motivationalMessages[0]}
                  </h2>
                </div>
                <div className="grid min-w-48 grid-cols-2 gap-3">
                  <Metric label="Semana" value={`${weeklyPercent}%`} tone="pink" />
                  <Metric label="Peso" value={`${weightDelta > 0 ? "+" : ""}${weightDelta} kg`} tone="green" />
                </div>
              </div>
            </div>

            <div className="grid gap-0 lg:grid-cols-[1fr_0.82fr]">
              <div id="rutina" className="p-5 sm:p-6">
                <div className="mb-4 flex items-center justify-between gap-4">
                  <div>
                    <p className="text-sm font-semibold uppercase tracking-[0.2em] text-zinc-500">
                      Mi rutina
                    </p>
                    <h3 className="mt-1 text-2xl font-black text-white">
                      {routine.name}
                    </h3>
                  </div>
                  <span className="rounded-full bg-[#ff2fa8] px-3 py-1 text-xs font-black uppercase tracking-[0.16em] text-white">
                    {routine.day}
                  </span>
                </div>

                <div className="space-y-3">
                  {routine.exercises.map((exercise) => (
                    <div
                      key={exercise.name}
                      className="grid gap-3 rounded-2xl border border-white/10 bg-white/[0.035] p-4 sm:grid-cols-[1fr_auto]"
                    >
                      <div>
                        <div className="flex items-center gap-3">
                          <Dumbbell className="text-[#ff2fa8]" size={18} />
                          <p className="font-bold text-white">{exercise.name}</p>
                        </div>
                        <p className="mt-1 text-sm text-zinc-400">{exercise.note}</p>
                      </div>
                      <div className="grid grid-cols-3 gap-2 text-center text-sm">
                        <SetPill label="Series" value={exercise.sets} />
                        <SetPill label="Reps" value={exercise.reps} />
                        <SetPill label="Carga" value={exercise.load} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div id="progreso" className="border-t border-white/10 p-5 sm:p-6 lg:border-l lg:border-t-0">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold uppercase tracking-[0.2em] text-zinc-500">
                      Progreso semanal
                    </p>
                    <h3 className="mt-1 text-2xl font-black text-white">
                      {featuredMember.weeklyCompleted}/{featuredMember.weeklyGoal} entrenos
                    </h3>
                  </div>
                  <Activity className="text-[#ff2fa8]" size={24} />
                </div>

                <div className="mt-6 h-3 overflow-hidden rounded-full bg-white/10">
                  <div
                    className="neon-line h-full rounded-full bg-[#ff2fa8]"
                    style={{ width: `${weeklyPercent}%` }}
                  />
                </div>

                <div className="mt-8">
                  <p className="text-sm font-semibold uppercase tracking-[0.2em] text-zinc-500">
                    Peso registrado
                  </p>
                  <div className="mt-4 flex h-48 items-end gap-3">
                    {featuredMember.progress.map((entry) => {
                      const height = 32 + (entry.weightKg - 57) * 24;

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

                <div id="membresia" className="mt-6 rounded-2xl border border-emerald-400/20 bg-emerald-400/10 p-4">
                  <div className="flex items-start gap-3">
                    <BadgeCheck className="mt-0.5 text-emerald-300" size={18} />
                    <p className="text-sm leading-6 text-emerald-50">
                      Entrenamiento listo para marcar como completado despues de la sesion.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section className="grid gap-6 lg:grid-cols-3">
            <ActionLink icon={<Dumbbell size={20} />} title="Mi rutina" href="#rutina" />
            <ActionLink icon={<HeartPulse size={20} />} title="Mi progreso" href="#progreso" />
            <ActionLink icon={<WalletCards size={20} />} title="Mi membresia" href="#membresia" />
          </section>
        </div>
      </section>
    </main>
  );
}

function MiniStat({
  label,
  value,
  icon,
}: {
  label: string;
  value: string;
  icon: ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.035] p-3">
      <div className="text-[#ff8bd8]">{icon}</div>
      <p className="mt-2 text-xs font-semibold uppercase tracking-[0.14em] text-zinc-500">
        {label}
      </p>
      <p className="mt-1 truncate text-sm font-black text-white">{value}</p>
    </div>
  );
}

function InfoRow({
  icon,
  label,
  value,
}: {
  icon: ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-2xl bg-white/[0.035] px-4 py-3">
      <div className="flex items-center gap-3 text-zinc-400">
        {icon}
        <span>{label}</span>
      </div>
      <span className="font-semibold text-white">{value}</span>
    </div>
  );
}

function ProgressAvatar({ level }: { level: string }) {
  return (
    <div className="relative grid size-56 place-items-center rounded-full border border-[#ff2fa8]/30 bg-[#ff2fa8]/5">
      <div className="absolute inset-6 rounded-full border border-[#ff8bd8]/20" />
      <div className="relative flex flex-col items-center">
        <div className="grid size-20 place-items-center rounded-full border border-white/20 bg-zinc-950">
          <UserRound size={42} className="text-[#ff8bd8]" />
        </div>
        <div className="mt-[-6px] h-20 w-28 rounded-b-xl rounded-t-[2rem] border border-white/20 bg-[#ff2fa8]" />
        <div className="mt-3 rounded-full border border-white/10 bg-black/40 px-4 py-1 text-xs font-black uppercase tracking-[0.18em] text-white">
          {level}
        </div>
      </div>
    </div>
  );
}

function Metric({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone: "pink" | "green";
}) {
  const toneClass = tone === "pink" ? "text-[#ff8bd8]" : "text-emerald-300";

  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.035] p-4">
      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-zinc-500">
        {label}
      </p>
      <p className={`metric-number mt-2 text-2xl font-black ${toneClass}`}>
        {value}
      </p>
    </div>
  );
}

function SetPill({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-16 rounded-xl bg-black/28 px-2 py-2">
      <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-zinc-500">
        {label}
      </p>
      <p className="mt-1 font-black text-white">{value}</p>
    </div>
  );
}

function ActionLink({
  icon,
  title,
  href,
}: {
  icon: ReactNode;
  title: string;
  href: string;
}) {
  return (
    <a
      href={href}
      className="glass-panel flex items-center justify-between rounded-3xl p-5 transition hover:border-[#ff2fa8]/45 hover:bg-[#ff2fa8]/10"
    >
      <span className="flex items-center gap-3 font-black text-white">
        <span className="grid size-10 place-items-center rounded-2xl bg-[#ff2fa8]/15 text-[#ff8bd8]">
          {icon}
        </span>
        {title}
      </span>
      <span className="text-zinc-500">Abrir</span>
    </a>
  );
}
