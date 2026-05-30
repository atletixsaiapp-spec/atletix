import Link from "next/link";
import { ArrowLeft, ImageUp } from "lucide-react";
import { submitPaymentProof } from "@/app/pagos/actions";
import { AdminNotice } from "@/components/ui/atoms/admin-notice";
import { PaymentProofForm } from "@/components/ui/organisms/payment-proof-form";
import { TopNav } from "@/components/ui/organisms/top-nav";
import { requireOnboardedUser } from "@/lib/auth";

const noticeCopy: Record<
  string,
  { body: string; tone: "success" | "warning" | "error" }
> = {
  invalid_payment_proof: {
    body: "Sube una imagen JPG, PNG o WEBP de maximo 8 MB y revisa la fecha.",
    tone: "error",
  },
  missing_supabase_admin: {
    body: "Falta configuracion del servidor para guardar pagos.",
    tone: "error",
  },
  payment_proof_failed: {
    body: "No pudimos registrar el pago. Intentalo de nuevo.",
    tone: "error",
  },
  payment_proof_submitted: {
    body: "Pago enviado. Queda pendiente mientras el equipo valida el banco.",
    tone: "success",
  },
  payment_proof_upload_failed: {
    body: "No pudimos guardar el screenshot. Intentalo de nuevo.",
    tone: "error",
  },
};

export default async function AddPaymentPage({
  searchParams,
}: {
  searchParams: Promise<{ notice?: string }>;
}) {
  await requireOnboardedUser();
  const { notice } = await searchParams;
  const noticeConfig = notice ? noticeCopy[notice] : null;

  return (
    <main className="atletix-shell min-h-screen">
      <TopNav active="member" mode="member" />

      <section className="mx-auto w-full max-w-2xl px-4 py-6 sm:px-6 lg:px-8">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 rounded-full border border-white/10 px-4 py-2 text-sm font-bold text-zinc-300 transition hover:border-[#ff2fa8]/50 hover:text-white"
        >
          <ArrowLeft size={16} />
          Volver al panel
        </Link>

        <div className="mt-6 pb-6">
          <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[#ff8bd8]">
            Agregar pago
          </p>
          <h1 className="mt-2 text-3xl font-black tracking-normal text-white sm:text-5xl">
            Sube tu comprobante
          </h1>
        </div>

        {noticeConfig ? <AdminNotice {...noticeConfig} /> : null}

        <section className="glass-panel rounded-3xl p-5 sm:p-6">
          <div className="mb-5 flex items-start gap-3 rounded-2xl border border-white/10 bg-white/[0.035] p-4">
            <span className="grid size-11 shrink-0 place-items-center rounded-2xl bg-[#ff2fa8]/15 text-[#ff8bd8]">
              <ImageUp size={20} />
            </span>
            <p className="text-sm leading-6 text-zinc-400">
              El pago queda pendiente hasta que el equipo lo valide contra la
              cuenta bancaria. Al aprobarlo, actualizan tu membresia.
            </p>
          </div>

          <PaymentProofForm
            action={submitPaymentProof}
            defaultPaidAt={getBogotaDateKey()}
          />
        </section>
      </section>
    </main>
  );
}

function getBogotaDateKey() {
  const parts = new Intl.DateTimeFormat("en", {
    day: "2-digit",
    month: "2-digit",
    timeZone: "America/Bogota",
    year: "numeric",
  }).formatToParts(new Date());
  const values = Object.fromEntries(
    parts.map((part) => [part.type, part.value]),
  );

  return `${values.year}-${values.month}-${values.day}`;
}
