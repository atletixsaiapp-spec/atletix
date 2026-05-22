import type { ReactNode } from "react";
import { Dumbbell, KeyRound, LockKeyhole, Mail, ShieldCheck, UserRound } from "lucide-react";
import { TopNav } from "@/components/brand-nav";
import { signIn } from "@/app/auth/actions";

const errorCopy: Record<string, string> = {
  missing_credentials: "Ingresa usuario o correo y contrasena para continuar.",
  invalid_credentials: "No pudimos iniciar sesion con esos datos.",
  admin_not_configured: "El acceso admin aun no esta configurado en el servidor.",
  admin_required: "Necesitas una cuenta administradora para entrar al panel.",
};

export function ClientLoginScreen({ error }: { error?: string }) {
  return (
    <main className="atletix-shell min-h-screen">
      <TopNav active="login" />

      <section className="mx-auto grid min-h-[calc(100vh-80px)] w-full max-w-7xl items-center gap-6 px-4 py-6 sm:px-6 lg:grid-cols-[0.88fr_1.12fr] lg:px-8">
        <div className="glass-panel rounded-3xl p-6 sm:p-8">
          <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[#ff8bd8]">
            ATLETIX
          </p>
          <h1 className="mt-3 text-4xl font-black tracking-normal text-white sm:text-6xl">
            Strong Women Only
          </h1>
          <p className="mt-4 max-w-xl text-lg leading-8 text-zinc-400">
            Acceso privado para clientas activas y administracion del gimnasio.
          </p>

          <div className="mt-8 grid gap-4 sm:grid-cols-3">
            <LoginBadge label="Cuentas" value="Solo admin" />
            <LoginBadge label="Pagos" value="Manual" />
            <LoginBadge label="Acceso" value="Por correo" />
          </div>

          <div className="mt-6 rounded-2xl border border-[#ff2fa8]/25 bg-[#ff2fa8]/10 p-4">
            <p className="text-sm leading-6 text-zinc-200">
              Las clientas no se registran solas. El entrenador crea la cuenta y envia
              el correo de activacion.
            </p>
          </div>
        </div>

        <div className="mx-auto w-full max-w-lg">
          <LoginPanel
            role="member"
            title="Clienta"
            subtitle="Entra con la cuenta activada por ATLETIX."
            icon={<UserRound size={22} />}
          />
        </div>

        {error ? (
          <div className="lg:col-start-2 rounded-2xl border border-red-300/20 bg-red-400/10 p-4 text-sm font-semibold text-red-100">
            {errorCopy[error] ?? "No pudimos completar el acceso."}
          </div>
        ) : null}
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
              ATLETIX Admin
            </p>
            <h1 className="mt-2 text-3xl font-black tracking-normal text-white sm:text-4xl">
              Acceso entrenador
            </h1>
            <p className="mt-3 text-sm leading-6 text-zinc-400">
              Panel privado para crear clientas, revisar pagos y controlar el gimnasio.
            </p>
          </div>

          <LoginPanel
            role="admin"
            title="Admin"
            subtitle="Ingresa con las credenciales privadas del entrenador."
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
  subtitle: string;
  icon: ReactNode;
}) {
  const buttonLabel = role === "admin" ? "Entrar a admin" : "Entrar a mi cuenta";

  return (
    <section className="glass-panel rounded-3xl p-5 sm:p-6">
      <div className="flex items-center gap-3">
        <div className="grid size-11 place-items-center rounded-2xl bg-[#ff2fa8]/15 text-[#ff8bd8]">
          {icon}
        </div>
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-zinc-500">
            Login
          </p>
          <h2 className="text-2xl font-black text-white">{title}</h2>
        </div>
      </div>

      <p className="mt-4 min-h-12 text-sm leading-6 text-zinc-400">{subtitle}</p>

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
          label="Contrasena"
          name="password"
          type="password"
        />
        <button className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-[#ff2fa8] px-4 py-3 font-black text-white transition hover:bg-[#ff007a]">
          <Dumbbell size={18} />
          {buttonLabel}
        </button>
      </form>
    </section>
  );
}

function LoginBadge({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.035] p-4">
      <p className="text-xs font-black uppercase tracking-[0.16em] text-zinc-500">
        {label}
      </p>
      <p className="mt-2 font-black text-white">{value}</p>
    </div>
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
        Si ya pagaste y no tienes acceso, escribe al entrenador por WhatsApp para
        recibir tu correo de activacion.
      </p>
    </div>
  );
}
