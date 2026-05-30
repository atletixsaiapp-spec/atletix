"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Check, ChevronDown, Search } from "lucide-react";

type SearchableMemberOption = {
  email: string;
  groupName?: string;
  id: string;
  name: string;
  phone: string;
};

export function SearchableMemberSelect({
  emptyMessage = "No hay cuentas disponibles.",
  name,
  options,
}: {
  emptyMessage?: string;
  name: string;
  options: SearchableMemberOption[];
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<SearchableMemberOption | null>(null);
  const rootRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const normalizedQuery = normalizeQuery(query);
  const filteredOptions = useMemo(() => {
    if (!normalizedQuery) {
      return options.slice(0, 8);
    }

    return options
      .filter((option) =>
        normalizeQuery(
          `${option.name} ${option.email} ${option.phone} ${option.groupName ?? ""}`,
        ).includes(normalizedQuery),
      )
      .slice(0, 8);
  }, [normalizedQuery, options]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (!rootRef.current?.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);

    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (isOpen) {
      searchInputRef.current?.focus();
    }
  }, [isOpen]);

  function selectOption(option: SearchableMemberOption) {
    setSelected(option);
    setQuery("");
    setIsOpen(false);
  }

  return (
    <div ref={rootRef} className="relative">
      <input name={name} type="hidden" value={selected?.id ?? ""} />
      <button
        aria-expanded={isOpen}
        className="flex min-h-12 w-full items-center justify-between gap-3 rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-left text-sm font-semibold text-white outline-none transition hover:border-[#ff2fa8]/40 focus:border-[#ff2fa8]/60"
        onClick={() => setIsOpen((current) => !current)}
        type="button"
      >
        <span className="min-w-0">
          {selected ? (
            <>
              <span className="block truncate">{selected.name}</span>
              <span className="mt-0.5 block truncate text-xs text-zinc-500">
                {selected.email}
              </span>
            </>
          ) : (
            <span className="text-zinc-500">Busca y selecciona una cuenta</span>
          )}
        </span>
        <ChevronDown
          className={`shrink-0 text-zinc-500 transition ${
            isOpen ? "rotate-180" : ""
          }`}
          size={18}
        />
      </button>

      {isOpen ? (
        <div className="absolute left-0 right-0 top-[calc(100%+0.5rem)] z-20 overflow-hidden rounded-2xl border border-white/10 bg-[#121216] shadow-2xl">
          <label className="relative block border-b border-white/10">
            <Search
              aria-hidden="true"
              className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500"
              size={18}
            />
            <span className="sr-only">Buscar cuenta</span>
            <input
              ref={searchInputRef}
              className="min-h-12 w-full bg-transparent px-11 text-sm font-semibold text-white outline-none placeholder:text-zinc-600"
              onChange={(event) => setQuery(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Escape") {
                  setIsOpen(false);
                } else if (event.key === "Enter") {
                  event.preventDefault();

                  if (filteredOptions[0]) {
                    selectOption(filteredOptions[0]);
                  }
                }
              }}
              placeholder="Nombre, correo o telefono"
              type="search"
              value={query}
            />
          </label>

          <div className="max-h-72 overflow-y-auto p-2">
            {filteredOptions.length ? (
              filteredOptions.map((option) => (
                <button
                  className="flex w-full items-center justify-between gap-3 rounded-xl px-3 py-3 text-left transition hover:bg-white/[0.06] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#ff8bd8]"
                  key={option.id}
                  onClick={() => selectOption(option)}
                  type="button"
                >
                  <span className="min-w-0">
                    <span className="block truncate text-sm font-black text-white">
                      {option.name}
                    </span>
                    <span className="mt-1 block truncate text-xs font-semibold text-zinc-500">
                      {option.email}
                      {option.phone ? ` / ${option.phone}` : ""}
                    </span>
                    {option.groupName ? (
                      <span className="mt-1 block truncate text-xs font-semibold text-[#ff8bd8]">
                        {option.groupName}
                      </span>
                    ) : null}
                  </span>
                  {selected?.id === option.id ? (
                    <Check className="shrink-0 text-[#ff8bd8]" size={18} />
                  ) : null}
                </button>
              ))
            ) : (
              <p className="px-3 py-5 text-center text-sm font-semibold text-zinc-500">
                {normalizedQuery ? "Sin resultados." : emptyMessage}
              </p>
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
}

function normalizeQuery(value: string) {
  return value
    .trim()
    .toLocaleLowerCase("es-CO")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}
