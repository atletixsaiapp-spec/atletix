import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { createMemberAccount } from "@/app/admin/actions";
import { AdminNotice } from "@/components/ui/atoms/admin-notice";
import { CreateMemberAccountForm } from "@/components/ui/organisms/create-member-account-form";
import { TopNav } from "@/components/ui/organisms/top-nav";
import { requireAdmin } from "@/lib/auth";
import { trainer } from "@/lib/atletix-data";

const noticeCopy: Record<string, { body: string; tone: "success" | "warning" | "error" }> = {
  invalid_member_form: {
    body: "Revisa los datos de la clienta. Nombre, correo, fecha de cumpleaños y celular son obligatorios.",
    tone: "error",
  },
  member_auth_failed: {
    body: "No se pudo crear el usuario en Supabase Auth. Revisa si ese correo ya existe.",
    tone: "error",
  },
  member_duplicate: {
    body: "Ya existe una clienta con ese correo.",
    tone: "warning",
  },
  member_created: {
    body: "Invitacion creada y correo de activacion enviado.",
    tone: "success",
  },
  member_created_email_failed: {
    body: "Invitacion creada, pero Resend rechazo el correo. Revisa que RESEND_FROM_EMAIL use un remitente con dominio verificado.",
    tone: "warning",
  },
  member_created_email_missing: {
    body: "Invitacion creada. Faltan RESEND_API_KEY o RESEND_FROM_EMAIL para enviar el correo.",
    tone: "warning",
  },
  member_created_link_failed: {
    body: "Invitacion creada, pero Supabase no genero el link de activacion.",
    tone: "warning",
  },
  member_profile_failed: {
    body: "No se pudo crear el perfil de la clienta.",
    tone: "error",
  },
  member_record_failed: {
    body: "No se pudo crear la ficha de la clienta.",
    tone: "error",
  },
  missing_supabase_admin: {
    body: "Falta SUPABASE_SERVICE_ROLE_KEY para crear clientas reales.",
    tone: "error",
  },
};

export default async function NewAdminClientPage({
  searchParams,
}: {
  searchParams: Promise<{ notice?: string }>;
}) {
  await requireAdmin();

  const { notice } = await searchParams;
  const noticeConfig = notice ? noticeCopy[notice] : null;

  return (
    <main className="atletix-shell min-h-screen">
      <TopNav active="admin" />

      <section className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="flex">
          <Link
            href="/admin/clientas"
            className="inline-flex items-center gap-2 rounded-full border border-white/10 px-4 py-2 text-sm font-bold text-zinc-300 transition hover:border-[#ff2fa8]/50 hover:text-white"
          >
            <ArrowLeft size={16} />
            Volver a clientas
          </Link>
        </div>

        <div className="mt-6 pb-6">
          <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[#ff8bd8]">
            {trainer.gym} Admin
          </p>
          <h1 className="mt-2 text-3xl font-black tracking-normal text-white sm:text-5xl">
            Invitar clienta
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-zinc-500 sm:text-base">
            Crea la ficha inicial con los datos de contacto y envia el correo para
            que configure su password.
          </p>
        </div>

        {noticeConfig ? <AdminNotice {...noticeConfig} /> : null}

        <section className="glass-panel rounded-3xl p-5 sm:p-6">
          <CreateMemberAccountForm action={createMemberAccount} />
        </section>
      </section>
    </main>
  );
}
