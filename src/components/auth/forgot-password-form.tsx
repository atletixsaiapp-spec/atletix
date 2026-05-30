import Link from "next/link";
import { ArrowLeft, Mail, Send } from "lucide-react";
import { requestPasswordReset } from "@/app/forgot-password/actions";
import { PendingSubmitButton } from "@/components/ui/atoms/pending-submit-button";

export function ForgotPasswordForm() {
  return (
    <form action={requestPasswordReset} className="mt-6 space-y-4">
      <label className="block">
        <span className="text-xs font-black uppercase tracking-[0.16em] text-zinc-500">
          Correo
        </span>
        <div className="mt-2 flex h-12 items-center gap-3 rounded-2xl border border-white/10 bg-black/30 px-4 text-zinc-500 focus-within:border-[#ff2fa8]/60">
          <Mail size={18} />
          <input
            autoComplete="email"
            className="h-full min-w-0 flex-1 bg-transparent text-sm font-semibold text-white outline-none"
            name="email"
            required
            type="email"
          />
        </div>
      </label>

      <PendingSubmitButton
        className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-[#ff2fa8] px-4 py-3 font-black text-white transition hover:bg-[#ff007a]"
        pendingLabel="Enviando enlace..."
      >
        <Send size={18} />
        Enviar enlace
      </PendingSubmitButton>

      <Link
        href="/login"
        className="inline-flex w-full items-center justify-center gap-2 rounded-2xl border border-white/10 px-4 py-3 text-sm font-black text-zinc-200 transition hover:border-[#ff2fa8]/40 hover:text-white"
      >
        <ArrowLeft size={17} />
        Volver al acceso
      </Link>
    </form>
  );
}
