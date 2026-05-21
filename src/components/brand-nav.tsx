import Link from "next/link";
import type { MembershipStatus } from "@/lib/atletix-data";
import { getStatusLabel } from "@/lib/atletix-data";

export function TopNav({
  active,
}: {
  active: "clienta" | "admin" | "login";
}) {
  return (
    <header className="sticky top-0 z-30 border-b border-white/10 bg-[#07070a]/82 backdrop-blur-xl">
      <div className="mx-auto flex w-full max-w-7xl items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-3">
          <div className="grid size-11 place-items-center rounded-2xl bg-[#ff2fa8] font-black text-white shadow-[0_0_30px_rgba(255,47,168,0.45)]">
            A
          </div>
          <div>
            <p className="text-lg font-black tracking-normal text-white">ATLETIX</p>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-zinc-500">
              Strong Women Only
            </p>
          </div>
        </Link>

        <nav className="flex items-center gap-2">
          <NavLink href="/" label="Clienta" active={active === "clienta"} />
          <NavLink href="/admin" label="Admin" active={active === "admin"} />
          <NavLink href="/login" label="Login" active={active === "login"} />
        </nav>
      </div>
    </header>
  );
}

function NavLink({
  href,
  label,
  active,
}: {
  href: string;
  label: string;
  active: boolean;
}) {
  return (
    <Link
      href={href}
      className={`rounded-full px-3 py-2 text-sm font-bold transition ${
        active
          ? "bg-white text-black"
          : "text-zinc-400 hover:bg-white/10 hover:text-white"
      }`}
    >
      {label}
    </Link>
  );
}

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
