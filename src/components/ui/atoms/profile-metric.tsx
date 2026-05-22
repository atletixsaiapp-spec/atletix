import type { ReactNode } from "react";

export function ProfileMetric({
  detail,
  icon,
  label,
  value,
}: {
  detail?: string;
  icon: ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.035] p-4">
      <div className="text-[#ff8bd8]">{icon}</div>
      <p className="mt-3 text-xs font-black uppercase tracking-[0.16em] text-zinc-500">
        {label}
      </p>
      <p className="metric-number mt-1 text-lg font-black text-white">{value}</p>
      {detail ? <p className="mt-1 text-xs text-zinc-500">{detail}</p> : null}
    </div>
  );
}
