"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState, useTransition } from "react";
import { ChevronLeft, ChevronRight, Search } from "lucide-react";
import { AdminMembersTable } from "@/components/ui/organisms/admin-members-table";
import type { AdminDashboardMember } from "@/lib/admin-data";

export function AdminMembersSearch({
  members,
  page,
  pageCount,
  pageSize,
  query,
  totalMembers,
}: {
  members: AdminDashboardMember[];
  page: number;
  pageCount: number;
  pageSize: number;
  query: string;
  totalMembers: number;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [searchState, setSearchState] = useState({
    query,
    value: query,
  });
  const search = searchState.query === query ? searchState.value : query;
  const firstItem = totalMembers ? (page - 1) * pageSize + 1 : 0;
  const lastItem = Math.min(page * pageSize, totalMembers);
  const countLabel = query
    ? `${totalMembers} resultados`
    : `${totalMembers} cuentas`;

  useEffect(() => {
    const normalizedSearch = normalizeSearchInput(search);

    if (normalizedSearch === query) {
      return;
    }

    const timeout = window.setTimeout(() => {
      startTransition(() => {
        router.replace(getListHref(pathname, normalizedSearch, 1), {
          scroll: false,
        });
      });
    }, 400);

    return () => window.clearTimeout(timeout);
  }, [pathname, query, router, search]);

  return (
    <>
      <div className="flex flex-col gap-4 border-b border-white/10 p-5 sm:p-6 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-zinc-500">
            Lista completa
          </p>
          <h2 className="mt-1 text-2xl font-black text-white">{countLabel}</h2>
          {isPending ? (
            <p className="mt-1 text-sm font-semibold text-[#ff8bd8]">
              Buscando...
            </p>
          ) : null}
        </div>

        <label className="relative block w-full lg:max-w-md">
          <Search
            aria-hidden="true"
            className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500"
            size={18}
          />
          <span className="sr-only">Buscar cuentas</span>
          <input
            className="min-h-12 w-full rounded-full border border-white/10 bg-white/[0.04] px-12 text-sm font-semibold text-white outline-none transition placeholder:text-zinc-600 focus:border-[#ff2fa8]/60 focus:bg-black/30"
            onChange={(event) =>
              setSearchState({
                query,
                value: event.target.value,
              })
            }
            placeholder="Buscar por nombre, correo o telefono"
            type="search"
            value={search}
          />
        </label>
      </div>

      <AdminMembersTable
        emptyMessage={
          query ? "No encontramos cuentas con esa busqueda." : undefined
        }
        members={members}
      />

      <div className="flex flex-col gap-4 border-t border-white/10 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
        <p className="text-sm font-semibold text-zinc-500">
          Mostrando {firstItem}-{lastItem} de {totalMembers}
        </p>

        <div className="flex items-center justify-between gap-3 sm:justify-end">
          {page <= 1 ? (
            <PaginationButton disabled label="Anterior" side="left" />
          ) : (
            <PaginationLink
              href={getListHref(pathname, query, page - 1)}
              label="Anterior"
              side="left"
            />
          )}

          <span className="shrink-0 text-sm font-black text-white">
            {page}/{pageCount}
          </span>

          {page >= pageCount ? (
            <PaginationButton disabled label="Siguiente" side="right" />
          ) : (
            <PaginationLink
              href={getListHref(pathname, query, page + 1)}
              label="Siguiente"
              side="right"
            />
          )}
        </div>
      </div>
    </>
  );
}

function PaginationLink({
  href,
  label,
  side,
}: {
  href: string;
  label: string;
  side: "left" | "right";
}) {
  return (
    <Link
      className="inline-flex min-h-11 flex-1 items-center justify-center gap-2 rounded-full border border-white/10 px-4 text-sm font-black text-zinc-200 transition hover:border-[#ff2fa8]/45 hover:text-white sm:flex-none"
      href={href}
      scroll={false}
    >
      {side === "left" ? <ChevronLeft size={17} /> : null}
      {label}
      {side === "right" ? <ChevronRight size={17} /> : null}
    </Link>
  );
}

function PaginationButton({
  disabled,
  label,
  side,
}: {
  disabled: boolean;
  label: string;
  side: "left" | "right";
}) {
  return (
    <button
      className="inline-flex min-h-11 flex-1 items-center justify-center gap-2 rounded-full border border-white/10 px-4 text-sm font-black text-zinc-200 transition disabled:cursor-not-allowed disabled:opacity-40 sm:flex-none"
      disabled={disabled}
      type="button"
    >
      {side === "left" ? <ChevronLeft size={17} /> : null}
      {label}
      {side === "right" ? <ChevronRight size={17} /> : null}
    </button>
  );
}

function getListHref(pathname: string, query: string, page: number) {
  const params = new URLSearchParams();
  const normalizedQuery = normalizeSearchInput(query);

  if (normalizedQuery) {
    params.set("q", normalizedQuery);
  }

  if (page > 1) {
    params.set("page", String(page));
  }

  const serializedParams = params.toString();

  return serializedParams ? `${pathname}?${serializedParams}` : pathname;
}

function normalizeSearchInput(value: string) {
  return value.trim().replace(/\s+/g, " ");
}
