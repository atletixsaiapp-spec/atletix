import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft, Plus, WalletCards } from "lucide-react";
import { AdminNotice } from "@/components/ui/atoms/admin-notice";
import { PaymentHistoryList } from "@/components/ui/organisms/payment-history-list";
import { TopNav } from "@/components/ui/organisms/top-nav";
import { requireOnboardedUser } from "@/lib/auth";
import { getMemberPayments } from "@/lib/payments";

export default async function PaymentsPage() {
  const { member } = await requireOnboardedUser();

  if (!member) {
    redirect("/onboarding");
  }

  const payments = await getMemberPayments({
    limit: 10,
    memberId: member.id,
  });

  return (
    <main className="atletix-shell min-h-screen">
      <TopNav active="member" mode="member" />

      <section className="mx-auto w-full max-w-4xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <Link
            href="/dashboard"
            className="inline-flex w-fit items-center gap-2 rounded-full border border-white/10 px-4 py-2 text-sm font-bold text-zinc-300 transition hover:border-[#ff2fa8]/50 hover:text-white"
          >
            <ArrowLeft size={16} />
            Volver al panel
          </Link>
          <Link
            href="/pagos/agregar"
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-[#ff2fa8] px-4 text-sm font-black text-white transition hover:bg-[#ff58b9]"
          >
            <Plus size={16} />
            Agregar pago
          </Link>
        </div>

        <div className="mt-6 pb-6">
          <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[#ff8bd8]">
            Historial de pagos
          </p>
          <h1 className="mt-2 text-3xl font-black tracking-normal text-white sm:text-5xl">
            Comprobantes y validaciones
          </h1>
        </div>

        {payments.setupMessage ? (
          <div className="mb-5">
            <AdminNotice body={payments.setupMessage} tone="warning" />
          </div>
        ) : null}

        <section className="glass-panel rounded-3xl p-5 sm:p-6">
          <div className="mb-5 flex items-center gap-3">
            <span className="grid size-11 place-items-center rounded-2xl bg-[#ff2fa8]/15 text-[#ff8bd8]">
              <WalletCards size={21} />
            </span>
            <div>
              <p className="font-black text-white">Pagos recientes</p>
              <p className="text-sm text-zinc-500">
                Se cargan mas registros al bajar.
              </p>
            </div>
          </div>
          <PaymentHistoryList
            hasMore={payments.hasMore}
            initialPayments={payments.payments}
          />
        </section>
      </section>
    </main>
  );
}
