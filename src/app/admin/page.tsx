import type { ReactNode } from "react";
import {
  Activity,
  Banknote,
  CalendarClock,
  CalendarX,
  CheckCircle2,
  CircleDollarSign,
  ClipboardList,
  MailPlus,
  MessageCircle,
  Plus,
  Search,
  TrendingUp,
  UsersRound,
} from "lucide-react";
import { createMemberAccount } from "@/app/admin/actions";
import { StatusBadge } from "@/components/ui/atoms/status-badge";
import { TopNav } from "@/components/ui/organisms/top-nav";
import {
  type AdminDashboardMember,
  getAdminDashboardData,
  getDaysUntil,
} from "@/lib/admin-data";
import { requireAdmin } from "@/lib/auth";
import { formatCurrency, formatShortDate, trainer } from "@/lib/atletix-data";

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

export default async function AdminPage({
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
        <div className="flex flex-col gap-4 pb-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[#ff8bd8]">
              Panel entrenador
            </p>
            <h1 className="mt-2 text-3xl font-black tracking-normal text-white sm:text-5xl">
              {trainer.gym} Control Center
            </h1>
          </div>
          <div className="flex flex-wrap gap-3">
            <a
              href="#nueva-clienta"
              className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-3 text-sm font-black text-black transition hover:bg-zinc-200"
            >
              <Plus size={18} />
              Nueva clienta
            </a>
            <a
              href="#pagos"
              className="inline-flex items-center gap-2 rounded-full border border-[#ff2fa8]/50 bg-[#ff2fa8]/12 px-4 py-3 text-sm font-black text-white transition hover:bg-[#ff2fa8]/20"
            >
              <Banknote size={18} />
              Registrar pago
            </a>
          </div>
        </div>

        {noticeConfig ? <AdminNotice {...noticeConfig} /> : null}
        {dashboard.setupMessage ? (
          <AdminNotice body={dashboard.setupMessage} tone="warning" />
        ) : null}

        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <AdminMetric
            icon={<UsersRound size={22} />}
            label="Total clientas"
            value={`${dashboard.stats.totalMembers}`}
            detail={`${dashboard.stats.activeMembers} activas`}
          />
          <AdminMetric
            icon={<CalendarX size={22} />}
            label="Vencidas"
            value={`${dashboard.stats.expiredMembers}`}
            detail={`${dashboard.stats.expiringMembers} por vencer`}
            tone="warning"
          />
          <AdminMetric
            icon={<CircleDollarSign size={22} />}
            label="Ingresos mes"
            value={formatCurrency(dashboard.stats.revenueMonth)}
            detail={`${formatCurrency(dashboard.stats.revenueToday)} hoy`}
            tone="money"
          />
          <AdminMetric
            icon={<Activity size={22} />}
            label="Asistencia"
            value={`${dashboard.stats.weeklyAttendance}`}
            detail="entrenos esta semana"
            tone="green"
          />
        </section>

        <section className="mt-6 grid gap-6 xl:grid-cols-[1.4fr_0.8fr]">
          <div className="glass-panel overflow-hidden rounded-3xl">
            <div className="flex flex-col gap-4 border-b border-white/10 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.2em] text-zinc-500">
                  Clientas
                </p>
                <h2 className="mt-1 text-2xl font-black text-white">
                  Estado de membresias
                </h2>
              </div>
              <div className="flex min-h-11 items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-4 text-zinc-400">
                <Search size={17} />
                <span className="text-sm">Datos reales de Supabase</span>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full min-w-[760px] text-left">
                <thead className="border-b border-white/10 text-xs uppercase tracking-[0.18em] text-zinc-500">
                  <tr>
                    <th className="px-5 py-4 font-black">Clienta</th>
                    <th className="px-5 py-4 font-black">Membresia</th>
                    <th className="px-5 py-4 font-black">Progreso</th>
                    <th className="px-5 py-4 font-black">Rutina</th>
                    <th className="px-5 py-4 font-black">Accion</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/10">
                  {dashboard.members.length ? (
                    dashboard.members.map((member) => (
                      <MemberRow key={member.id} member={member} />
                    ))
                  ) : (
                    <tr>
                      <td className="px-5 py-10 text-center text-zinc-500" colSpan={5}>
                        Aun no hay clientas creadas.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <div className="space-y-6">
            <section id="nueva-clienta" className="glass-panel rounded-3xl p-5 sm:p-6">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm font-semibold uppercase tracking-[0.2em] text-zinc-500">
                    Nueva clienta
                  </p>
                  <h2 className="mt-1 text-2xl font-black text-white">
                    Crear acceso
                  </h2>
                </div>
                <MailPlus className="text-[#ff8bd8]" size={26} />
              </div>

              <form action={createMemberAccount} className="mt-5 space-y-3">
                <Field label="Nombre completo" name="fullName" required />
                <Field label="Correo" name="email" required type="email" />
                <Field label="Telefono" name="phone" required />
                <Field label="Fecha nacimiento" name="dateOfBirth" type="date" />
                <div className="grid gap-3 sm:grid-cols-2">
                  <Field label="Estatura cm" name="heightCm" type="number" />
                  <Field label="Peso inicial kg" name="initialWeightKg" type="number" />
                </div>
                <label className="block">
                  <span className="text-xs font-black uppercase tracking-[0.16em] text-zinc-500">
                    Objetivo
                  </span>
                  <select
                    name="goal"
                    required
                    className="mt-2 h-12 w-full rounded-2xl border border-white/10 bg-black/30 px-4 text-sm font-semibold text-white outline-none transition focus:border-[#ff2fa8]/60"
                  >
                    <option value="">Seleccionar</option>
                    <option>Bajar grasa</option>
                    <option>Ganar masa muscular</option>
                    <option>Tonificar</option>
                    <option>Fuerza</option>
                    <option>Salud general</option>
                  </select>
                </label>
                <button className="mt-2 inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-[#ff2fa8] px-4 py-3 font-black text-white shadow-[0_0_26px_rgba(255,47,168,0.35)] transition hover:bg-[#ff007a]">
                  <MailPlus size={18} />
                  Crear y enviar correo
                </button>
              </form>
            </section>

            <section id="pagos" className="glass-panel rounded-3xl p-5 sm:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold uppercase tracking-[0.2em] text-zinc-500">
                    Pagos manuales
                  </p>
                  <h2 className="mt-1 text-2xl font-black text-white">
                    Activar membresia
                  </h2>
                </div>
                <CheckCircle2 className="text-emerald-300" size={26} />
              </div>

              <div className="mt-5 space-y-3">
                <StaticField
                  label="Estado"
                  value={
                    dashboard.members.length
                      ? "Lista para conectar registro de pagos"
                      : "Crea una clienta primero"
                  }
                />
                <button
                  disabled
                  className="mt-2 inline-flex w-full cursor-not-allowed items-center justify-center gap-2 rounded-2xl border border-white/10 px-4 py-3 font-black text-zinc-500"
                >
                  <Banknote size={18} />
                  Guardar pago
                </button>
              </div>
            </section>

            <section className="glass-panel rounded-3xl p-5 sm:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold uppercase tracking-[0.2em] text-zinc-500">
                    Atencion
                  </p>
                  <h2 className="mt-1 text-2xl font-black text-white">
                    WhatsApp rapido
                  </h2>
                </div>
                <MessageCircle className="text-[#ff8bd8]" size={26} />
              </div>

              <div className="mt-5 space-y-3">
                {dashboard.attentionMembers.length ? (
                  dashboard.attentionMembers.map((member) => (
                    <a
                      key={member.id}
                      href={whatsappLink(member.name, member.phone)}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center justify-between gap-4 rounded-2xl border border-white/10 bg-white/[0.035] p-4 transition hover:border-emerald-300/40 hover:bg-emerald-300/10"
                    >
                      <div>
                        <p className="font-black text-white">{member.name}</p>
                        <p className="text-sm text-zinc-500">
                          {member.membershipEnd
                            ? `Vence ${formatShortDate(member.membershipEnd)}`
                            : "Sin membresia"}
                        </p>
                      </div>
                      <MessageCircle className="text-emerald-300" size={20} />
                    </a>
                  ))
                ) : (
                  <div className="rounded-2xl border border-white/10 bg-white/[0.035] p-4 text-sm text-zinc-500">
                    Sin vencimientos por atender.
                  </div>
                )}
              </div>
            </section>
          </div>
        </section>

        <section className="mt-6 grid gap-6 lg:grid-cols-3">
          <AdminWorkPanel
            icon={<ClipboardList size={22} />}
            title="Rutinas"
            body="Siguiente paso: asignar ejercicios reales desde Supabase."
          />
          <AdminWorkPanel
            icon={<TrendingUp size={22} />}
            title="Progreso"
            body="Peso, medidas y racha ya pueden salir de tablas reales."
          />
          <AdminWorkPanel
            icon={<CalendarClock size={22} />}
            title="Vencimientos"
            body="El panel calcula activas, por vencer y vencidas con fechas reales."
          />
        </section>
      </section>
    </main>
  );
}

function MemberRow({ member }: { member: AdminDashboardMember }) {
  const days = member.membershipEnd ? getDaysUntil(member.membershipEnd) : null;

  return (
    <tr className="bg-white/[0.015]">
      <td className="px-5 py-4">
        <div className="flex items-center gap-3">
          <div className="grid size-11 place-items-center rounded-2xl bg-[#ff2fa8]/15 font-black text-[#ff8bd8]">
            {member.initials}
          </div>
          <div>
            <p className="font-black text-white">{member.name}</p>
            <p className="text-sm text-zinc-500">{member.goal}</p>
          </div>
        </div>
      </td>
      <td className="px-5 py-4">
        <div className="space-y-2">
          <StatusBadge status={member.status} />
          <p className="text-sm text-zinc-500">
            {days === null
              ? "Sin fecha"
              : days >= 0
                ? `${days} dias restantes`
                : `${Math.abs(days)} dias vencida`}
          </p>
        </div>
      </td>
      <td className="px-5 py-4">
        <div className="w-36">
          <div className="flex items-center justify-between text-sm">
            <span className="text-zinc-500">Semana</span>
            <span className="font-black text-white">{member.progressPercent}%</span>
          </div>
          <div className="mt-2 h-2 overflow-hidden rounded-full bg-white/10">
            <div
              className="h-full rounded-full bg-[#ff2fa8]"
              style={{ width: `${member.progressPercent}%` }}
            />
          </div>
        </div>
      </td>
      <td className="px-5 py-4">
        <p className="font-semibold text-white">{member.routineName}</p>
        <p className="text-sm text-zinc-500">{member.routineDay}</p>
      </td>
      <td className="px-5 py-4">
        <span className="rounded-full border border-white/10 px-4 py-2 text-sm font-bold text-zinc-500">
          Ficha pronto
        </span>
      </td>
    </tr>
  );
}

function AdminMetric({
  icon,
  label,
  value,
  detail,
  tone = "pink",
}: {
  icon: ReactNode;
  label: string;
  value: string;
  detail: string;
  tone?: "pink" | "warning" | "money" | "green";
}) {
  const tones = {
    green: "text-emerald-200",
    money: "text-cyan-200",
    pink: "text-[#ff8bd8]",
    warning: "text-amber-200",
  };

  return (
    <div className="glass-panel rounded-3xl p-5">
      <div className={`grid size-11 place-items-center rounded-2xl bg-white/[0.05] ${tones[tone]}`}>
        {icon}
      </div>
      <p className="mt-5 text-xs font-black uppercase tracking-[0.18em] text-zinc-500">
        {label}
      </p>
      <p className="metric-number mt-2 text-3xl font-black text-white">{value}</p>
      <p className="mt-1 text-sm text-zinc-500">{detail}</p>
    </div>
  );
}

function Field({
  label,
  name,
  required,
  type = "text",
}: {
  label: string;
  name: string;
  required?: boolean;
  type?: string;
}) {
  return (
    <label className="block">
      <span className="text-xs font-black uppercase tracking-[0.16em] text-zinc-500">
        {label}
      </span>
      <input
        name={name}
        required={required}
        type={type}
        className="mt-2 h-12 w-full rounded-2xl border border-white/10 bg-black/30 px-4 text-sm font-semibold text-white outline-none transition placeholder:text-zinc-600 focus:border-[#ff2fa8]/60"
      />
    </label>
  );
}

function StaticField({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-black/30 p-4">
      <p className="text-xs font-black uppercase tracking-[0.16em] text-zinc-500">
        {label}
      </p>
      <p className="mt-2 text-sm font-semibold text-zinc-300">{value}</p>
    </div>
  );
}

function AdminWorkPanel({
  icon,
  title,
  body,
}: {
  icon: ReactNode;
  title: string;
  body: string;
}) {
  return (
    <div className="glass-panel rounded-3xl p-5">
      <div className="flex items-start gap-4">
        <div className="grid size-11 place-items-center rounded-2xl bg-[#ff2fa8]/15 text-[#ff8bd8]">
          {icon}
        </div>
        <div>
          <h3 className="text-xl font-black text-white">{title}</h3>
          <p className="mt-2 leading-6 text-zinc-400">{body}</p>
        </div>
      </div>
    </div>
  );
}

function AdminNotice({
  body,
  tone,
}: {
  body: string;
  tone: "success" | "warning" | "error";
}) {
  const tones = {
    error: "border-red-300/20 bg-red-400/10 text-red-100",
    success: "border-emerald-300/20 bg-emerald-400/10 text-emerald-100",
    warning: "border-amber-300/20 bg-amber-400/10 text-amber-100",
  };

  return (
    <div className={`mb-6 rounded-2xl border px-4 py-3 text-sm font-semibold ${tones[tone]}`}>
      {body}
    </div>
  );
}

function whatsappLink(name: string, phone: string) {
  const text = `Hola ${name}, tu mensualidad de ATLETIX necesita revision. Enviame el comprobante por WhatsApp y activo tu membresia.`;
  const normalizedPhone = phone.replace(/\D/g, "");

  return normalizedPhone
    ? `https://wa.me/${normalizedPhone}?text=${encodeURIComponent(text)}`
    : `https://wa.me/?text=${encodeURIComponent(text)}`;
}
