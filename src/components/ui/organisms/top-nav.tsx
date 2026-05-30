"use client";

import { useState } from "react";
import { LogOut } from "lucide-react";
import { signOut } from "@/app/auth/actions";
import { BrandLogo } from "@/components/ui/atoms/brand-logo";
import { NavLink } from "@/components/ui/atoms/nav-link";
import { PendingSubmitButton } from "@/components/ui/atoms/pending-submit-button";
import { Menu, X } from "@/components/ui/icons/nav-icons";

type TopNavActive = "member" | "admin" | "demo" | "login" | "waitlist";
type TopNavMode = "public" | "member" | "admin";

const publicNavItems: { href: string; key: TopNavActive; label: string }[] = [
  { href: "/login", key: "login", label: "Acceso" },
  { href: "/lista-espera", key: "waitlist", label: "Lista de espera" },
  { href: "/admin/login", key: "admin", label: "Admin" },
];

export function TopNav({
  active,
  mode = "public",
}: {
  active: TopNavActive;
  mode?: TopNavMode;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const isPrivate = mode === "member" || mode === "admin";
  const navItems = isPrivate
    ? []
    : publicNavItems.filter((item) => item.key !== active);

  return (
    <header className="sticky top-0 z-30 border-b border-white/10 bg-[#07070a]/82 backdrop-blur-xl">
      <div className="mx-auto flex w-full max-w-7xl items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
        <BrandLogo />

        <div className="hidden items-center gap-2 md:flex">
          {navItems.length ? (
            <nav className="flex items-center gap-2" aria-label="Principal">
              {navItems.map((item) => (
                <NavLink
                  key={item.key}
                  href={item.href}
                  label={item.label}
                  active={active === item.key}
                />
              ))}
            </nav>
          ) : null}
          {isPrivate ? <LogoutForm destination={mode} /> : null}
        </div>

        <button
          type="button"
          aria-label={isOpen ? "Cerrar menu" : "Abrir menu"}
          aria-expanded={isOpen}
          aria-controls="mobile-navigation"
          onClick={() => setIsOpen((current) => !current)}
          className="inline-grid size-11 place-items-center rounded-2xl border border-white/10 bg-white/[0.04] text-white transition hover:border-[#ff2fa8]/50 hover:bg-[#ff2fa8]/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#ff8bd8] md:hidden"
        >
          {isOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {isOpen ? (
        <div className="fixed inset-0 top-[76px] z-40 md:hidden">
          <button
            type="button"
            aria-label="Cerrar menu"
            className="absolute inset-0 h-full w-full bg-black/70 backdrop-blur-sm"
            onClick={() => setIsOpen(false)}
          />
          <aside
            id="mobile-navigation"
            className="absolute right-3 top-3 w-[min(22rem,calc(100vw-1.5rem))] rounded-3xl border border-white/10 bg-[#09090d] p-4 shadow-2xl shadow-black/60"
          >
            <div className="mb-4 flex items-center justify-between gap-3">
              <p className="text-xs font-black uppercase tracking-[0.18em] text-zinc-500">
                Menú
              </p>
              <button
                type="button"
                aria-label="Cerrar menu"
                onClick={() => setIsOpen(false)}
                className="inline-grid size-10 place-items-center rounded-2xl bg-white/[0.06] text-zinc-200 transition hover:bg-white/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#ff8bd8]"
              >
                <X size={20} />
              </button>
            </div>

            <nav className="grid gap-3" aria-label="Principal movil">
              {navItems.map((item) => (
                <NavLink
                  key={item.key}
                  href={item.href}
                  label={item.label}
                  active={active === item.key}
                  onClick={() => setIsOpen(false)}
                  variant="mobile"
                />
              ))}
              {isPrivate ? <LogoutForm destination={mode} mobile /> : null}
            </nav>
          </aside>
        </div>
      ) : null}
    </header>
  );
}

function LogoutForm({
  destination,
  mobile = false,
}: {
  destination: "member" | "admin";
  mobile?: boolean;
}) {
  return (
    <form action={signOut}>
      <input type="hidden" name="destination" value={destination} />
      <PendingSubmitButton
        className={
          mobile
            ? "inline-flex w-full items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 font-black text-white transition hover:border-[#ff2fa8]/50 hover:bg-[#ff2fa8]/10"
            : "inline-flex items-center justify-center gap-2 rounded-full border border-white/10 bg-white px-5 py-3 font-black text-black transition hover:bg-[#ff2fa8] hover:text-white"
        }
        pendingLabel="Cerrando..."
      >
        <LogOut size={18} />
        Cerrar sesión
      </PendingSubmitButton>
    </form>
  );
}
