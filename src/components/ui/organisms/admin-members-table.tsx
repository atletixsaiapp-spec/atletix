import Link from "next/link";
import type { AdminDashboardMember } from "@/lib/admin-data";
import { getDaysUntil } from "@/lib/admin-data";
import { formatShortDate } from "@/lib/atletix-data";
import { ProfileAvatarPreviewButton } from "@/components/ui/atoms/profile-avatar-preview-button";
import { StatusBadge } from "@/components/ui/atoms/status-badge";

export function AdminMembersTable({
  emptyMessage = "Aun no hay cuentas creadas.",
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
              <th className="px-5 py-4 font-black">Cuenta</th>
              <th className="px-5 py-4 font-black">Contacto</th>
              <th className="px-5 py-4 font-black">Membresia</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/10">
            {members.length ? (
              members.map((member) => <MemberRow key={member.id} member={member} />)
            ) : (
              <tr>
                <td className="px-5 py-10 text-center text-zinc-500" colSpan={3}>
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
    <div className="rounded-2xl border border-white/10 bg-white/[0.035] p-4 transition hover:border-[#ff2fa8]/50 hover:bg-[#ff2fa8]/[0.04]">
      <div className="flex items-start gap-3">
        <ProfileAvatarPreviewButton
          alt={`Foto de ${member.name}`}
          avatarUrl={member.avatarUrl}
          className="grid size-11 shrink-0 place-items-center overflow-hidden rounded-2xl bg-[#ff2fa8]/15 font-black text-[#ff8bd8]"
          imageSize={44}
          initials={member.initials}
        />
        <div className="min-w-0 flex-1">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
            <Link
              className="min-w-0 rounded-xl outline-none focus-visible:ring-2 focus-visible:ring-[#ff8bd8]"
              href={`/cuentas/${member.id}`}
            >
              <p className="truncate font-black text-white">{member.name}</p>
              <p className="text-sm text-zinc-500">{member.goal}</p>
            </Link>
            <StatusBadge status={member.status} />
          </div>

          <Link
            className="mt-4 grid gap-3 rounded-xl text-sm outline-none focus-visible:ring-2 focus-visible:ring-[#ff8bd8]"
            href={`/cuentas/${member.id}`}
          >
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
                  : `${Math.abs(days)} dias de atraso`
              }
            />
          </Link>
        </div>
      </div>
    </div>
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
        <div className="flex items-center gap-3">
          <ProfileAvatarPreviewButton
            alt={`Foto de ${member.name}`}
            avatarUrl={member.avatarUrl}
            className="grid size-11 shrink-0 place-items-center overflow-hidden rounded-2xl bg-[#ff2fa8]/15 font-black text-[#ff8bd8]"
            imageSize={44}
            initials={member.initials}
          />
          <Link
            className="rounded-2xl outline-none focus-visible:ring-2 focus-visible:ring-[#ff8bd8]"
            href={`/cuentas/${member.id}`}
          >
            <p className="font-black text-white">{member.name}</p>
            <p className="text-sm text-zinc-500">{member.goal}</p>
          </Link>
        </div>
      </td>
      <td className="px-5 py-4">
        <Link
          className="block rounded-2xl outline-none focus-visible:ring-2 focus-visible:ring-[#ff8bd8]"
          href={`/cuentas/${member.id}`}
        >
          <p className="font-semibold text-white">{member.email}</p>
          <p className="text-sm text-zinc-500">{member.phone || "Sin telefono"}</p>
        </Link>
      </td>
      <td className="px-5 py-4">
        <Link
          className="block space-y-2 rounded-2xl outline-none focus-visible:ring-2 focus-visible:ring-[#ff8bd8]"
          href={`/cuentas/${member.id}`}
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
                : `${Math.abs(days)} dias de atraso`}
          </p>
        </Link>
      </td>
    </tr>
  );
}
