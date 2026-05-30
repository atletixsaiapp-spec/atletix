import { LockKeyhole } from "lucide-react";
import { updatePassword } from "@/app/reset-password/actions";
import { PendingSubmitButton } from "@/components/ui/atoms/pending-submit-button";

export function ResetPasswordForm() {
  return (
    <form action={updatePassword} className="mt-6 space-y-4">
      <label className="block">
        <span className="text-xs font-black uppercase tracking-[0.16em] text-zinc-500">
          Nueva contraseña
        </span>
        <div className="mt-2 flex h-12 items-center gap-3 rounded-2xl border border-white/10 bg-black/30 px-4 text-zinc-500 focus-within:border-[#ff2fa8]/60">
          <LockKeyhole size={18} />
          <input
            autoComplete="new-password"
            className="h-full min-w-0 flex-1 bg-transparent text-sm font-semibold text-white outline-none"
            minLength={8}
            name="password"
            required
            type="password"
          />
        </div>
      </label>

      <label className="block">
        <span className="text-xs font-black uppercase tracking-[0.16em] text-zinc-500">
          Confirmar contraseña
        </span>
        <div className="mt-2 flex h-12 items-center gap-3 rounded-2xl border border-white/10 bg-black/30 px-4 text-zinc-500 focus-within:border-[#ff2fa8]/60">
          <LockKeyhole size={18} />
          <input
            autoComplete="new-password"
            className="h-full min-w-0 flex-1 bg-transparent text-sm font-semibold text-white outline-none"
            minLength={8}
            name="confirmPassword"
            required
            type="password"
          />
        </div>
      </label>

      <PendingSubmitButton
        className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-[#ff2fa8] px-4 py-3 font-black text-white transition hover:bg-[#ff007a]"
        pendingLabel="Guardando y entrando..."
      >
        Guardar contraseña
      </PendingSubmitButton>
    </form>
  );
}
