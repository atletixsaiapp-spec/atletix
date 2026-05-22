import type { MembershipStatus } from "@/lib/atletix-data";
import { getStatusLabel } from "@/lib/atletix-data";

export function StatusBadge({ status }: { status: MembershipStatus }) {
  const styles: Record<MembershipStatus, string> = {
    active: "border-emerald-300/30 bg-emerald-400/10 text-emerald-200",
    expiring: "border-amber-300/30 bg-amber-400/10 text-amber-200",
    expired: "border-red-300/30 bg-red-400/10 text-red-200",
  };

  return (
    <span
      className={`rounded-full border px-3 py-1 text-xs font-black uppercase tracking-[0.16em] ${styles[status]}`}
    >
      {getStatusLabel(status)}
    </span>
  );
}
