import Link from "next/link";
import { ArrowLeft, Upload, UserPlus } from "lucide-react";
import { AdminNotice } from "@/components/ui/atoms/admin-notice";
import { AdminMembersSearch } from "@/components/ui/organisms/admin-members-search";
import { TopNav } from "@/components/ui/organisms/top-nav";
import { getAdminDashboardData } from "@/lib/admin-data";
import { requireAdmin } from "@/lib/auth";
import { trainer } from "@/lib/atletix-data";

const noticeCopy: Record<string, { body: string; tone: "success" | "warning" | "error" }> = {
  member_deleted: {
    body: "Cuenta eliminada.",
    tone: "success",
  },
  member_deleted_auth_failed: {
    body: "Ficha eliminada, pero no se pudo borrar el acceso de Supabase Auth.",
    tone: "warning",
  },
};

export default async function AdminClientsPage({
  searchParams,
}: {
  searchParams: Promise<{ notice?: string }>;
}) {
  await requireAdmin();

  const { notice } = await searchParams;
  const dashboard = await getAdminDashboardData();
  const noticeConfig = notice ? noticeCopy[notice] : null;

  return (
    <main className="atletix-shell min-h-screen">
      <TopNav active="admin" mode="admin" />

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

        <div className="mt-6 flex flex-col gap-5 pb-6 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[#ff8bd8]">
              {trainer.gym} Admin
            </p>
            <h1 className="mt-2 text-3xl font-black tracking-normal text-white sm:text-5xl">
              Cuentas
            </h1>
          </div>

          <div className="grid w-full gap-3 sm:grid-cols-2 md:w-auto">
            <Link
              href="/admin/clientas/importar"
              className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full border border-[#ff2fa8]/45 bg-[#ff2fa8]/10 px-5 py-3 text-sm font-black text-white transition hover:bg-[#ff2fa8]/20"
            >
              <Upload size={18} />
              Importar
            </Link>
            <Link
              href="/admin/clientas/nueva"
              className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-white px-5 py-3 text-sm font-black text-black transition hover:bg-zinc-200"
            >
              <UserPlus size={18} />
              Invitar persona
            </Link>
          </div>
        </div>

        {dashboard.setupMessage ? (
          <AdminNotice body={dashboard.setupMessage} tone="warning" />
        ) : null}
        {noticeConfig ? <AdminNotice {...noticeConfig} /> : null}

        <section className="glass-panel overflow-hidden rounded-3xl">
          <AdminMembersSearch members={dashboard.members} />
        </section>
      </section>
    </main>
  );
}
