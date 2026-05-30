import { ResetPasswordForm } from "@/components/auth/reset-password-form";
import { AdminNotice } from "@/components/ui/atoms/admin-notice";
import { TopNav } from "@/components/ui/organisms/top-nav";

const noticeCopy: Record<
  string,
  {
    body: string;
    tone: "error" | "warning";
  }
> = {
  missing_session: {
    body: "Abre de nuevo el enlace del correo para crear tu contraseña.",
    tone: "warning",
  },
  password_mismatch: {
    body: "Las contraseñas no coinciden.",
    tone: "error",
  },
  password_short: {
    body: "Usa minimo 8 caracteres.",
    tone: "error",
  },
  update_failed: {
    body: "No pudimos actualizar tu contraseña. Abre de nuevo el enlace del correo.",
    tone: "error",
  },
};

export default async function ResetPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ notice?: string }>;
}) {
  const { notice } = await searchParams;
  const noticeMessage = notice ? noticeCopy[notice] : null;

  return (
    <main className="atletix-shell min-h-screen">
      <TopNav active="login" mode="public" />

      <section className="mx-auto grid min-h-[calc(100vh-80px)] w-full max-w-3xl place-items-center px-4 py-10 sm:px-6 lg:px-8">
        <div className="glass-panel w-full rounded-3xl p-6 sm:p-8">
          <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[#ff8bd8]">
            ATLETIX
          </p>
          <h1 className="mt-3 text-4xl font-black tracking-normal text-white">
            Crea una nueva contraseña
          </h1>
          <p className="mt-4 leading-7 text-zinc-400">
            Usa el enlace que recibiste por correo para actualizar tu acceso. Al
            guardar, te llevaremos al siguiente paso de tu cuenta.
          </p>

          {noticeMessage ? (
            <div className="mt-6">
              <AdminNotice body={noticeMessage.body} tone={noticeMessage.tone} />
            </div>
          ) : null}

          <ResetPasswordForm />
        </div>
      </section>
    </main>
  );
}
