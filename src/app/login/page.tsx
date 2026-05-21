import type { ReactNode } from "react";
import { Dumbbell, LockKeyhole, Mail, Phone, UserRound } from "lucide-react";
import { TopNav } from "@/components/brand-nav";

export default function LoginPage() {
  return (
    <main className="atletix-shell min-h-screen">
      <TopNav active="login" />

      <section className="mx-auto grid min-h-[calc(100vh-80px)] w-full max-w-7xl items-center gap-6 px-4 py-6 sm:px-6 lg:grid-cols-[0.9fr_1.1fr] lg:px-8">
        <div className="glass-panel rounded-3xl p-6 sm:p-8">
          <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[#ff8bd8]">
            ATLETIX
          </p>
          <h1 className="mt-3 text-4xl font-black tracking-normal text-white sm:text-6xl">
            Strong Women Only
          </h1>
          <p className="mt-4 max-w-xl text-lg leading-8 text-zinc-400">
            Acceso para clientas activas y administracion del entrenador.
          </p>

          <div className="mt-8 grid gap-4 sm:grid-cols-3">
            <LoginBadge label="Membresia" value="Manual" />
            <LoginBadge label="Progreso" value="Activo" />
            <LoginBadge label="Rutinas" value="Coach" />
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <section className="glass-panel rounded-3xl p-5 sm:p-6">
            <div className="flex items-center gap-3">
              <div className="grid size-11 place-items-center rounded-2xl bg-[#ff2fa8]/15 text-[#ff8bd8]">
                <LockKeyhole size={22} />
              </div>
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.18em] text-zinc-500">
                  Login
                </p>
                <h2 className="text-2xl font-black text-white">Entrar</h2>
              </div>
            </div>

            <form className="mt-6 space-y-4">
              <TextField icon={<Mail size={18} />} label="Correo" value="isabella@atletix.demo" />
              <TextField icon={<LockKeyhole size={18} />} label="Password" value="********" type="password" />
              <button className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-[#ff2fa8] px-4 py-3 font-black text-white transition hover:bg-[#ff007a]">
                <Dumbbell size={18} />
                Iniciar sesion
              </button>
            </form>
          </section>

          <section className="glass-panel rounded-3xl p-5 sm:p-6">
            <div className="flex items-center gap-3">
              <div className="grid size-11 place-items-center rounded-2xl bg-white/[0.06] text-white">
                <UserRound size={22} />
              </div>
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.18em] text-zinc-500">
                  Registro
                </p>
                <h2 className="text-2xl font-black text-white">Nueva clienta</h2>
              </div>
            </div>

            <form className="mt-6 space-y-4">
              <TextField icon={<UserRound size={18} />} label="Nombre completo" value="Nueva clienta" />
              <TextField icon={<Mail size={18} />} label="Correo" value="clienta@correo.com" />
              <TextField icon={<Phone size={18} />} label="Telefono" value="+57 300 000 0000" />
              <select className="h-12 w-full rounded-2xl border border-white/10 bg-black/30 px-4 text-sm font-semibold text-white outline-none focus:border-[#ff2fa8]/60">
                <option>Bajar grasa</option>
                <option>Ganar masa muscular</option>
                <option>Tonificar</option>
                <option>Fuerza</option>
                <option>Salud general</option>
              </select>
              <button className="inline-flex w-full items-center justify-center gap-2 rounded-2xl border border-white/10 px-4 py-3 font-black text-white transition hover:border-[#ff2fa8]/60 hover:bg-[#ff2fa8]/10">
                Crear solicitud
              </button>
            </form>
          </section>
        </div>
      </section>
    </main>
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
  icon,
  label,
  value,
  type = "text",
}: {
  icon: ReactNode;
  label: string;
  value: string;
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
          type={type}
          defaultValue={value}
          className="h-full flex-1 bg-transparent text-sm font-semibold text-white outline-none"
        />
      </div>
    </label>
  );
}
