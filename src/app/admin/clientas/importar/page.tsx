import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { bulkInviteMembers } from "@/app/admin/actions";
import { AdminNotice } from "@/components/ui/atoms/admin-notice";
import { BulkMemberInviteForm } from "@/components/ui/organisms/bulk-member-invite-form";
import { TopNav } from "@/components/ui/organisms/top-nav";
import { requireAdmin } from "@/lib/auth";
import { trainer } from "@/lib/atletix-data";

const staticNoticeCopy: Record<
  string,
  { body: string; tone: "success" | "warning" | "error" }
> = {
  invalid_bulk_input: {
    body: "Pega al menos una fila valida con nombre, correo, fecha de cumpleaños y celular.",
    tone: "error",
  },
  missing_supabase_admin: {
    body: "Falta SUPABASE_SERVICE_ROLE_KEY para crear invitaciones reales.",
    tone: "error",
  },
};

export default async function ImportAdminClientsPage({
  searchParams,
}: {
  searchParams: Promise<{
    created?: string;
    duplicates?: string;
    emailFailed?: string;
    emailMissing?: string;
    failed?: string;
    linkFailed?: string;
    notice?: string;
  }>;
}) {
  await requireAdmin();

  const params = await searchParams;
  const noticeConfig = getNoticeConfig(params);

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
            Volver a cuentas
          </Link>
        </div>

        <div className="mt-6 pb-6">
          <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[#ff8bd8]">
            {trainer.gym} Admin
          </p>
          <h1 className="mt-2 text-3xl font-black tracking-normal text-white sm:text-5xl">
            Importar invitaciones
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-zinc-500 sm:text-base">
            Pega las filas de Excel con nombre, correo, fecha de cumpleaños y celular.
            ATLETIX crea la ficha inicial y envia el link de activacion.
          </p>
        </div>

        {noticeConfig ? <AdminNotice {...noticeConfig} /> : null}

        <section className="glass-panel rounded-3xl p-5 sm:p-6">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <ImportRule label="Nombre" value="nombre Completo" />
            <ImportRule label="Correo" value="Correo electronico" />
            <ImportRule label="Fecha" value="FECHA DE CUMPLEANOS" />
            <ImportRule label="Celular" value="CELULAR" />
          </div>

          <BulkMemberInviteForm action={bulkInviteMembers} />
        </section>
      </section>
    </main>
  );
}

function ImportRule({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.035] p-4">
      <p className="text-[0.68rem] font-black uppercase tracking-[0.16em] text-zinc-600">
        {label}
      </p>
      <p className="mt-1 break-words text-sm font-black text-white">{value}</p>
    </div>
  );
}

function getNoticeConfig(params: {
  created?: string;
  duplicates?: string;
  emailFailed?: string;
  emailMissing?: string;
  failed?: string;
  linkFailed?: string;
  notice?: string;
}) {
  if (params.notice === "bulk_invite_complete") {
    const created = toCount(params.created);
    const duplicates = toCount(params.duplicates);
    const failed = toCount(params.failed);
    const emailFailed = toCount(params.emailFailed);
    const emailMissing = toCount(params.emailMissing);
    const linkFailed = toCount(params.linkFailed);
    const warnings = [
      duplicates ? `${duplicates} duplicadas` : "",
      failed ? `${failed} filas invalidas o fallidas` : "",
      emailFailed ? `${emailFailed} correos fallaron` : "",
      emailMissing
        ? `${emailMissing} sin correo por falta de RESEND_API_KEY o RESEND_FROM_EMAIL`
        : "",
      linkFailed ? `${linkFailed} sin link de activacion` : "",
    ].filter(Boolean);

    return {
      body: warnings.length
        ? `${created} invitaciones creadas. ${warnings.join(", ")}.`
        : `${created} invitaciones creadas y enviadas.`,
      tone: warnings.length ? ("warning" as const) : ("success" as const),
    };
  }

  return params.notice ? staticNoticeCopy[params.notice] : null;
}

function toCount(value?: string) {
  const parsed = Number(value ?? 0);

  return Number.isFinite(parsed) ? parsed : 0;
}
