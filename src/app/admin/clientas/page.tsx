import Link from "next/link";
import { ArrowLeft, Search } from "lucide-react";
import { AdminNotice } from "@/components/ui/atoms/admin-notice";
import { AdminMembersTable } from "@/components/ui/organisms/admin-members-table";
import { CreateMemberAccountForm } from "@/components/ui/organisms/create-member-account-form";
import { TopNav } from "@/components/ui/organisms/top-nav";
import { createMemberAccount } from "@/app/admin/actions";
import { getAdminDashboardData } from "@/lib/admin-data";
import { requireAdmin } from "@/lib/auth";
import { trainer } from "@/lib/atletix-data";

const noticeCopy: Record<string, { body: string; tone: "success" | "warning" | "error" }> = {
  invalid_member_form: {
    body: "Revisa los datos de la clienta. Nombre, correo, telefono y objetivo son obligatorios.",
    tone: "error",
  },
  member_auth_failed: {
    body: "No se pudo crear el usuario en Supabase Auth. Revisa si ese correo ya existe.",
    tone: "error",
  },
  member_created: {
    body: "Clienta creada y correo de activacion enviado.",
    tone: "success",
  },
  member_created_email_failed: {
    body: "Clienta creada, pero Resend no pudo enviar el correo.",
    tone: "warning",
  },
  member_created_email_missing: {
    body: "Clienta creada. Falta RESEND_API_KEY para enviar el correo.",
    tone: "warning",
  },
  member_created_link_failed: {
    body: "Clienta creada, pero Supabase no genero el link para resetear password.",
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

export default async function AdminClientsPage({
  searchParams,
}: {
  searchParams: Promise<{ notice?: string }>;
}) {
  await requireAdmin();

  const [{ notice }, dashboard] = await Promise.all([
    searchParams,
    getAdminDashboardData(),
  ]);
  const noticeConfig = notice ? noticeCopy[notice] : null;

  return (
    <main className="atletix-shell min-h-screen">
      <TopNav active="admin" />

      <section className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="flex">
          <Link
            href="/admin"
            className="inline-flex items-center gap-2 rounded-full border border-white/10 px-4 py-2 text-sm font-bold text-zinc-300 transition hover:border-[#ff2fa8]/50 hover:text-white"
          >
            <ArrowLeft size={16} />
            Volver al panel
          </Link>
        </div>

        <div className="mt-6 pb-6">
          <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[#ff8bd8]">
            {trainer.gym} Admin
          </p>
          <h1 className="mt-2 text-3xl font-black tracking-normal text-white sm:text-5xl">
            Clientas
          </h1>
        </div>

        {noticeConfig ? <AdminNotice {...noticeConfig} /> : null}
        {dashboard.setupMessage ? (
          <AdminNotice body={dashboard.setupMessage} tone="warning" />
        ) : null}

        <section className="glass-panel rounded-3xl p-5 sm:p-6">
          <div className="max-w-3xl">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-zinc-500">
              Acceso
            </p>
            <h2 className="mt-1 text-2xl font-black text-white">
              Crear nueva cuenta
            </h2>
            <p className="mt-2 text-sm leading-6 text-zinc-500">
              Crea la ficha de la clienta y envia el correo para activar su acceso.
            </p>
          </div>

          <CreateMemberAccountForm action={createMemberAccount} />
        </section>

        <section className="glass-panel mt-6 overflow-hidden rounded-3xl">
          <div className="flex flex-col gap-4 border-b border-white/10 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-zinc-500">
                Lista completa
              </p>
              <h2 className="mt-1 text-2xl font-black text-white">
                {dashboard.members.length} clientas
              </h2>
            </div>
            <div className="flex min-h-11 w-full items-center justify-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-4 text-zinc-400 sm:w-auto">
              <Search size={17} />
              <span className="text-sm">Datos reales de Supabase</span>
            </div>
          </div>

          <AdminMembersTable members={dashboard.members} />
        </section>
      </section>
    </main>
  );
}
