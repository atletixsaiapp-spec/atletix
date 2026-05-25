"use client";

import { useState, useTransition } from "react";
import { LockKeyhole } from "lucide-react";
import { createClient } from "@/utils/supabase/client";

export function ResetPasswordForm() {
  const [message, setMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleSubmit(formData: FormData) {
    const password = String(formData.get("password") ?? "");

    startTransition(async () => {
      setMessage(null);

      if (password.length < 8) {
        setMessage("Usa minimo 8 caracteres.");
        return;
      }

      const supabase = createClient();
      const { error } = await supabase.auth.updateUser({ password });

      if (error) {
        setMessage("No pudimos actualizar tu password. Abre de nuevo el link del correo.");
        return;
      }

      setMessage("Password actualizado. Ya puedes iniciar sesion para continuar.");
    });
  }

  return (
    <form action={handleSubmit} className="mt-6 space-y-4">
      <label className="block">
        <span className="text-xs font-black uppercase tracking-[0.16em] text-zinc-500">
          Nuevo password
        </span>
        <div className="mt-2 flex h-12 items-center gap-3 rounded-2xl border border-white/10 bg-black/30 px-4 text-zinc-500 focus-within:border-[#ff2fa8]/60">
          <LockKeyhole size={18} />
          <input
            autoComplete="new-password"
            className="h-full min-w-0 flex-1 bg-transparent text-sm font-semibold text-white outline-none"
            name="password"
            required
            type="password"
          />
        </div>
      </label>

      <button
        className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-[#ff2fa8] px-4 py-3 font-black text-white transition hover:bg-[#ff007a]"
        disabled={isPending}
      >
        {isPending ? "Guardando..." : "Guardar password"}
      </button>

      {message ? (
        <p className="rounded-2xl border border-white/10 bg-white/[0.035] p-4 text-sm font-semibold text-zinc-200">
          {message}
        </p>
      ) : null}
    </form>
  );
}
