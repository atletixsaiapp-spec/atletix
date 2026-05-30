import type { ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowLeft,
  Banknote,
  CalendarDays,
  CheckCircle2,
  ExternalLink,
  XCircle,
} from "lucide-react";
import { approvePayment, rejectPayment } from "@/app/admin/pagos/actions";
import { AdminNotice } from "@/components/ui/atoms/admin-notice";
import { PendingSubmitButton } from "@/components/ui/atoms/pending-submit-button";
import { TopNav } from "@/components/ui/organisms/top-nav";
import { requireAdmin } from "@/lib/auth";
import { formatCurrency, formatShortDate } from "@/lib/atletix-data";
import {
  getAdminPayments,
  type AdminPayment,
  type PaymentStatus,
} from "@/lib/payments";
import {
  createAdminClient,
  hasSupabaseAdminConfig,
} from "@/utils/supabase/admin";

const fieldClass =
  "mt-2 min-h-12 w-full rounded-2xl border border-white/10 bg-black/30 px-4 text-sm font-semibold text-white outline-none transition placeholder:text-zinc-700 focus:border-[#ff2fa8]/60";
const labelClass =
  "text-[0.72rem] font-black uppercase tracking-[0.16em] text-zinc-500";

const noticeCopy: Record<
  string,
  { body: string; tone: "success" | "warning" | "error" }
> = {
  invalid_membership_plan: {
    body: "Selecciona un plan de membresia valido.",
    tone: "error",
  },
  invalid_payment_review: {
    body: "Revisa valor, fechas, metodo y periodo antes de validar.",
    tone: "error",
  },
  missing_supabase_admin: {
    body: "Falta SUPABASE_SERVICE_ROLE_KEY para gestionar pagos.",
    tone: "error",
  },
  payment_approved: {
    body: "Pago validado y membresia renovada.",
    tone: "success",
  },
  payment_approve_failed: {
    body: "No se pudo validar el pago.",
    tone: "error",
  },
  payment_membership_failed: {
    body: "Pago validado, pero no se pudo renovar la membresia.",
    tone: "warning",
  },
  payment_rejected: {
    body: "Pago rechazado.",
    tone: "warning",
  },
  payment_reject_failed: {
    body: "No se pudo rechazar el pago.",
    tone: "error",
  },
};

type MembershipPlanOption = {
  id: string;
  lessonsPerMonth: number;
  name: string;
};

export default async function AdminPaymentsPage({
  searchParams,
}: {
  searchParams: Promise<{ notice?: string }>;
}) {
  await requireAdmin();

  const [{ notice }, payments, plans] = await Promise.all([
    searchParams,
    getAdminPayments({ limit: 80 }),
    getMembershipPlans(),
  ]);
  const noticeConfig = notice ? noticeCopy[notice] : null;
  const sortedPayments = sortPaymentsForReview(payments.payments);
  const pendingCount = payments.payments.filter(
    (payment) => payment.status === "pending",
  ).length;

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
            Pagos
          </p>
          <h1 className="mt-2 text-3xl font-black tracking-normal text-white sm:text-5xl">
            Validar comprobantes
          </h1>
        </div>

        {noticeConfig ? <AdminNotice {...noticeConfig} /> : null}
        {payments.setupMessage ? (
          <AdminNotice body={payments.setupMessage} tone="warning" />
        ) : null}

        <section className="grid gap-4 md:grid-cols-3">
          <SummaryCard
            icon={<Banknote size={22} />}
            label="Pendientes"
            value={`${pendingCount}`}
          />
          <SummaryCard
            icon={<CheckCircle2 size={22} />}
            label="Validados"
            value={`${payments.payments.filter((payment) => payment.status === "approved").length}`}
          />
          <SummaryCard
            icon={<CalendarDays size={22} />}
            label="Total"
            value={`${payments.payments.length}`}
          />
        </section>

        <section className="mt-6 grid gap-4">
          {sortedPayments.length ? (
            sortedPayments.map((payment) => (
              <PaymentReviewCard
                key={payment.id}
                payment={payment}
                plans={plans}
              />
            ))
          ) : (
            <div className="glass-panel rounded-3xl p-6 text-center text-sm text-zinc-500">
              Sin pagos para revisar.
            </div>
          )}
        </section>
      </section>
    </main>
  );
}

function PaymentReviewCard({
  payment,
  plans,
}: {
  payment: AdminPayment;
  plans: MembershipPlanOption[];
}) {
  const defaultStart = payment.periodStart ?? payment.paidAt;
  const defaultEnd = payment.periodEnd ?? addMonths(defaultStart, 1);
  const defaultPlanId = payment.member?.membershipPlanId ?? "";

  return (
    <article className="glass-panel rounded-3xl p-5 sm:p-6">
      <div className="grid gap-5 lg:grid-cols-[18rem_1fr]">
        <div>
          {payment.screenshotUrl ? (
            <a href={payment.screenshotUrl} target="_blank" rel="noreferrer">
              <Image
                alt="Comprobante de pago"
                className="h-72 w-full rounded-3xl border border-white/10 object-cover"
                height={288}
                src={payment.screenshotUrl}
                width={288}
              />
            </a>
          ) : (
            <div className="grid h-72 place-items-center rounded-3xl border border-white/10 bg-white/[0.035] text-[#ff8bd8]">
              <Banknote size={34} />
            </div>
          )}
          {payment.screenshotUrl ? (
            <a
              href={payment.screenshotUrl}
              target="_blank"
              rel="noreferrer"
              className="mt-3 inline-flex min-h-10 w-full items-center justify-center gap-2 rounded-full border border-white/10 px-4 text-sm font-black text-zinc-200 transition hover:border-[#ff2fa8]/50 hover:text-white"
            >
              <ExternalLink size={15} />
              Ver screenshot
            </a>
          ) : null}
        </div>

        <div className="min-w-0">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-2xl font-black text-white">
                  {payment.member?.name ?? "Cuenta sin ficha"}
                </h2>
                <PaymentStatusPill status={payment.status} />
              </div>
              <p className="mt-2 text-sm text-zinc-500">
                {payment.member?.email ?? "Sin correo"} / Pago{" "}
                {formatShortDate(payment.paidAt)}
              </p>
              {payment.amountCop ? (
                <p className="mt-2 text-xl font-black text-white">
                  {formatCurrency(payment.amountCop)}
                </p>
              ) : null}
            </div>
            {payment.member ? (
              <Link
                href={`/clientes/${payment.member.id}`}
                className="inline-flex min-h-10 items-center justify-center rounded-full border border-white/10 px-4 text-sm font-black text-zinc-200 transition hover:border-[#ff2fa8]/50 hover:text-white"
              >
                Ver cuenta
              </Link>
            ) : null}
          </div>

          {payment.status === "pending" && payment.member ? (
            <div className="mt-5 grid gap-4 xl:grid-cols-[1fr_0.45fr]">
              <form
                action={approvePayment}
                className="grid gap-4 md:grid-cols-2"
              >
                <input name="paymentId" type="hidden" value={payment.id} />
                <input
                  name="memberId"
                  type="hidden"
                  value={payment.member.id}
                />

                <label className={labelClass}>
                  Valor COP
                  <input
                    className={fieldClass}
                    min="1"
                    name="amountCop"
                    placeholder="150000"
                    required
                    type="number"
                  />
                </label>

                <label className={labelClass}>
                  Fecha pago
                  <input
                    className={fieldClass}
                    defaultValue={payment.paidAt}
                    name="paidAt"
                    required
                    type="date"
                  />
                </label>

                <label className={labelClass}>
                  Periodo inicio
                  <input
                    className={fieldClass}
                    defaultValue={defaultStart}
                    name="periodStart"
                    required
                    type="date"
                  />
                </label>

                <label className={labelClass}>
                  Periodo vence
                  <input
                    className={fieldClass}
                    defaultValue={defaultEnd}
                    name="periodEnd"
                    required
                    type="date"
                  />
                </label>

                <label className={labelClass}>
                  Plan
                  <select
                    className={fieldClass}
                    defaultValue={defaultPlanId}
                    name="membershipPlanId"
                  >
                    <option value="">Sin plan asignado</option>
                    {plans.map((plan) => (
                      <option key={plan.id} value={plan.id}>
                        {plan.name} / {plan.lessonsPerMonth} clases
                      </option>
                    ))}
                  </select>
                </label>

                <label className={labelClass}>
                  Metodo
                  <select
                    className={fieldClass}
                    defaultValue="transfer"
                    name="method"
                  >
                    <option value="transfer">Transferencia</option>
                    <option value="cash">Efectivo</option>
                    <option value="nequi">Nequi</option>
                    <option value="daviplata">Daviplata</option>
                    <option value="other">Otro</option>
                  </select>
                </label>

                <label className={`${labelClass} md:col-span-2`}>
                  Nota interna
                  <textarea
                    className={`${fieldClass} min-h-24 py-3`}
                    name="notes"
                    placeholder="Referencia bancaria, observaciones..."
                  />
                </label>

                <PendingSubmitButton
                  className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-emerald-400 px-5 py-3 text-sm font-black text-black transition hover:bg-emerald-300 md:col-span-2"
                  pendingLabel="Validando pago..."
                >
                  <CheckCircle2 size={18} />
                  Validar y renovar
                </PendingSubmitButton>
              </form>

              <form action={rejectPayment} className="grid content-start gap-3">
                <input name="paymentId" type="hidden" value={payment.id} />
                <input
                  name="memberId"
                  type="hidden"
                  value={payment.member.id}
                />
                <label className={labelClass}>
                  Nota al rechazar
                  <textarea
                    className={`${fieldClass} min-h-24 py-3`}
                    name="notes"
                    placeholder="Motivo o referencia..."
                  />
                </label>
                <PendingSubmitButton
                  className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full border border-red-300/30 bg-red-400/10 px-5 py-3 text-sm font-black text-red-100 transition hover:bg-red-400/20"
                  pendingLabel="Rechazando..."
                >
                  <XCircle size={18} />
                  Rechazar
                </PendingSubmitButton>
              </form>
            </div>
          ) : (
            <div className="mt-5 rounded-2xl border border-white/10 bg-white/[0.035] p-4 text-sm text-zinc-400">
              {payment.periodStart && payment.periodEnd ? (
                <p>
                  Periodo: {formatShortDate(payment.periodStart)} a{" "}
                  {formatShortDate(payment.periodEnd)}
                </p>
              ) : (
                <p>Sin periodo de membresia registrado.</p>
              )}
              {payment.notes ? <p className="mt-2">{payment.notes}</p> : null}
            </div>
          )}
        </div>
      </div>
    </article>
  );
}

function SummaryCard({
  icon,
  label,
  value,
}: {
  icon: ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="glass-panel rounded-3xl p-5">
      <div className="grid size-11 place-items-center rounded-2xl bg-[#ff2fa8]/15 text-[#ff8bd8]">
        {icon}
      </div>
      <p className="mt-5 text-xs font-black uppercase tracking-[0.18em] text-zinc-500">
        {label}
      </p>
      <p className="metric-number mt-2 text-3xl font-black text-white">
        {value}
      </p>
    </div>
  );
}

function PaymentStatusPill({ status }: { status: PaymentStatus }) {
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

function sortPaymentsForReview(payments: AdminPayment[]) {
  const rank: Record<PaymentStatus, number> = {
    pending: 0,
    approved: 1,
    rejected: 2,
  };

  return [...payments].sort((left, right) => {
    const rankDiff = rank[left.status] - rank[right.status];

    if (rankDiff !== 0) {
      return rankDiff;
    }

    return right.createdAt.localeCompare(left.createdAt);
  });
}

async function getMembershipPlans(): Promise<MembershipPlanOption[]> {
  if (!hasSupabaseAdminConfig()) {
    return [];
  }

  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("membership_plans")
    .select("id,name,lessons_per_month")
    .eq("is_active", true)
    .order("sort_order", { ascending: true });

  if (error) {
    return [];
  }

  return (data ?? []).map((plan) => ({
    id: plan.id,
    lessonsPerMonth: plan.lessons_per_month,
    name: plan.name,
  }));
}

function addMonths(dateKey: string, months: number) {
  const date = new Date(`${dateKey}T12:00:00-05:00`);
  date.setMonth(date.getMonth() + months);

  return date.toISOString().slice(0, 10);
}
