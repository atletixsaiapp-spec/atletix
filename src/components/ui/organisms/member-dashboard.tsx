import type { ReactNode } from "react";
import {
  Activity,
  BadgeCheck,
  CalendarDays,
  Dumbbell,
  Flame,
  HeartPulse,
  Medal,
  Ruler,
  ShieldCheck,
  Sparkles,
  Trophy,
  UserRound,
  WalletCards,
} from "lucide-react";
import { AdminNotice } from "@/components/ui/atoms/admin-notice";
import { StatusBadge } from "@/components/ui/atoms/status-badge";
import type { MemberDashboardData } from "@/lib/member-dashboard";
import { formatCurrency, formatShortDate } from "@/lib/atletix-data";

const weeklyGoal = 5;

export function MemberDashboard({ data }: { data: MemberDashboardData }) {
  const member = data.member;
  const firstName = member.name.split(" ").filter(Boolean)[0] ?? member.name;
  const weeklyPercent = Math.min(
    100,
    Math.round((data.stats.attendanceWeek / weeklyGoal) * 100),
  );
  const weightEntries = getWeightEntries(data);
  const latestProgress = data.progress[data.progress.length - 1] ?? null;
  const latestPayment = data.payments[0] ?? null;
  const weightDelta = data.stats.weightChangeKg;

  return (
    <section className="mx-auto grid w-full max-w-7xl gap-6 px-4 py-6 sm:px-6 lg:grid-cols-[0.9fr_1.45fr] lg:px-8">
      <aside className="space-y-6">
        {data.loadMessage ? <AdminNotice body={data.loadMessage} tone="warning" /> : null}

        <section className="glass-panel rounded-3xl p-5 sm:p-6">
          <div className="flex items-center gap-4">
            <div className="avatar-aura grid size-20 place-items-center rounded-full border border-[#ff2fa8]/50 bg-[#ff2fa8]/10 text-2xl font-black text-white">
              {member.initials || "A"}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#ff8bd8]">
                {member.isActive ? "Perfil activo" : "Perfil pendiente"}
              </p>
              <h1 className="mt-1 truncate text-2xl font-black tracking-normal text-white">
                Hola, {firstName}
              </h1>
              <p className="mt-1 text-sm text-zinc-400">
                {member.goal} / {member.heightCm ? `${member.heightCm} cm` : "Estatura pendiente"}
              </p>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-3 gap-3">
            <MiniStat label="Nivel" value={member.level} icon={<Trophy size={16} />} />
            <MiniStat label="XP" value={`${member.xp}`} icon={<Sparkles size={16} />} />
            <MiniStat label="Racha" value={`${member.streakDays}d`} icon={<Flame size={16} />} />
          </div>
        </section>

        <section id="membresia" className="glass-panel rounded-3xl p-5 sm:p-6">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-zinc-500">
                Membresia
              </p>
              <h2 className="mt-1 text-xl font-black text-white">
                {data.membership ? formatShortDate(data.membership.endDate) : "Sin fecha activa"}
              </h2>
            </div>
            {data.membership ? (
              <StatusBadge status={data.membership.status} />
            ) : (
              <span className="rounded-full border border-amber-300/30 bg-amber-400/10 px-3 py-1 text-xs font-black uppercase tracking-[0.16em] text-amber-200">
                Pendiente
              </span>
            )}
          </div>

          <div className="mt-5 space-y-3 text-sm">
            <InfoRow
              icon={<CalendarDays size={16} />}
              label="Inicio"
              value={data.membership ? formatShortDate(data.membership.startDate) : "Pendiente"}
            />
            <InfoRow
              icon={<ShieldCheck size={16} />}
              label="Vence"
              value={data.membership ? formatShortDate(data.membership.endDate) : "Pendiente"}
            />
            <InfoRow
              icon={<WalletCards size={16} />}
              label="Ultimo pago"
              value={latestPayment ? formatCurrency(latestPayment.amountCop) : "Sin pagos"}
            />
          </div>
        </section>

        <section className="glass-panel rounded-3xl p-5 sm:p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-zinc-500">
                Avatar
              </p>
              <h2 className="mt-1 text-xl font-black text-white">{member.level}</h2>
            </div>
            <Medal className="text-[#ff2fa8]" size={28} />
          </div>

          <div className="mt-5 grid place-items-center">
            <ProgressAvatar level={member.level} />
          </div>

          <div className="mt-5 grid gap-2 text-sm text-zinc-300">
            <div className="rounded-2xl border border-white/10 bg-white/[0.035] px-4 py-3">
              {data.achievements.length
                ? `${data.achievements.length} logros desbloqueados`
                : "Logros listos para desbloquear"}
            </div>
          </div>
        </section>
      </aside>

      <div className="space-y-6">
        <section className="glass-panel overflow-hidden rounded-3xl">
          <div className="border-b border-white/10 p-5 sm:p-6">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#ff8bd8]">
                  ATLETIX / Panel personal
                </p>
                <h2 className="mt-2 max-w-2xl text-3xl font-black tracking-normal text-white sm:text-5xl">
                  Hoy el compromiso es contigo.
                </h2>
              </div>
              <div className="grid min-w-48 grid-cols-2 gap-3">
                <Metric label="Semana" value={`${weeklyPercent}%`} tone="pink" />
                <Metric
                  label="Peso"
                  value={formatWeightDelta(weightDelta)}
                  tone={weightDelta !== null && weightDelta < 0 ? "pink" : "green"}
                />
              </div>
            </div>
          </div>

          <div className="grid gap-0 lg:grid-cols-[1fr_0.82fr]">
            <div id="rutina" className="p-5 sm:p-6">
              <div className="mb-4 flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm font-semibold uppercase tracking-[0.2em] text-zinc-500">
                    Rutina asignada
                  </p>
                  <h3 className="mt-1 text-2xl font-black text-white">
                    {data.routine?.name ?? "Pendiente"}
                  </h3>
                </div>
                {data.routine ? (
                  <span className="rounded-full bg-[#ff2fa8] px-3 py-1 text-xs font-black uppercase tracking-[0.16em] text-white">
                    {data.routine.dayName}
                  </span>
                ) : null}
              </div>

              {data.routine?.exercises.length ? (
                <div className="space-y-3">
                  {data.routine.exercises.map((exercise) => (
                    <div
                      key={exercise.id}
                      className="grid gap-3 rounded-2xl border border-white/10 bg-white/[0.035] p-4 sm:grid-cols-[1fr_auto]"
                    >
                      <div>
                        <div className="flex items-center gap-3">
                          <Dumbbell className="text-[#ff2fa8]" size={18} />
                          <p className="font-bold text-white">{exercise.name}</p>
                        </div>
                        <p className="mt-1 text-sm text-zinc-400">{exercise.coachNote}</p>
                      </div>
                      <div className="grid grid-cols-3 gap-2 text-center text-sm">
                        <SetPill label="Series" value={exercise.sets} />
                        <SetPill label="Reps" value={exercise.reps} />
                        <SetPill label="Carga" value={exercise.load} />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <EmptyState
                  icon={<Dumbbell size={20} />}
                  title="Rutina pendiente"
                  body="Cuando el equipo asigne una rutina, aparecera aqui con ejercicios, series y notas."
                />
              )}
            </div>

            <div id="progreso" className="border-t border-white/10 p-5 sm:p-6 lg:border-l lg:border-t-0">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm font-semibold uppercase tracking-[0.2em] text-zinc-500">
                    Progreso semanal
                  </p>
                  <h3 className="mt-1 text-2xl font-black text-white">
                    {data.stats.attendanceWeek}/{weeklyGoal} entrenos
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
                {weightEntries.length ? (
                  <WeightBars entries={weightEntries} />
                ) : (
                  <EmptyState
                    icon={<HeartPulse size={20} />}
                    title="Sin peso registrado"
                    body="Tu primer registro de peso aparecera aqui como punto inicial."
                  />
                )}
              </div>

              <div className="mt-6 rounded-2xl border border-emerald-400/20 bg-emerald-400/10 p-4">
                <div className="flex items-start gap-3">
                  <BadgeCheck className="mt-0.5 text-emerald-300" size={18} />
                  <p className="text-sm leading-6 text-emerald-50">
                    Tu cuenta ya lee progreso, pagos, rutina y asistencia desde Supabase.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="grid gap-6 lg:grid-cols-3">
          <ActionLink icon={<Dumbbell size={20} />} title="Mi rutina" href="#rutina" />
          <ActionLink icon={<HeartPulse size={20} />} title="Mi progreso" href="#progreso" />
          <ActionLink icon={<WalletCards size={20} />} title="Membresia" href="#membresia" />
        </section>

        <section className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
          <section className="glass-panel rounded-3xl p-5 sm:p-6">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.2em] text-zinc-500">
                  Asistencia
                </p>
                <h3 className="mt-1 text-2xl font-black text-white">
                  {data.stats.attendanceMonth} este mes
                </h3>
              </div>
              <Activity className="text-[#ff2fa8]" size={24} />
            </div>
            <div className="mt-6 flex h-36 items-end gap-2">
              {data.attendanceChart.map((item) => (
                <div key={item.label} className="flex flex-1 flex-col items-center gap-2">
                  <div
                    className="w-full rounded-t-xl bg-gradient-to-t from-[#ff2fa8] to-[#ff8bd8]"
                    style={{ height: `${Math.max(10, item.count * 34)}px` }}
                  />
                  <span className="text-xs font-bold uppercase text-zinc-500">{item.label}</span>
                </div>
              ))}
            </div>
          </section>

          <section className="glass-panel rounded-3xl p-5 sm:p-6">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-zinc-500">
                Datos de progreso
              </p>
              <h3 className="mt-1 text-2xl font-black text-white">
                {data.stats.progressEntries} registros
              </h3>
            </div>

            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              <InfoRow
                icon={<HeartPulse size={16} />}
                label="Peso actual"
                value={member.currentWeightKg ? `${member.currentWeightKg} kg` : "Pendiente"}
              />
              <InfoRow
                icon={<Ruler size={16} />}
                label="Estatura"
                value={member.heightCm ? `${member.heightCm} cm` : "Pendiente"}
              />
              <InfoRow
                icon={<CalendarDays size={16} />}
                label="Edad"
                value={member.age !== null ? `${member.age} anos` : "Pendiente"}
              />
              <InfoRow
                icon={<UserRound size={16} />}
                label="Medidas"
                value={formatMeasurements(latestProgress)}
              />
            </div>
          </section>
        </section>

        <section className="glass-panel rounded-3xl p-5 sm:p-6">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-zinc-500">
                Historial de pagos
              </p>
              <h3 className="mt-1 text-2xl font-black text-white">
                {formatCurrency(data.stats.totalPaidCop)}
              </h3>
            </div>
            <p className="text-sm text-zinc-500">Pagos registrados manualmente</p>
          </div>

          {data.payments.length ? (
            <div className="mt-5 grid gap-3">
              {data.payments.slice(0, 3).map((payment) => (
                <div
                  key={payment.id}
                  className="grid gap-2 rounded-2xl border border-white/10 bg-white/[0.035] p-4 sm:grid-cols-[1fr_auto] sm:items-center"
                >
                  <div>
                    <p className="font-black text-white">{formatCurrency(payment.amountCop)}</p>
                    <p className="mt-1 text-sm text-zinc-400">
                      {formatShortDate(payment.periodStart)} - {formatShortDate(payment.periodEnd)}
                    </p>
                  </div>
                  <p className="text-sm font-semibold text-zinc-300">
                    {formatPaymentMethod(payment.method)} / {formatShortDate(payment.paidAt)}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState
              icon={<WalletCards size={20} />}
              title="Sin pagos registrados"
              body="Cuando el equipo confirme un pago manual, el historial aparecera aqui."
            />
          )}
        </section>
      </div>
    </section>
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
      <div className="flex min-w-0 items-center gap-3 text-zinc-400">
        {icon}
        <span className="truncate">{label}</span>
      </div>
      <span className="text-right font-semibold text-white">{value}</span>
    </div>
  );
}

function ProgressAvatar({ level }: { level: string }) {
  return (
    <div className="relative grid size-56 max-w-full place-items-center rounded-full border border-[#ff2fa8]/30 bg-[#ff2fa8]/5">
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
      <p className={`metric-number mt-2 text-2xl font-black ${toneClass}`}>{value}</p>
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

function EmptyState({
  body,
  icon,
  title,
}: {
  body: string;
  icon: ReactNode;
  title: string;
}) {
  return (
    <div className="mt-5 rounded-2xl border border-white/10 bg-white/[0.035] p-4">
      <div className="flex items-start gap-3">
        <span className="grid size-10 shrink-0 place-items-center rounded-2xl bg-[#ff2fa8]/15 text-[#ff8bd8]">
          {icon}
        </span>
        <div>
          <p className="font-black text-white">{title}</p>
          <p className="mt-1 text-sm leading-6 text-zinc-400">{body}</p>
        </div>
      </div>
    </div>
  );
}

function WeightBars({
  entries,
}: {
  entries: { date: string; weightKg: number }[];
}) {
  const weights = entries.map((entry) => entry.weightKg);
  const min = Math.min(...weights);
  const max = Math.max(...weights);
  const range = Math.max(1, max - min);

  return (
    <div className="mt-4 flex h-48 items-end gap-3">
      {entries.map((entry) => {
        const ratio = (entry.weightKg - min) / range;
        const height = 48 + ratio * 112;

        return (
          <div key={`${entry.date}-${entry.weightKg}`} className="flex flex-1 flex-col items-center gap-2">
            <div
              className="w-full rounded-t-xl bg-gradient-to-t from-[#ff2fa8] to-[#ff8bd8]"
              style={{ height: `${height}px` }}
            />
            <span className="font-mono text-xs text-zinc-500">{entry.weightKg}</span>
          </div>
        );
      })}
    </div>
  );
}

function getWeightEntries(data: MemberDashboardData) {
  const entries = data.progress
    .filter((entry) => entry.weightKg !== null)
    .map((entry) => ({
      date: entry.date,
      weightKg: Number(entry.weightKg),
    }));

  if (!entries.length && data.member.currentWeightKg !== null) {
    return [
      {
        date: new Date().toISOString().slice(0, 10),
        weightKg: data.member.currentWeightKg,
      },
    ];
  }

  return entries.slice(-5);
}

function formatWeightDelta(delta: number | null) {
  if (delta === null) {
    return "0 kg";
  }

  return `${delta > 0 ? "+" : ""}${delta} kg`;
}

function formatMeasurements(
  entry: MemberDashboardData["progress"][number] | null,
) {
  if (!entry) {
    return "Pendiente";
  }

  const values = [entry.waistCm, entry.hipCm, entry.legCm, entry.armCm].filter(
    (value): value is number => value !== null,
  );

  return values.length ? `${values.length}/4` : "Pendiente";
}

function formatPaymentMethod(method: string) {
  const methods: Record<string, string> = {
    cash: "Efectivo",
    daviplata: "Daviplata",
    front_desk: "Recepcion",
    manual: "Manual",
    nequi: "Nequi",
    other: "Otro",
    transfer: "Transferencia",
    whatsapp: "WhatsApp",
  };

  return methods[method] ?? method;
}
