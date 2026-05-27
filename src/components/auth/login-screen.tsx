import type { ReactNode } from "react";
import { Dumbbell, KeyRound, LockKeyhole, Mail, ShieldCheck, UserRound } from "lucide-react";
import { signIn } from "@/app/auth/actions";
import { PendingSubmitButton } from "@/components/ui/atoms/pending-submit-button";
import { TopNav } from "@/components/ui/organisms/top-nav";

const errorCopy: Record<string, string> = {
  missing_credentials: "Ingresa tus datos o correo y contraseña para continuar.",
  invalid_credentials: "No pudimos iniciar sesión con esos datos.",
  admin_not_configured:
    "El acceso de administrador aún no está configurado en el servidor.",
  admin_required: "Necesitas acceso de administrador para entrar al panel.",
};

export function ClientLoginScreen({ error }: { error?: string }) {
  return (
    <main className="atletix-shell min-h-screen">
      <TopNav active="login" />

      <section className="mx-auto flex min-h-[calc(100vh-80px)] w-full max-w-lg items-center px-4 py-8 sm:px-6">
        <div className="w-full">
          <LoginPanel
            role="member"
            title="Cuenta"
            icon={<UserRound size={22} />}
          />

          {error ? (
            <div className="mt-4 rounded-2xl border border-red-300/20 bg-red-400/10 p-4 text-sm font-semibold text-red-100">
              {errorCopy[error] ?? "No pudimos completar el acceso."}
            </div>
          ) : null}
        </div>
      </section>
    </main>
  );
}

export function AdminLoginScreen({ error }: { error?: string }) {
  return (
    <main className="atletix-shell min-h-screen">
      <TopNav active="admin" />

      <section className="mx-auto flex min-h-[calc(100vh-80px)] w-full max-w-xl items-center px-4 py-8 sm:px-6">
        <div className="w-full">
          <div className="mb-5">
            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[#ff8bd8]">
              ATLETIX Administrador
            </p>
            <h1 className="mt-2 text-3xl font-black tracking-normal text-white sm:text-4xl">
              Acceso de administrador
            </h1>
            <p className="mt-3 text-sm leading-6 text-zinc-400">
              Panel privado para crear cuentas, revisar pagos y controlar el gimnasio.
            </p>
          </div>

          <LoginPanel
            role="admin"
            title="Panel"
            subtitle="Ingresa con las credenciales privadas de administración."
            icon={<ShieldCheck size={22} />}
          />

          {error ? (
            <div className="mt-4 rounded-2xl border border-red-300/20 bg-red-400/10 p-4 text-sm font-semibold text-red-100">
              {errorCopy[error] ?? "No pudimos completar el acceso."}
            </div>
          ) : null}
        </div>
      </section>
    </main>
  );
}

function LoginPanel({
  role,
  title,
  subtitle,
  icon,
}: {
  role: "member" | "admin";
  title: string;
  subtitle?: string;
  icon: ReactNode;
}) {
  const buttonLabel = role === "admin" ? "Entrar al panel" : "Entrar a mi cuenta";

  return (
    <section className="glass-panel rounded-3xl p-5 sm:p-6">
      <div className="flex items-center gap-3">
        <div className="grid size-11 place-items-center rounded-2xl bg-[#ff2fa8]/15 text-[#ff8bd8]">
          {icon}
        </div>
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-zinc-500">
            Acceso
          </p>
          <h2 className="text-2xl font-black text-white">{title}</h2>
        </div>
      </div>

      {subtitle ? (
        <p className="mt-4 min-h-12 text-sm leading-6 text-zinc-400">{subtitle}</p>
      ) : null}

      <form action={signIn} className="mt-6 space-y-4">
        <input type="hidden" name="role" value={role} />
        {role === "admin" ? (
          <TextField
            autoComplete="username"
            icon={<UserRound size={18} />}
            label="Usuario"
            name="username"
          />
        ) : (
          <TextField
            autoComplete="email"
            icon={<Mail size={18} />}
            label="Correo"
            name="email"
            type="email"
          />
        )}
        <TextField
          autoComplete="current-password"
          icon={<LockKeyhole size={18} />}
          label="Contraseña"
          name="password"
          type="password"
        />
        <PendingSubmitButton
          className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-[#ff2fa8] px-4 py-3 font-black text-white transition hover:bg-[#ff007a]"
          pendingLabel="Entrando..."
        >
          <Dumbbell size={18} />
          {buttonLabel}
        </PendingSubmitButton>
      </form>
    </section>
  );
}

function TextField({
  autoComplete,
  icon,
  label,
  name,
  type = "text",
}: {
  autoComplete?: string;
  icon: ReactNode;
  label: string;
  name: string;
  type?: string;
}) {
  return (
    <label className="block">
      <span className="text-xs font-black uppercase tracking-[0.16em] text-zinc-500">
        {label}
      </span>
      <div className="mt-2 flex h-12 items-center gap-3 rounded-2xl border border-white/10 bg-black/30 px-4 text-zinc-500 focus-within:border-[#ff2fa8]/60">
        {icon}
        <input
          name={name}
          type={type}
          autoComplete={autoComplete}
          required
          className="h-full min-w-0 flex-1 bg-transparent text-sm font-semibold text-white outline-none"
        />
      </div>
    </label>
  );
}

export function ActivationNotice() {
  return (
    <div className="flex items-start gap-3 rounded-2xl border border-white/10 bg-white/[0.035] p-4 text-sm leading-6 text-zinc-300">
      <KeyRound className="mt-1 shrink-0 text-[#ff8bd8]" size={18} />
      <p>
        Si ya pagaste y no tienes acceso, escribe al equipo ATLETIX por WhatsApp para
        recibir tu correo de activación.
      </p>
    </div>
  );
}
