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
    <div className="overflow-x-auto">
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
        <p className="font-semibold text-white">{member.email}</p>
        <p className="text-sm text-zinc-500">{member.phone || "Sin telefono"}</p>
      </td>
      <td className="px-5 py-4">
        <div className="space-y-2">
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
    </tr>
  );
}
