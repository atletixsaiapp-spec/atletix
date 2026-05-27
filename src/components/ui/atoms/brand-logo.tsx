import Link from "next/link";

export function BrandLogo() {
  return (
    <Link href="/login" className="flex min-w-0 items-center gap-3">
      <div className="grid size-11 shrink-0 place-items-center rounded-2xl bg-[#ff2fa8] font-black text-white shadow-[0_0_30px_rgba(255,47,168,0.45)]">
        A
      </div>
      <div className="min-w-0">
        <p className="text-base font-black tracking-normal text-white sm:text-lg">
          ATLETIX
        </p>
        <p className="text-[0.65rem] font-semibold uppercase tracking-[0.18em] text-zinc-500 max-[380px]:hidden">
          Fuerza sin límites
        </p>
      </div>
    </Link>
  );
}
