"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import NextImage from "next/image";
import { Image as ImageIcon, WalletCards } from "lucide-react";
import { loadMoreMemberPayments } from "@/app/pagos/actions";
import { formatCurrency, formatShortDate } from "@/lib/atletix-data";
import type { MemberPayment, PaymentStatus } from "@/lib/payments";

export function PaymentHistoryList({
  hasMore: initialHasMore,
  initialPayments,
}: {
  hasMore: boolean;
  initialPayments: MemberPayment[];
}) {
  const [payments, setPayments] = useState(initialPayments);
  const [hasMore, setHasMore] = useState(initialHasMore);
  const [message, setMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const sentinelRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const sentinel = sentinelRef.current;

    if (!sentinel || !hasMore || isPending) {
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry?.isIntersecting) {
          return;
        }

        startTransition(async () => {
          const result = await loadMoreMemberPayments(payments.length);

          if (result.setupMessage) {
            setMessage(result.setupMessage);
          }

          setPayments((current) => [...current, ...result.payments]);
          setHasMore(result.hasMore);
        });
      },
      { rootMargin: "240px" },
    );

    observer.observe(sentinel);

    return () => observer.disconnect();
  }, [hasMore, isPending, payments.length]);

  if (!payments.length) {
    return (
      <div className="rounded-3xl border border-dashed border-white/10 p-6 text-center">
        <WalletCards className="mx-auto text-[#ff8bd8]" size={26} />
        <p className="mt-3 font-black text-white">Sin pagos registrados</p>
        <p className="mt-1 text-sm leading-6 text-zinc-500">
          Cuando subas un comprobante, aparecera aqui.
        </p>
      </div>
    );
  }

  return (
    <div className="grid gap-4">
      {payments.map((payment) => (
        <PaymentCard key={payment.id} payment={payment} />
      ))}

      {message ? (
        <p className="rounded-2xl border border-amber-300/20 bg-amber-400/10 p-4 text-sm font-semibold text-amber-100">
          {message}
        </p>
      ) : null}

      <div ref={sentinelRef} className="min-h-8">
        {isPending ? (
          <p className="text-center text-sm font-semibold text-zinc-500">
            Cargando mas pagos...
          </p>
        ) : null}
        {!hasMore ? (
          <p className="text-center text-sm font-semibold text-zinc-600">
            No hay mas pagos.
          </p>
        ) : null}
      </div>
    </div>
  );
}

function PaymentCard({ payment }: { payment: MemberPayment }) {
  return (
    <article className="grid gap-4 rounded-3xl border border-white/10 bg-white/[0.025] p-4 sm:grid-cols-[auto_1fr_auto] sm:items-center sm:p-5">
      {payment.screenshotUrl ? (
        <a
          href={payment.screenshotUrl}
          target="_blank"
          rel="noreferrer"
          className="block"
        >
          <NextImage
            alt="Comprobante de pago"
            className="h-28 w-full rounded-2xl border border-white/10 object-cover sm:size-24"
            height={112}
            src={payment.screenshotUrl}
            width={320}
          />
        </a>
      ) : (
        <span className="grid h-28 w-full place-items-center rounded-2xl bg-[#ff2fa8]/15 text-[#ff8bd8] sm:size-24">
          <ImageIcon size={24} />
        </span>
      )}

      <div>
        <div className="flex flex-wrap items-center gap-2">
          <p className="text-xl font-black text-white">
            {payment.amountCop
              ? formatCurrency(payment.amountCop)
              : "Pendiente de validacion"}
          </p>
          <PaymentStatusPill status={payment.status} />
        </div>
        <p className="mt-2 text-sm text-zinc-400">
          Fecha de pago: {formatShortDate(payment.paidAt)}
        </p>
        {payment.periodStart && payment.periodEnd ? (
          <p className="mt-1 text-sm text-zinc-500">
            Periodo: {formatShortDate(payment.periodStart)} -{" "}
            {formatShortDate(payment.periodEnd)}
          </p>
        ) : null}
        {payment.notes ? (
          <p className="mt-2 text-sm leading-6 text-zinc-500">
            {payment.notes}
          </p>
        ) : null}
      </div>
    </article>
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
      className={`rounded-full border px-3 py-1 text-xs font-black uppercase tracking-[0.14em] ${styles[status]}`}
    >
      {labels[status]}
    </span>
  );
}
