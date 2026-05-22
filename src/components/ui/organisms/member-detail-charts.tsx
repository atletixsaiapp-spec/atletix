import type { AdminMemberDetail } from "@/lib/admin-member-detail";

export function WeightChart({
  entries,
}: {
  entries: AdminMemberDetail["progress"];
}) {
  const weights = entries
    .map((entry) => entry.weightKg)
    .filter((weight): weight is number => weight !== null);
  const min = weights.length ? Math.min(...weights) : 0;
  const max = weights.length ? Math.max(...weights) : 0;
  const range = Math.max(1, max - min);

  return (
    <div className="mt-6 flex h-56 items-end gap-3">
      {entries.length ? (
        entries.map((entry) => {
          const weight = entry.weightKg ?? min;
          const height = 44 + ((weight - min) / range) * 150;

          return (
            <div key={entry.id} className="flex min-w-0 flex-1 flex-col items-center gap-2">
              <div
                className="w-full rounded-t-xl bg-gradient-to-t from-[#ff2fa8] to-[#ff8bd8]"
                style={{ height: `${height}px` }}
              />
              <span className="font-mono text-xs text-zinc-500">
                {entry.weightKg ? `${entry.weightKg}` : "--"}
              </span>
            </div>
          );
        })
      ) : (
        <div className="flex h-full w-full items-center justify-center rounded-2xl border border-dashed border-white/10 text-sm text-zinc-500">
          Sin registros de peso todavia.
        </div>
      )}
    </div>
  );
}

export function AttendanceChart({
  entries,
}: {
  entries: AdminMemberDetail["attendanceChart"];
}) {
  const max = Math.max(1, ...entries.map((entry) => entry.count));

  return (
    <div className="mt-6 flex h-40 items-end gap-3">
      {entries.map((entry) => {
        const height = entry.count ? 28 + (entry.count / max) * 92 : 12;

        return (
          <div key={entry.label} className="flex min-w-0 flex-1 flex-col items-center gap-2">
            <div
              className="w-full rounded-t-xl bg-gradient-to-t from-emerald-400 to-[#ff8bd8]"
              style={{ height: `${height}px` }}
            />
            <span className="text-xs font-bold text-zinc-500">{entry.label}</span>
          </div>
        );
      })}
    </div>
  );
}
