"use client";

import { useActionState, useMemo, useState, useTransition } from "react";
import Link from "next/link";
import { savePrices, type FormState } from "@/app/yonetim/actions";

export interface ProductTableRow {
  id: string;
  slug: string;
  name: string;
  colors: string[];
  category: "kadin" | "erkek";
  subcategory: string;
  price: number;
  cardImage: string;
  hasPhoto: boolean;
  isActive: boolean;
  isFeatured: boolean;
}

const FILTERS = [
  { id: "all", label: "Tümü" },
  { id: "kadin", label: "Kadın" },
  { id: "erkek", label: "Erkek" },
  { id: "noprice", label: "Fiyatsız" },
  { id: "hidden", label: "Yayında değil" },
] as const;
type FilterId = (typeof FILTERS)[number]["id"];

/** 2450.5 → "2450,5"; 0 → "" */
function priceText(price: number): string {
  return price > 0 ? String(price).replace(".", ",") : "";
}

function matches(row: ProductTableRow, filter: FilterId, query: string): boolean {
  if (filter === "kadin" || filter === "erkek") {
    if (row.category !== filter) return false;
  }
  if (filter === "noprice" && row.price > 0) return false;
  if (filter === "hidden" && row.isActive) return false;
  if (!query) return true;
  const haystack = `${row.name} ${row.colors.join(" ")} ${row.subcategory}`.toLocaleLowerCase("tr");
  return query
    .toLocaleLowerCase("tr")
    .split(/\s+/)
    .every((word) => haystack.includes(word));
}

/**
 * Ürün listesi. Fiyatlar doğrudan listede düzenlenir; değişenler alttaki
 * "Fiyatları kaydet" ile tek seferde kaydedilir.
 */
export function ProductTable({ rows }: { rows: ProductTableRow[] }) {
  const [state, action, pending] = useActionState<FormState, FormData>(savePrices, {});
  const [, startTransition] = useTransition();
  const [filter, setFilter] = useState<FilterId>("all");
  const [query, setQuery] = useState("");
  const [edited, setEdited] = useState<Record<string, string>>({});

  const visible = useMemo(
    () => new Set(rows.filter((row) => matches(row, filter, query.trim())).map((row) => row.id)),
    [rows, filter, query],
  );
  const changed = Object.entries(edited).filter(
    ([id, value]) => value !== priceText(rows.find((row) => row.id === id)?.price ?? 0),
  ).length;

  return (
    <form
      // JavaScript yüklenmeden gönderilirse yine sunucu işlemine gider.
      action={action}
      className="mt-8"
      onSubmit={(event) => {
        // Yüklendikten sonra: React, action ile gönderilen formu işlem bitince sıfırlar; hata
        // mesajında kullanıcının yazdıkları kaybolmasın diye elle gönderilir.
        event.preventDefault();
        const data = new FormData(event.currentTarget);
        startTransition(() => action(data));
      }}
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap gap-2">
          {FILTERS.map((item) => (
            <button
              key={item.id}
              type="button"
              aria-pressed={filter === item.id}
              onClick={() => setFilter(item.id)}
              className="h-9 cursor-pointer rounded-full border border-border bg-background px-4 text-sm aria-pressed:border-foreground aria-pressed:bg-foreground aria-pressed:text-background"
            >
              {item.label}
            </button>
          ))}
        </div>
        <input
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Model veya renk ara…"
          className="h-10 w-full border border-border bg-background px-3 text-sm outline-none focus:border-foreground sm:w-64"
        />
      </div>

      <ul className="mt-4 divide-y divide-border border border-border bg-background">
        {rows.map((row) => (
          <li
            key={row.id}
            hidden={!visible.has(row.id)}
            className="grid grid-cols-[56px_1fr] items-center gap-x-4 gap-y-3 p-3 sm:grid-cols-[56px_1fr_150px_auto]"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={row.cardImage}
              alt=""
              loading="lazy"
              className="h-[70px] w-14 bg-surface object-cover"
            />
            <div className="min-w-0">
              <p className="truncate font-medium">{row.name}</p>
              <p className="truncate text-sm text-muted">
                {row.category === "kadin" ? "Kadın" : "Erkek"} · {row.subcategory}
                {row.colors.length > 0 ? ` · ${row.colors.join(", ")}` : ""}
              </p>
              <p className="mt-1 flex flex-wrap gap-1.5 text-xs">
                {!row.isActive ? (
                  <span className="rounded bg-foreground/10 px-1.5 py-0.5">Yayında değil</span>
                ) : null}
                {row.isFeatured ? (
                  <span className="rounded bg-khaki/15 px-1.5 py-0.5">Öne çıkan</span>
                ) : null}
                {!row.hasPhoto ? (
                  <span className="rounded bg-amber-100 px-1.5 py-0.5 text-amber-900">Fotoğraf yok</span>
                ) : null}
              </p>
            </div>

            <label className="col-start-2 flex items-center gap-2 sm:col-start-auto">
              <span className="sr-only">{row.name} fiyatı</span>
              <input type="hidden" name={`original:${row.id}`} value={priceText(row.price)} />
              <input
                name={`price:${row.id}`}
                inputMode="decimal"
                placeholder="Fiyat"
                defaultValue={priceText(row.price)}
                onChange={(event) =>
                  setEdited((current) => ({ ...current, [row.id]: event.target.value }))
                }
                className="h-10 w-full border border-border bg-background px-3 text-right tabular-nums outline-none focus:border-foreground"
              />
              <span className="text-sm text-muted">₺</span>
            </label>

            <div className="col-start-2 flex gap-2 sm:col-start-auto">
              <Link
                href={`/yonetim/urun/${row.id}`}
                className="flex h-10 items-center border border-foreground px-4 text-sm hover:bg-surface"
              >
                Düzenle
              </Link>
            </div>
          </li>
        ))}
      </ul>

      {visible.size === 0 ? (
        <p className="mt-6 text-center text-sm text-muted">Bu filtreye uyan ürün yok.</p>
      ) : null}

      {/* Değişiklik varken ekranın altında sabit kaydet çubuğu */}
      <div
        className={`sticky bottom-0 mt-4 flex items-center justify-between gap-4 border border-border bg-background p-3 shadow-lg ${
          changed > 0 || state.error ? "" : "hidden"
        }`}
      >
        <p className="text-sm">
          {state.error ? (
            <span className="font-medium text-red-700">{state.error}</span>
          ) : (
            <>{changed} fiyat değişti</>
          )}
        </p>
        <button
          type="submit"
          disabled={pending}
          className="h-11 cursor-pointer bg-accent px-5 text-sm font-medium text-white hover:bg-accent-soft disabled:opacity-60"
        >
          {pending ? "Kaydediliyor…" : "Fiyatları kaydet"}
        </button>
      </div>
    </form>
  );
}
