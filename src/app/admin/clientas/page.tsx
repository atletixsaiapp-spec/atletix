import Link from "next/link";
import { ArrowLeft, Search } from "lucide-react";
import { AdminMembersTable } from "@/components/ui/organisms/admin-members-table";
import { TopNav } from "@/components/ui/organisms/top-nav";
import { getAdminDashboardData } from "@/lib/admin-data";
import { requireAdmin } from "@/lib/auth";
import { trainer } from "@/lib/atletix-data";

export default async function AdminClientsPage() {
  await requireAdmin();

  const dashboard = await getAdminDashboardData();

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

        {dashboard.setupMessage ? (
          <div className="mb-6 rounded-2xl border border-amber-300/20 bg-amber-400/10 px-4 py-3 text-sm font-semibold text-amber-100">
            {dashboard.setupMessage}
          </div>
        ) : null}

        <section className="glass-panel overflow-hidden rounded-3xl">
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
