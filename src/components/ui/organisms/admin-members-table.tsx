import Link from "next/link";
import type { AdminDashboardMember } from "@/lib/admin-data";
import { getDaysUntil } from "@/lib/admin-data";
import { formatShortDate } from "@/lib/atletix-data";
import { StatusBadge } from "@/components/ui/atoms/status-badge";

export function AdminMembersTable({
  emptyMessage = "Aun no hay clientas creadas.",
  members,
}: {
  emptyMessage?: string;
  members: AdminDashboardMember[];
}) {
  return (
    <>
      <div className="grid gap-3 p-4 md:hidden">
        {members.length ? (
          members.map((member) => <MemberCard key={member.id} member={member} />)
        ) : (
          <div className="rounded-2xl border border-white/10 bg-white/[0.035] p-5 text-center text-sm text-zinc-500">
            {emptyMessage}
          </div>
        )}
      </div>

      <div className="hidden overflow-x-auto md:block">
        <table className="w-full min-w-[820px] text-left">
          <thead className="border-b border-white/10 text-xs uppercase tracking-[0.18em] text-zinc-500">
            <tr>
              <th className="px-5 py-4 font-black">Clienta</th>
              <th className="px-5 py-4 font-black">Contacto</th>
              <th className="px-5 py-4 font-black">Membresia</th>
              <th className="px-5 py-4 font-black">Progreso</th>
              <th className="px-5 py-4 font-black">Rutina</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/10">
            {members.length ? (
              members.map((member) => <MemberRow key={member.id} member={member} />)
            ) : (
              <tr>
                <td className="px-5 py-10 text-center text-zinc-500" colSpan={5}>
                  {emptyMessage}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </>
  );
}

function MemberCard({ member }: { member: AdminDashboardMember }) {
  const days = member.membershipEnd ? getDaysUntil(member.membershipEnd) : null;

  return (
    <Link
      className="block rounded-2xl border border-white/10 bg-white/[0.035] p-4 transition hover:border-[#ff2fa8]/50 hover:bg-[#ff2fa8]/[0.04] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#ff8bd8]"
      href={`/clientes/${member.id}`}
    >
      <div className="flex items-start gap-3">
        <div className="grid size-11 shrink-0 place-items-center rounded-2xl bg-[#ff2fa8]/15 font-black text-[#ff8bd8]">
          {member.initials}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-col gap-2 min-[380px]:flex-row min-[380px]:items-start min-[380px]:justify-between">
            <div className="min-w-0">
              <p className="truncate font-black text-white">{member.name}</p>
              <p className="text-sm text-zinc-500">{member.goal}</p>
            </div>
            <StatusBadge status={member.status} />
          </div>

          <div className="mt-4 grid gap-3 text-sm">
            <MobileField label="Correo" value={member.email} />
            <MobileField label="Telefono" value={member.phone || "Sin telefono"} />
            <MobileField
              label="Membresia"
              value={
                member.membershipEnd
                  ? `Vence ${formatShortDate(member.membershipEnd)}`
                  : "Sin fecha"
              }
              detail={
                days === null
                  ? "Sin membresia"
                  : days >= 0
                    ? `${days} dias restantes`
                    : `${Math.abs(days)} dias vencida`
              }
            />
            <MobileField
              label="Rutina"
              value={member.routineName}
              detail={member.routineDay}
            />
          </div>

          <div className="mt-4">
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
        </div>
      </div>
    </Link>
  );
}

function MobileField({
  detail,
  label,
  value,
}: {
  detail?: string;
  label: string;
  value: string;
}) {
  return (
    <div className="min-w-0 rounded-2xl bg-black/25 p-3">
      <p className="text-[0.68rem] font-black uppercase tracking-[0.14em] text-zinc-600">
        {label}
      </p>
      <p className="mt-1 break-words font-semibold text-zinc-200">{value}</p>
      {detail ? <p className="mt-1 text-xs text-zinc-500">{detail}</p> : null}
    </div>
  );
}

function MemberRow({ member }: { member: AdminDashboardMember }) {
  const days = member.membershipEnd ? getDaysUntil(member.membershipEnd) : null;

  return (
    <tr className="bg-white/[0.015] transition hover:bg-[#ff2fa8]/[0.035]">
      <td className="px-5 py-4">
        <Link
          className="flex items-center gap-3 rounded-2xl outline-none focus-visible:ring-2 focus-visible:ring-[#ff8bd8]"
          href={`/clientes/${member.id}`}
        >
          <div className="grid size-11 place-items-center rounded-2xl bg-[#ff2fa8]/15 font-black text-[#ff8bd8]">
            {member.initials}
          </div>
          <div>
            <p className="font-black text-white">{member.name}</p>
            <p className="text-sm text-zinc-500">{member.goal}</p>
          </div>
        </Link>
      </td>
      <td className="px-5 py-4">
        <Link
          className="block rounded-2xl outline-none focus-visible:ring-2 focus-visible:ring-[#ff8bd8]"
          href={`/clientes/${member.id}`}
        >
          <p className="font-semibold text-white">{member.email}</p>
          <p className="text-sm text-zinc-500">{member.phone || "Sin telefono"}</p>
        </Link>
      </td>
      <td className="px-5 py-4">
        <Link
          className="block space-y-2 rounded-2xl outline-none focus-visible:ring-2 focus-visible:ring-[#ff8bd8]"
          href={`/clientes/${member.id}`}
        >
          <StatusBadge status={member.status} />
          <p className="text-sm text-zinc-500">
            {member.membershipEnd
              ? `Vence ${formatShortDate(member.membershipEnd)}`
              : "Sin fecha"}
          </p>
          <p className="text-xs text-zinc-600">
            {days === null
              ? "Sin membresia"
              : days >= 0
                ? `${days} dias restantes`
                : `${Math.abs(days)} dias vencida`}
          </p>
        </Link>
      </td>
      <td className="px-5 py-4">
        <Link
          className="block w-36 rounded-2xl outline-none focus-visible:ring-2 focus-visible:ring-[#ff8bd8]"
          href={`/clientes/${member.id}`}
        >
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
        </Link>
      </td>
      <td className="px-5 py-4">
        <Link
          className="block rounded-2xl outline-none focus-visible:ring-2 focus-visible:ring-[#ff8bd8]"
          href={`/clientes/${member.id}`}
        >
          <p className="font-semibold text-white">{member.routineName}</p>
          <p className="text-sm text-zinc-500">{member.routineDay}</p>
        </Link>
      </td>
    </tr>
  );
}
