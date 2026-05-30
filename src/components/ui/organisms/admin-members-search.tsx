"use client";

import { useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, Search } from "lucide-react";
import { AdminMembersTable } from "@/components/ui/organisms/admin-members-table";
import type { AdminDashboardMember } from "@/lib/admin-data";
import { getStatusLabel } from "@/lib/atletix-data";

const pageSize = 10;

export function AdminMembersSearch({
  members,
}: {
  members: AdminDashboardMember[];
}) {
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const filteredMembers = useMemo(() => {
    const normalizedQuery = normalizeSearchValue(query);

    if (!normalizedQuery) {
      return members;
    }

    return members.filter((member) =>
      getSearchText(member).includes(normalizedQuery),
    );
  }, [members, query]);
  const pageCount = Math.max(1, Math.ceil(filteredMembers.length / pageSize));
  const currentPage = Math.min(page, pageCount);
  const paginatedMembers = filteredMembers.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize,
  );
  const firstItem = filteredMembers.length
    ? (currentPage - 1) * pageSize + 1
    : 0;
  const lastItem = Math.min(currentPage * pageSize, filteredMembers.length);

  const countLabel = query
    ? `${filteredMembers.length} de ${members.length} cuentas`
    : `${members.length} cuentas`;

  function updateQuery(value: string) {
    setQuery(value);
    setPage(1);
  }

  return (
    <>
      <div className="flex flex-col gap-4 border-b border-white/10 p-5 lg:flex-row lg:items-center lg:justify-between sm:p-6">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-zinc-500">
            Lista completa
          </p>
          <h2 className="mt-1 text-2xl font-black text-white">{countLabel}</h2>
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
            onChange={(event) => updateQuery(event.target.value)}
            placeholder="Buscar por nombre, correo o telefono"
            type="search"
            value={query}
          />
        </label>
      </div>

      <AdminMembersTable
        emptyMessage={
          query ? "No encontramos cuentas con esa busqueda." : undefined
        }
        members={paginatedMembers}
      />

      <div className="flex flex-col gap-4 border-t border-white/10 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
        <p className="text-sm font-semibold text-zinc-500">
          Mostrando {firstItem}-{lastItem} de {filteredMembers.length}
        </p>

        <div className="flex items-center justify-between gap-3 sm:justify-end">
          <button
            className="inline-flex min-h-11 flex-1 items-center justify-center gap-2 rounded-full border border-white/10 px-4 text-sm font-black text-zinc-200 transition hover:border-[#ff2fa8]/45 hover:text-white disabled:cursor-not-allowed disabled:opacity-40 sm:flex-none"
            disabled={currentPage <= 1}
            onClick={() => setPage((current) => Math.max(1, current - 1))}
            type="button"
          >
            <ChevronLeft size={17} />
            Anterior
          </button>

          <span className="shrink-0 text-sm font-black text-white">
            {currentPage}/{pageCount}
          </span>

          <button
            className="inline-flex min-h-11 flex-1 items-center justify-center gap-2 rounded-full border border-white/10 px-4 text-sm font-black text-zinc-200 transition hover:border-[#ff2fa8]/45 hover:text-white disabled:cursor-not-allowed disabled:opacity-40 sm:flex-none"
            disabled={currentPage >= pageCount}
            onClick={() =>
              setPage((current) => Math.min(pageCount, current + 1))
            }
            type="button"
          >
            Siguiente
            <ChevronRight size={17} />
          </button>
        </div>
      </div>
    </>
  );
}

function getSearchText(member: AdminDashboardMember) {
  return normalizeSearchValue(
    [
      member.name,
      member.email,
      member.phone,
      member.goal,
      member.routineName,
      member.routineDay,
      member.status,
      getStatusLabel(member.status),
    ].join(" "),
  );
}

function normalizeSearchValue(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}
