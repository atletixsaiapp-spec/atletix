import Link from "next/link";
import { Dumbbell, MailCheck } from "lucide-react";
import { TopNav } from "@/components/brand-nav";
import { requireUser } from "@/lib/auth";

export default async function DashboardPage() {
  await requireUser();

  return (
    <main className="atletix-shell min-h-screen">
      <TopNav active="clienta" />

      <section className="mx-auto grid min-h-[calc(100vh-80px)] w-full max-w-4xl place-items-center px-4 py-10 sm:px-6 lg:px-8">
        <div className="glass-panel rounded-3xl p-6 text-center sm:p-10">
          <div className="mx-auto grid size-16 place-items-center rounded-3xl bg-[#ff2fa8]/15 text-[#ff8bd8]">
            <MailCheck size={32} />
          </div>
          <p className="mt-6 text-sm font-semibold uppercase tracking-[0.22em] text-[#ff8bd8]">
            Cuenta activa
          </p>
          <h1 className="mt-3 text-4xl font-black tracking-normal text-white">
            Tu panel esta casi listo
          </h1>
          <p className="mx-auto mt-4 max-w-2xl leading-7 text-zinc-400">
            El acceso ya esta protegido. El siguiente paso es conectar tus datos
            reales de rutina, membresia, progreso y pagos desde Supabase.
          </p>
          <Link
            href="/demo"
            className="mt-8 inline-flex items-center justify-center gap-2 rounded-full bg-[#ff2fa8] px-5 py-3 font-black text-white transition hover:bg-[#ff007a]"
          >
            <Dumbbell size={18} />
            Ver demo visual
          </Link>
        </div>
      </section>
    </main>
  );
}
