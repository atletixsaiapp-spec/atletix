import { Clock3, ListChecks } from "lucide-react";
import { joinWaitlist } from "@/app/lista-espera/actions";
import { AdminNotice } from "@/components/ui/atoms/admin-notice";
import { TopNav } from "@/components/ui/organisms/top-nav";
import { WaitlistForm } from "@/components/ui/organisms/waitlist-form";
import { getTrainingGroups } from "@/lib/training-groups";

const noticeCopy: Record<
  string,
  { body: string; tone: "success" | "warning" | "error" }
> = {
  already_member: {
    body: "Ese correo ya tiene una cuenta ATLETIX. Ingresa desde acceso.",
    tone: "warning",
  },
  invalid_group: {
    body: "Ese grupo ya no esta disponible.",
    tone: "error",
  },
  invalid_waitlist: {
    body: "Revisa tus datos antes de enviarlos.",
    tone: "error",
  },
  missing_supabase_admin: {
    body: "La lista de espera aun no esta configurada en el servidor.",
    tone: "error",
  },
  waitlist_duplicate: {
    body: "Ese correo ya esta en la lista de espera.",
    tone: "warning",
  },
  waitlist_failed: {
    body: "No pudimos guardar tu solicitud. Intentalo de nuevo.",
    tone: "error",
  },
  waitlist_joined: {
    body: "Quedaste en la lista de espera. Cuando haya cupo, el equipo te enviara el enlace para completar tu cuenta.",
    tone: "success",
  },
};

export default async function WaitlistPage({
  searchParams,
}: {
  searchParams: Promise<{ notice?: string }>;
}) {
  const [{ notice }, groups] = await Promise.all([
    searchParams,
    getTrainingGroups({ activeOnly: true }),
  ]);
  const noticeConfig = notice ? noticeCopy[notice] : null;

  return (
    <main className="atletix-shell min-h-screen">
      <TopNav active="waitlist" mode="public" />

      <section className="mx-auto grid min-h-[calc(100vh-80px)] w-full max-w-5xl gap-6 px-4 py-6 sm:px-6 lg:grid-cols-[0.75fr_1fr] lg:px-8">
        <aside className="flex flex-col justify-center">
          <div className="glass-panel rounded-3xl p-5 sm:p-6">
            <div className="grid size-12 place-items-center rounded-2xl bg-[#ff2fa8]/15 text-[#ff8bd8]">
              <ListChecks size={24} />
            </div>
            <p className="mt-5 text-sm font-semibold uppercase tracking-[0.22em] text-[#ff8bd8]">
              Lista de espera
            </p>
            <h1 className="mt-2 text-3xl font-black tracking-normal text-white sm:text-4xl">
              Deja tus datos para entrar cuando se libere un cupo.
            </h1>
            <div className="mt-6 rounded-2xl border border-white/10 bg-white/[0.035] p-4">
              <p className="flex items-center gap-2 text-sm font-black text-white">
                <Clock3 className="text-[#ff8bd8]" size={18} />
                Horario preferido
              </p>
              <p className="mt-2 text-sm leading-6 text-zinc-400">
                Puedes elegir un grupo como referencia; el equipo confirma el
                cupo disponible antes de crear la cuenta.
              </p>
            </div>
          </div>
        </aside>

        <section className="flex flex-col justify-center">
          {noticeConfig ? (
            <div className="mb-5">
              <AdminNotice {...noticeConfig} />
            </div>
          ) : null}
          {groups.setupMessage ? (
            <div className="mb-5">
              <AdminNotice body={groups.setupMessage} tone="warning" />
            </div>
          ) : null}

          <section className="glass-panel rounded-3xl p-5 sm:p-6">
            <WaitlistForm
              action={joinWaitlist}
              trainingGroups={groups.groups}
            />
          </section>
        </section>
      </section>
    </main>
  );
}
