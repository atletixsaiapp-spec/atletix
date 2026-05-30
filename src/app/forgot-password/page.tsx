import { redirect } from "next/navigation";
import { ForgotPasswordForm } from "@/components/auth/forgot-password-form";
import { AdminNotice } from "@/components/ui/atoms/admin-notice";
import { TopNav } from "@/components/ui/organisms/top-nav";
import { getAuthenticatedMemberDestination } from "@/lib/auth";

const noticeCopy: Record<
  string,
  {
    body: string;
    tone: "error" | "success" | "warning";
  }
> = {
  invalid_email: {
    body: "Ingresa un correo valido para recibir el enlace.",
    tone: "error",
  },
  missing_email_config: {
    body: "El envio de correos no esta configurado en el servidor.",
    tone: "warning",
  },
  missing_supabase_admin: {
    body: "La recuperacion de contraseña no esta configurada en el servidor.",
    tone: "warning",
  },
  send_failed: {
    body: "No pudimos enviar el correo. Intentalo de nuevo en unos minutos.",
    tone: "error",
  },
  sent: {
    body: "Si el correo pertenece a una cuenta ATLETIX, enviaremos el enlace para crear una nueva contraseña.",
    tone: "success",
  },
};

export default async function ForgotPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ notice?: string }>;
}) {
  const { notice } = await searchParams;
  const destination = await getAuthenticatedMemberDestination();

  if (destination && !notice) {
    redirect(destination);
  }

  const noticeMessage = notice ? noticeCopy[notice] : null;

  return (
    <main className="atletix-shell min-h-screen">
      <TopNav active="login" mode="public" />

      <section className="mx-auto grid min-h-[calc(100vh-80px)] w-full max-w-2xl place-items-center px-4 py-10 sm:px-6 lg:px-8">
        <div className="glass-panel w-full rounded-3xl p-6 sm:p-8">
          <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[#ff8bd8]">
            ATLETIX
          </p>
          <h1 className="mt-3 text-3xl font-black tracking-normal text-white sm:text-4xl">
            Recupera tu acceso
          </h1>
          <p className="mt-4 leading-7 text-zinc-400">
            Escribe tu correo y te enviaremos un enlace para crear una nueva
            contraseña.
          </p>

          {noticeMessage ? (
            <div className="mt-6">
              <AdminNotice body={noticeMessage.body} tone={noticeMessage.tone} />
            </div>
          ) : null}

          <ForgotPasswordForm />
        </div>
      </section>
    </main>
  );
}
