import { Suspense } from "react";
import Link from "next/link";
import { ProductTable, type ProductTableRow } from "@/app/yonetim/ProductTable";
import { requireAdmin } from "@/lib/server/auth";
import { listAllProducts } from "@/lib/server/catalog";

export default function AdminHomePage({ searchParams }: PageProps<"/yonetim">) {
  return (
    <Suspense fallback={<p className="text-muted">Yükleniyor…</p>}>
      <AdminHome searchParams={searchParams} />
    </Suspense>
  );
}

async function AdminHome({ searchParams }: Pick<PageProps<"/yonetim">, "searchParams">) {
  await requireAdmin();
  const { mesaj } = await searchParams;

  const rows: ProductTableRow[] = listAllProducts().map((product) => ({
    id: product.id,
    slug: product.slug,
    name: product.name,
    colors: product.colors,
    category: product.category,
    subcategory: product.subcategory,
    price: product.price,
    cardImage: product.cardImage,
    hasPhoto: product.photos.length > 0,
    isActive: product.isActive,
    isFeatured: product.isFeatured,
  }));
  const withoutPrice = rows.filter((row) => row.isActive && row.price <= 0).length;

  return (
    <>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-medium tracking-tight lg:text-3xl">Ürünler</h1>
          <p className="mt-1 text-sm text-muted">
            {rows.length} model · {rows.filter((row) => row.isActive).length} yayında
          </p>
        </div>
        <Link
          href="/yonetim/urun/yeni"
          className="flex h-11 items-center bg-accent px-5 text-sm font-medium text-white hover:bg-accent-soft"
        >
          + Yeni ürün
        </Link>
      </div>

      {typeof mesaj === "string" ? (
        <p role="status" className="mt-6 border border-green-700/30 bg-green-50 px-4 py-3 text-sm text-green-900">
          {mesaj}
        </p>
      ) : null}

      {withoutPrice > 0 ? (
        <p className="mt-6 border border-amber-600/30 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          Yayındaki {withoutPrice} ürünün fiyatı girilmemiş; bu ürünlerde sitede fiyat görünmez.
          Fiyatları aşağıdan doğrudan yazıp <strong>Fiyatları kaydet</strong>&apos;e basabilirsiniz.
        </p>
      ) : null}

      <ProductTable rows={rows} />
    </>
  );
}
