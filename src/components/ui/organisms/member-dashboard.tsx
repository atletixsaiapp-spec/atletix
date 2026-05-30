import type { ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Activity,
  CalendarDays,
  Dumbbell,
  Flame,
  HeartPulse,
  Medal,
  Plus,
  Ruler,
  ShieldCheck,
  Sparkles,
  Trophy,
  UserRound,
  WalletCards,
} from "lucide-react";
import { AdminNotice } from "@/components/ui/atoms/admin-notice";
import { StatusBadge } from "@/components/ui/atoms/status-badge";
import { MemberAttendanceQr } from "@/components/ui/organisms/member-attendance-qr";
import { EditableAvatarPreview } from "@/components/ui/organisms/profile-avatar-manager";
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
  const latestApprovedPayment =
    data.payments.find((payment) => payment.status === "approved") ?? null;
  const hasRoutine = Boolean(data.routine);

  return (
    <section className="mx-auto grid w-full max-w-7xl gap-6 px-4 py-6 sm:px-6 lg:grid-cols-[0.9fr_1.45fr] lg:px-8">
      <aside className="space-y-6">
        {data.loadMessage ? (
          <AdminNotice body={data.loadMessage} tone="warning" />
        ) : null}

        <section className="glass-panel rounded-3xl p-5 sm:p-6">
          <div className="flex items-center gap-4">
            <EditableAvatarPreview
              avatarUrl={member.avatarUrl}
              destination="dashboard"
              initials={member.initials}
            />
            <div className="min-w-0">
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#ff8bd8]">
                {member.isActive ? "Perfil activo" : "Perfil pendiente"}
              </p>
              <h1 className="mt-1 truncate text-2xl font-black tracking-normal text-white">
                Hola, {firstName}
              </h1>
              <p className="mt-1 text-sm text-zinc-400">
                {member.goal} /{" "}
                {member.heightCm
                  ? `${member.heightCm} cm`
                  : "Estatura pendiente"}
              </p>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-3 gap-3">
            <MiniStat
              label="Nivel"
              value={member.level}
              icon={<Trophy size={16} />}
            />
            <MiniStat
              label="XP"
              value={`${member.xp}`}
              icon={<Sparkles size={16} />}
            />
            <MiniStat
              label="Racha"
              value={`${member.streakDays}d`}
              icon={<Flame size={16} />}
            />
          </div>

          <MemberAttendanceQr
            memberName={member.name}
            qrSvg={data.attendanceQr.svg}
          />

          <div className="mt-6 border-t border-white/10 pt-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.2em] text-zinc-500">
                  Avatar
                </p>
                <h2 className="mt-1 text-xl font-black text-white">
                  {member.level}
                </h2>
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
          </div>
        </section>
      </aside>

      <div className="space-y-6">
        {data.routine ? (
          <section id="rutina" className="glass-panel rounded-3xl p-5 sm:p-6">
            <div className="mb-4 flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.2em] text-zinc-500">
                  Rutina asignada
                </p>
                <h3 className="mt-1 text-2xl font-black text-white">
                  {data.routine.name}
                </h3>
              </div>
              <span className="rounded-full bg-[#ff2fa8] px-3 py-1 text-xs font-black uppercase tracking-[0.16em] text-white">
                {data.routine.dayName}
              </span>
            </div>

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
                    <p className="mt-1 text-sm text-zinc-400">
                      {exercise.coachNote}
                    </p>
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-center text-sm">
                    <SetPill label="Series" value={exercise.sets} />
                    <SetPill label="Reps" value={exercise.reps} />
                    <SetPill label="Carga" value={exercise.load} />
                  </div>
                </div>
              ))}
            </div>
          </section>
        ) : null}

        <section id="progreso" className="glass-panel rounded-3xl p-5 sm:p-6">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-zinc-500">
                Asistencia semanal
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

          <div className="mt-6 border-t border-white/10 pt-6">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.2em] text-zinc-500">
                  Asistencia mensual
                </p>
                <h3 className="mt-1 text-2xl font-black text-white">
                  {data.stats.attendanceMonth} este mes
                </h3>
              </div>
              <Activity className="text-[#ff2fa8]" size={24} />
            </div>
            <div className="mt-6 flex h-36 items-end gap-2">
              {data.attendanceChart.map((item) => (
                <div
                  key={item.label}
                  className="flex flex-1 flex-col items-center gap-2"
                >
                  <div
                    className="w-full rounded-t-xl bg-gradient-to-t from-[#ff2fa8] to-[#ff8bd8]"
                    style={{ height: `${Math.max(10, item.count * 34)}px` }}
                  />
                  <span className="text-xs font-bold uppercase text-zinc-500">
                    {item.label}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {hasRoutine ? (
          <section className="grid gap-6">
            <ActionLink
              icon={<Dumbbell size={20} />}
              title="Mi rutina"
              href="#rutina"
            />
          </section>
        ) : null}

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
              value={
                member.currentWeightKg
                  ? `${member.currentWeightKg} kg`
                  : "Pendiente"
              }
            />
            <InfoRow
              icon={<Ruler size={16} />}
              label="Estatura"
              value={member.heightCm ? `${member.heightCm} cm` : "Pendiente"}
            />
            <InfoRow
              icon={<CalendarDays size={16} />}
              label="Edad"
              value={member.age !== null ? `${member.age} años` : "Pendiente"}
            />
          </div>
        </section>

        <section className="glass-panel rounded-3xl p-5 sm:p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-zinc-500">
                Historial de pagos
              </p>
              <h3 className="mt-1 text-2xl font-black text-white">
                Ultimos pagos
              </h3>
            </div>
            <div className="grid gap-2 sm:grid-cols-2">
              <Link
                href="/pagos/agregar"
                className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-[#ff2fa8] px-4 text-sm font-black text-white transition hover:bg-[#ff58b9]"
              >
                <Plus size={16} />
                Agregar pago
              </Link>
              <Link
                href="/pagos"
                className="inline-flex min-h-11 items-center justify-center rounded-full border border-white/10 px-4 text-sm font-black text-zinc-200 transition hover:border-[#ff2fa8]/50 hover:text-white"
              >
                Ver mas
              </Link>
            </div>
          </div>

          {data.payments.length ? (
            <div className="mt-5 grid gap-3">
              {data.payments.slice(0, 5).map((payment) => (
                <div
                  key={payment.id}
                  className="grid gap-3 rounded-2xl border border-white/10 bg-white/[0.035] p-4 sm:grid-cols-[auto_1fr_auto] sm:items-center"
                >
                  {payment.screenshotUrl ? (
                    <Image
                      alt="Comprobante de pago"
                      className="size-16 rounded-2xl border border-white/10 object-cover"
                      height={64}
                      src={payment.screenshotUrl}
                      width={64}
                    />
                  ) : (
                    <span className="grid size-16 place-items-center rounded-2xl bg-[#ff2fa8]/15 text-[#ff8bd8]">
                      <WalletCards size={20} />
                    </span>
                  )}
                  <div>
                    <p className="font-black text-white">
                      {payment.amountCop
                        ? formatCurrency(payment.amountCop)
                        : "Pendiente de validacion"}
                    </p>
                    <p className="mt-1 text-sm text-zinc-400">
                      {formatShortDate(payment.paidAt)}
                      {payment.periodStart && payment.periodEnd
                        ? ` / ${formatShortDate(payment.periodStart)} - ${formatShortDate(payment.periodEnd)}`
                        : ""}
                    </p>
                  </div>
                  <PaymentStatusPill status={payment.status} />
                </div>
              ))}
            </div>
          ) : (
            <EmptyState
              icon={<WalletCards size={20} />}
              title="Sin pagos registrados"
              body="Cuando subas un comprobante o el equipo registre un pago, aparecera aqui."
            />
          )}
        </section>

        <section id="membresia" className="glass-panel rounded-3xl p-5 sm:p-6">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-zinc-500">
                Membresia
              </p>
              <h2 className="mt-1 text-xl font-black text-white">
                {data.membership
                  ? formatShortDate(data.membership.endDate)
                  : "Sin fecha activa"}
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
              icon={<ShieldCheck size={16} />}
              label="Grupo"
              value={formatTrainingGroup(member.group)}
            />
            <InfoRow
              icon={<ShieldCheck size={16} />}
              label="Plan"
              value={formatMembershipPlan(
                data.membership?.membershipPlan ?? member.membershipPlan,
              )}
            />
            <InfoRow
              icon={<CalendarDays size={16} />}
              label="Inicio"
              value={
                data.membership
                  ? formatShortDate(data.membership.startDate)
                  : "Pendiente"
              }
            />
            <InfoRow
              icon={<ShieldCheck size={16} />}
              label="Vence"
              value={
                data.membership
                  ? formatShortDate(data.membership.endDate)
                  : "Pendiente"
              }
            />
            <InfoRow
              icon={<WalletCards size={16} />}
              label="Ultimo pago"
              value={
                latestApprovedPayment?.amountCop
                  ? formatCurrency(latestApprovedPayment.amountCop)
                  : "Sin pagos aprobados"
              }
            />
          </div>
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

function PaymentStatusPill({
  status,
}: {
  status: "pending" | "approved" | "rejected";
}) {
  const styles = {
    approved: "border-emerald-300/20 bg-emerald-400/10 text-emerald-100",
    pending: "border-amber-300/20 bg-amber-400/10 text-amber-100",
    rejected: "border-red-300/20 bg-red-400/10 text-red-100",
  };
  const labels = {
    approved: "Validado",
    pending: "Pendiente",
    rejected: "Rechazado",
  };

  return (
    <span
      className={`w-fit rounded-full border px-3 py-1 text-xs font-black uppercase tracking-[0.14em] ${styles[status]}`}
    >
      {labels[status]}
    </span>
  );
}

function formatMembershipPlan(plan: { name: string } | null) {
  return plan ? plan.name : "Sin plan";
}

function formatTrainingGroup(group: { name: string } | null) {
  return group ? group.name : "Sin grupo";
}
