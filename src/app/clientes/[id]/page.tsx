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
  ShieldCheck,
  UsersRound,
} from "lucide-react";
import { AdminNotice } from "@/components/ui/atoms/admin-notice";
import { ProfileMetric } from "@/components/ui/atoms/profile-metric";
import { StatusBadge } from "@/components/ui/atoms/status-badge";
import {
  AttendanceChart,
  WeightChart,
} from "@/components/ui/organisms/member-detail-charts";
import { ConfirmationModal } from "@/components/ui/organisms/confirmation-modal";
import {
  EditMemberProfileForm,
  ManualPaymentForm,
  MembershipActionForms,
} from "@/components/ui/organisms/member-management-forms";
import { TopNav } from "@/components/ui/organisms/top-nav";
import {
  activateMemberMembership,
  addManualPayment,
  deleteMemberAccount,
  revokeMemberMembership,
  updateMemberProfile,
} from "@/app/clientes/[id]/actions";
import {
  addOneMonth,
  dateKey,
  getAdminMemberDetail,
} from "@/lib/admin-member-detail";
import { requireAdmin } from "@/lib/auth";
import { formatCurrency, formatShortDate } from "@/lib/atletix-data";

const noticeCopy: Record<string, { body: string; tone: "success" | "warning" | "error" }> = {
  invalid_member_update: {
    body: "Revisa los datos de la clienta antes de guardar.",
    tone: "error",
  },
  invalid_delete_confirmation: {
    body: "Para eliminar la cuenta debes escribir el correo exacto de la clienta.",
    tone: "error",
  },
  invalid_membership_dates: {
    body: "Las fechas de membresia no son validas.",
    tone: "error",
  },
  invalid_payment: {
    body: "Revisa el valor, fechas y metodo del pago manual.",
    tone: "error",
  },
  member_updated: {
    body: "Ficha de clienta actualizada.",
    tone: "success",
  },
  member_update_failed: {
    body: "No se pudo actualizar la ficha de la clienta.",
    tone: "error",
  },
  member_delete_failed: {
    body: "No se pudo eliminar la cuenta de la clienta.",
    tone: "error",
  },
  membership_activated: {
    body: "Membresia activada.",
    tone: "success",
  },
  membership_activate_failed: {
    body: "No se pudo activar la membresia.",
    tone: "error",
  },
  membership_revoked: {
    body: "Membresia revocada.",
    tone: "warning",
  },
  membership_revoke_failed: {
    body: "No se pudo revocar la membresia.",
    tone: "error",
  },
  missing_supabase_admin: {
    body: "Falta SUPABASE_SERVICE_ROLE_KEY para gestionar clientas reales.",
    tone: "error",
  },
  payment_added: {
    body: "Pago manual registrado y membresia actualizada.",
    tone: "success",
  },
  payment_failed: {
    body: "No se pudo registrar el pago manual.",
    tone: "error",
  },
  payment_membership_failed: {
    body: "Pago registrado, pero no se pudo activar el periodo de membresia.",
    tone: "warning",
  },
  profile_update_failed: {
    body: "La ficha se guardo parcialmente, pero no se pudo actualizar el perfil de acceso.",
    tone: "warning",
  },
};

export default async function ClientDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ notice?: string }>;
}) {
  await requireAdmin();

  const [{ id }, { notice }] = await Promise.all([params, searchParams]);
  const detailResult = await getAdminMemberDetail(id);
  const noticeConfig = notice ? noticeCopy[notice] : null;

  if (!detailResult.member) {
    if (detailResult.setupMessage) {
      return (
        <main className="atletix-shell min-h-screen">
          <TopNav active="admin" />
          <section className="mx-auto w-full max-w-4xl px-4 py-6 sm:px-6 lg:px-8">
            <BackLink />
            <div className="mt-6">
              <AdminNotice body={detailResult.setupMessage} tone="warning" />
            </div>
          </section>
        </main>
      );
    }

    notFound();
  }

  const detail = detailResult.member;
  const member = detail.member;
  const today = new Date();
  const todayKey = dateKey(today);
  const defaultStart =
    detail.membership?.endDate && detail.membership.endDate > todayKey
      ? detail.membership.endDate
      : todayKey;
  const defaultEnd = dateKey(addOneMonth(new Date(`${defaultStart}T12:00:00-05:00`)));
  const latestProgress = detail.progress[detail.progress.length - 1];

  return (
    <main className="atletix-shell min-h-screen">
      <TopNav active="admin" />

      <section className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <BackLink />

        <div className="mt-6 space-y-6">
          {noticeConfig ? <AdminNotice {...noticeConfig} /> : null}
          {detailResult.setupMessage ? (
            <AdminNotice body={detailResult.setupMessage} tone="warning" />
          ) : null}

          <section className="glass-panel rounded-3xl p-5 sm:p-6">
            <SectionHeading
              eyebrow="Ficha clienta"
              title={member.name}
              description="Resumen principal de la clienta y su estado actual en ATLETIX."
            />

            <div className="mt-6 grid gap-6 xl:grid-cols-[0.85fr_1.15fr]">
              <div className="flex flex-col gap-5">
                <div className="flex flex-col gap-4 min-[420px]:flex-row min-[420px]:items-center">
                  <div className="avatar-aura grid size-20 shrink-0 place-items-center rounded-full border border-[#ff2fa8]/50 bg-[#ff2fa8]/10 text-2xl font-black text-white">
                    {member.initials}
                  </div>
                  <div className="min-w-0">
                    <h1 className="break-words text-3xl font-black text-white">
                      {member.name}
                    </h1>
                    <p className="mt-1 break-words text-sm text-zinc-400">
                      {member.email}
                    </p>
                    <p className="mt-1 break-words text-sm text-zinc-500">
                      {member.phone || "Sin telefono"}
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2">
                  {detail.membership ? (
                    <StatusBadge status={detail.membership.status} />
                  ) : (
                    <span className="rounded-full border border-red-300/30 bg-red-400/10 px-3 py-1 text-xs font-black uppercase tracking-[0.16em] text-red-200">
                      Sin membresia
                    </span>
                  )}
                  <span className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-xs font-black uppercase tracking-[0.16em] text-zinc-300">
                    {member.isActive ? "Cuenta activa" : "Cuenta pausada"}
                  </span>
                </div>

                <div className="grid gap-3 text-sm sm:grid-cols-2">
                  <InfoRow label="Ingreso" value={formatShortDate(member.joinedAt)} />
                  <InfoRow label="Objetivo" value={member.goal} />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 lg:grid-cols-3">
                <ProfileMetric
                  icon={<CalendarDays size={18} />}
                  label="Edad"
                  value={member.age === null ? "--" : `${member.age}`}
                />
                <ProfileMetric
                  icon={<UsersRound size={18} />}
                  label="Genero"
                  value={detail.gender}
                />
                <ProfileMetric
                  icon={<Scale size={18} />}
                  label="Peso"
                  value={formatNumber(member.currentWeightKg, "kg")}
                  detail={
                    detail.stats.weightChangeKg === null
                      ? "Sin comparacion"
                      : `${detail.stats.weightChangeKg > 0 ? "+" : ""}${detail.stats.weightChangeKg} kg`
                  }
                />
                <ProfileMetric
                  icon={<Ruler size={18} />}
                  label="Estatura"
                  value={formatNumber(member.heightCm, "cm")}
                />
                <ProfileMetric
                  icon={<ShieldCheck size={18} />}
                  label="Nivel"
                  value={member.level}
                  detail={`${member.xp} XP`}
                />
              </div>
            </div>
          </section>

          <section className="glass-panel rounded-3xl p-5 sm:p-6">
            <SectionHeading
              eyebrow="Asistencia"
              title="Entrenamiento y rutina"
              description="Actividad registrada, racha y rutina asignada para esta clienta."
            />

            <div className="mt-6 grid gap-4 md:grid-cols-3">
              <ProfileMetric
                icon={<HeartPulse size={18} />}
                label="Semana"
                value={`${detail.stats.attendanceWeek}`}
                detail="entrenos registrados"
              />
              <ProfileMetric
                icon={<Medal size={18} />}
                label="Mes"
                value={`${detail.stats.attendanceMonth}`}
                detail="entrenos este mes"
              />
              <ProfileMetric
                icon={<Flame size={18} />}
                label="Racha"
                value={`${member.streakDays} dias`}
              />
            </div>

            <div className="mt-6 grid gap-6 xl:grid-cols-[0.8fr_1.2fr]">
              <div className="rounded-3xl border border-white/10 bg-white/[0.025] p-4 sm:p-5">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-sm font-semibold uppercase tracking-[0.2em] text-zinc-500">
                      Asistencia
                    </p>
                    <h3 className="mt-1 text-2xl font-black text-white">
                      Ultimos 7 dias
                    </h3>
                  </div>
                  <HeartPulse className="shrink-0 text-emerald-300" size={24} />
                </div>
                <AttendanceChart entries={detail.attendanceChart} />
              </div>

              <div className="rounded-3xl border border-white/10 bg-white/[0.025] p-4 sm:p-5">
                <div>
                  <p className="text-sm font-semibold uppercase tracking-[0.2em] text-zinc-500">
                    Rutina
                  </p>
                  <h3 className="mt-1 text-2xl font-black text-white">
                    {detail.routine?.name ?? "Sin rutina asignada"}
                  </h3>
                  <p className="mt-2 text-sm text-zinc-500">
                    {detail.routine?.coachNotes ?? "Asigna una rutina para esta clienta."}
                  </p>
                </div>

                <div className="mt-5 grid gap-3">
                  {detail.routine?.exercises.length ? (
                    detail.routine.exercises.map((exercise) => (
                      <div
                        key={exercise.id}
                        className="grid gap-3 rounded-2xl border border-white/10 bg-black/20 p-4 sm:grid-cols-[1fr_auto]"
                      >
                        <div className="flex items-start gap-3">
                          <Dumbbell className="mt-1 text-[#ff2fa8]" size={18} />
                          <div>
                            <p className="font-black text-white">{exercise.name}</p>
                            <p className="text-sm text-zinc-500">
                              {exercise.coachNote}
                            </p>
                          </div>
                        </div>
                        <p className="font-mono text-sm text-zinc-300">
                          {exercise.sets} x {exercise.reps} / {exercise.load}
                        </p>
                      </div>
                    ))
                  ) : (
                    <EmptyPanel message="Sin ejercicios asignados." />
                  )}
                </div>
              </div>
            </div>
          </section>

          <section className="glass-panel rounded-3xl p-5 sm:p-6">
            <SectionHeading
              eyebrow="Datos de la clienta"
              title="Perfil y evolucion"
              description="Datos editables, medidas y progreso fisico registrado."
            />

            <div className="mt-6 grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
              <div className="rounded-3xl border border-white/10 bg-white/[0.025] p-4 sm:p-5">
                <EditMemberProfileForm
                  action={updateMemberProfile}
                  detail={detail}
                />
              </div>

              <div className="rounded-3xl border border-white/10 bg-white/[0.025] p-4 sm:p-5">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-sm font-semibold uppercase tracking-[0.2em] text-zinc-500">
                      Evolucion
                    </p>
                    <h3 className="mt-1 text-2xl font-black text-white">
                      Peso registrado
                    </h3>
                    <p className="mt-2 text-sm text-zinc-500">
                      {latestProgress
                        ? `Ultimo check-in ${formatShortDate(latestProgress.date)}`
                        : "Sin progreso registrado"}
                    </p>
                  </div>
                  <LineChart className="shrink-0 text-[#ff8bd8]" size={24} />
                </div>

                <div className="mt-5">
                  <ProfileMetric
                    icon={<LineChart size={18} />}
                    label="Check-ins"
                    value={`${detail.stats.progressEntries}`}
                    detail={
                      latestProgress ? formatShortDate(latestProgress.date) : "Sin progreso"
                    }
                  />
                </div>
                <WeightChart entries={detail.progress} />
              </div>
            </div>
          </section>

          <section className="glass-panel rounded-3xl p-5 sm:p-6">
            <SectionHeading
              eyebrow="Membresia y pagos"
              title="Estado, control y pagos manuales"
              description="Periodo activo, acciones de membresia, registro de pagos e historial reciente."
            />

            <div className="mt-6 grid gap-4 md:grid-cols-3">
              <ProfileMetric
                icon={<CalendarDays size={18} />}
                label="Vence"
                value={
                  detail.membership
                    ? formatShortDate(detail.membership.endDate)
                    : "Sin periodo"
                }
                detail={
                  detail.membership
                    ? `Inicio ${formatShortDate(detail.membership.startDate)}`
                    : "Sin membresia activa"
                }
              />
              <ProfileMetric
                icon={<Banknote size={18} />}
                label="Ultimo pago"
                value={
                  detail.stats.lastPaymentCop
                    ? formatCurrency(detail.stats.lastPaymentCop)
                    : "--"
                }
              />
              <ProfileMetric
                icon={<Banknote size={18} />}
                label="Total pagado"
                value={formatCurrency(detail.stats.totalPaidCop)}
              />
            </div>

            <div className="mt-6 grid gap-6 xl:grid-cols-[0.8fr_1fr_0.8fr]">
              <div className="rounded-3xl border border-white/10 bg-white/[0.025] p-4 sm:p-5">
                <div>
                  <p className="text-sm font-semibold uppercase tracking-[0.2em] text-zinc-500">
                    Control
                  </p>
                  <h3 className="mt-1 text-2xl font-black text-white">
                    Membresia
                  </h3>
                </div>
                <div className="mt-5">
                  <MembershipActionForms
                    activateAction={activateMemberMembership}
                    defaultEnd={defaultEnd}
                    defaultStart={defaultStart}
                    memberId={member.id}
                    revokeAction={revokeMemberMembership}
                  />
                </div>
              </div>

              <div className="rounded-3xl border border-white/10 bg-white/[0.025] p-4 sm:p-5">
                <div>
                  <p className="text-sm font-semibold uppercase tracking-[0.2em] text-zinc-500">
                    Pagos
                  </p>
                  <h3 className="mt-1 text-2xl font-black text-white">
                    Agregar pago manual
                  </h3>
                </div>
                <div className="mt-5">
                  <ManualPaymentForm
                    action={addManualPayment}
                    defaultEnd={defaultEnd}
                    defaultPaidAt={todayKey}
                    defaultStart={defaultStart}
                    memberId={member.id}
                  />
                </div>
              </div>

              <div className="rounded-3xl border border-white/10 bg-white/[0.025] p-4 sm:p-5">
                <div>
                  <p className="text-sm font-semibold uppercase tracking-[0.2em] text-zinc-500">
                    Pagos recientes
                  </p>
                  <h3 className="mt-1 text-2xl font-black text-white">
                    Historial
                  </h3>
                </div>

                <div className="mt-5 grid gap-3">
                  {detail.payments.length ? (
                    detail.payments.slice(0, 5).map((payment) => (
                      <div
                        key={payment.id}
                        className="rounded-2xl border border-white/10 bg-black/20 p-4"
                      >
                        <div className="flex items-center justify-between gap-3">
                          <p className="font-black text-white">
                            {formatCurrency(payment.amountCop)}
                          </p>
                          <Banknote className="text-[#ff8bd8]" size={18} />
                        </div>
                        <p className="mt-2 text-sm text-zinc-500">
                          {formatPaymentMethod(payment.method)} -{" "}
                          {formatShortDate(payment.paidAt)}
                        </p>
                        <p className="mt-1 text-xs text-zinc-600">
                          {formatShortDate(payment.periodStart)} a{" "}
                          {formatShortDate(payment.periodEnd)}
                        </p>
                      </div>
                    ))
                  ) : (
                    <EmptyPanel message="Sin pagos registrados." />
                  )}
                </div>
              </div>
            </div>
          </section>

          <section className="glass-panel rounded-3xl border-red-300/20 p-5 sm:p-6">
            <SectionHeading
              eyebrow="Eliminar cuenta"
              title="Zona peligrosa"
              description="Borra la clienta, su acceso, membresias, pagos, asistencia y progreso. Usa esto solo para cuentas de prueba o registros creados por error."
              tone="danger"
            />

            <div className="mt-5 max-w-xl">
              <ConfirmationModal
                action={deleteMemberAccount}
                confirmLabel="Eliminar definitivamente"
                confirmationLabel="Escribe el correo para confirmar"
                confirmationName="confirmation"
                confirmationPlaceholder={member.email}
                confirmationValue={member.email}
                description={`Esta accion elimina permanentemente la cuenta de ${member.name} y no se puede deshacer.`}
                hiddenFields={[{ name: "memberId", value: member.id }]}
                title="Eliminar cuenta de clienta"
                triggerLabel="Eliminar cuenta"
              />
            </div>
          </section>
        </div>
      </section>
    </main>
  );
}

function BackLink() {
  return (
    <Link
      href="/admin/clientas"
      className="inline-flex items-center gap-2 rounded-full border border-white/10 px-4 py-2 text-sm font-bold text-zinc-300 transition hover:border-[#ff2fa8]/50 hover:text-white"
    >
      <ArrowLeft size={16} />
      Volver a clientas
    </Link>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-2xl bg-black/25 p-3">
      <span className="text-zinc-500">{label}</span>
      <span className="text-right font-black text-white">{value}</span>
    </div>
  );
}

function EmptyPanel({ message }: { message: string }) {
  return (
    <div className="rounded-2xl border border-dashed border-white/10 p-5 text-center text-sm text-zinc-500">
      {message}
    </div>
  );
}

function SectionHeading({
  description,
  eyebrow,
  title,
  tone = "default",
}: {
  description: string;
  eyebrow: string;
  title: string;
  tone?: "default" | "danger";
}) {
  return (
    <div>
      <p
        className={`text-sm font-semibold uppercase tracking-[0.2em] ${
          tone === "danger" ? "text-red-200" : "text-[#ff8bd8]"
        }`}
      >
        {eyebrow}
      </p>
      <h2 className="mt-1 text-2xl font-black text-white sm:text-3xl">{title}</h2>
      <p className="mt-2 max-w-3xl text-sm leading-6 text-zinc-500">
        {description}
      </p>
    </div>
  );
}

function formatNumber(value: number | null, suffix: string) {
  return value === null ? "--" : `${value} ${suffix}`;
}

function formatPaymentMethod(method: string) {
  const labels: Record<string, string> = {
    cash: "Efectivo",
    daviplata: "Daviplata",
    nequi: "Nequi",
    other: "Otro",
    transfer: "Transferencia",
  };

  return labels[method] ?? method;
}
