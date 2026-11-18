import { Suspense } from "react";
import Link from "next/link";
import { ProductForm } from "@/app/yonetim/urun/ProductForm";
import { requireAdmin } from "@/lib/server/auth";
import { listSubcategories } from "@/lib/server/catalog";

export default function NewProductPage() {
  return (
    <Suspense fallback={<p className="text-muted">Yükleniyor…</p>}>
      <NewProduct />
    </Suspense>
  );
}

async function NewProduct() {
  await requireAdmin();

  return (
    <>
      <Link href="/yonetim" className="text-sm text-muted hover:text-foreground">
        ← Ürünler
      </Link>
      <h1 className="mb-6 mt-2 text-2xl font-medium tracking-tight">Yeni ürün</h1>
      <ProductForm subcategories={listSubcategories()} />
    </>
  );
}
