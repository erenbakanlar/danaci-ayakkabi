import { Suspense } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ProductForm, type ProductFormValue } from "@/app/yonetim/urun/ProductForm";
import { requireAdmin } from "@/lib/server/auth";
import { findProductById, listSubcategories, type AdminProduct } from "@/lib/server/catalog";

function toFormValue(product: AdminProduct): ProductFormValue {
  return {
    id: product.id,
    slug: product.slug,
    name: product.name,
    category: product.category,
    subcategory: product.subcategory,
    price: product.price,
    compareAtPrice: product.compareAtPrice,
    description: product.description,
    colors: product.colors,
    sizes: product.variants.filter((variant) => variant.stock > 0).map((variant) => variant.size),
    photos: product.photos,
    cutout: product.cutout,
    isFeatured: product.isFeatured,
    isNew: product.isNew,
    isActive: product.isActive,
    sort: product.sort,
  };
}

export default function EditProductPage({ params }: PageProps<"/yonetim/urun/[id]">) {
  return (
    <Suspense fallback={<p className="text-muted">Yükleniyor…</p>}>
      <EditProduct params={params} />
    </Suspense>
  );
}

async function EditProduct({ params }: Pick<PageProps<"/yonetim/urun/[id]">, "params">) {
  await requireAdmin();
  const { id } = await params;
  const product = findProductById(id);
  if (!product) notFound();

  return (
    <>
      <Link href="/yonetim" className="text-sm text-muted hover:text-foreground">
        ← Ürünler
      </Link>
      <h1 className="mb-6 mt-2 text-2xl font-medium tracking-tight">{product.name}</h1>
      <ProductForm product={toFormValue(product)} subcategories={listSubcategories()} />
    </>
  );
}
