import Link from "next/link";

export function NavLink({
  active,
  href,
  label,
  onClick,
  variant = "desktop",
}: {
  active: boolean;
  href: string;
  label: string;
  onClick?: () => void;
  variant?: "desktop" | "mobile";
}) {
  const baseClass =
    "font-bold transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#ff8bd8]";
  const desktopClass = `rounded-full px-3 py-2 text-sm ${
    active
      ? "bg-white text-black"
      : "text-zinc-400 hover:bg-white/10 hover:text-white"
  }`;
  const mobileClass = `flex items-center justify-between rounded-2xl border px-4 py-4 text-base ${
    active
      ? "border-white bg-white text-black"
      : "border-white/10 bg-white/[0.04] text-zinc-200 hover:border-[#ff2fa8]/50 hover:bg-[#ff2fa8]/10"
  }`;

  return (
    <Link
      href={href}
      onClick={onClick}
      className={`${baseClass} ${variant === "mobile" ? mobileClass : desktopClass}`}
    >
      {label}
    </Link>
  );
}
