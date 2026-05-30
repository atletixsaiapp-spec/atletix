import { CalendarDays, ImageUp } from "lucide-react";
import { PendingSubmitButton } from "@/components/ui/atoms/pending-submit-button";

const fieldClass =
  "mt-2 min-h-12 w-full rounded-2xl border border-white/10 bg-black/30 px-4 text-sm font-semibold text-white outline-none transition file:mr-4 file:rounded-full file:border-0 file:bg-white file:px-4 file:py-2 file:text-sm file:font-black file:text-black placeholder:text-zinc-700 focus:border-[#ff2fa8]/60";
const labelClass =
  "text-[0.72rem] font-black uppercase tracking-[0.16em] text-zinc-500";

export function PaymentProofForm({
  action,
  defaultPaidAt,
}: {
  action: (formData: FormData) => Promise<void> | void;
  defaultPaidAt: string;
}) {
  return (
    <form action={action} className="grid gap-4">
      <label className={labelClass}>
        Fecha del pago
        <div className="relative">
          <input
            className={`${fieldClass} pl-11`}
            defaultValue={defaultPaidAt}
            name="paidAt"
            required
            type="date"
          />
          <CalendarDays
            className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[#ff8bd8]"
            size={17}
          />
        </div>
      </label>

      <label className={labelClass}>
        Screenshot del pago
        <input
          accept="image/jpeg,image/png,image/webp"
          className={fieldClass}
          name="paymentProof"
          required
          type="file"
        />
      </label>

      <PendingSubmitButton
        className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-[#ff2fa8] px-5 py-3 text-sm font-black text-white transition hover:bg-[#ff58b9] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#ff8bd8]"
        pendingLabel="Enviando pago..."
      >
        <ImageUp size={18} />
        Enviar pago
      </PendingSubmitButton>
    </form>
  );
}
