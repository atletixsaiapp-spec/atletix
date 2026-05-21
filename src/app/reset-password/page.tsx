import { ResetPasswordForm } from "@/components/auth/reset-password-form";
import { TopNav } from "@/components/brand-nav";

export default function ResetPasswordPage() {
  return (
    <main className="atletix-shell min-h-screen">
      <TopNav active="login" />

      <section className="mx-auto grid min-h-[calc(100vh-80px)] w-full max-w-3xl place-items-center px-4 py-10 sm:px-6 lg:px-8">
        <div className="glass-panel w-full rounded-3xl p-6 sm:p-8">
          <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[#ff8bd8]">
            ATLETIX
          </p>
          <h1 className="mt-3 text-4xl font-black tracking-normal text-white">
            Crea tu password
          </h1>
          <p className="mt-4 leading-7 text-zinc-400">
            Usa el link que recibiste por correo para configurar tu acceso.
          </p>

          <ResetPasswordForm />
        </div>
      </section>
    </main>
  );
}
