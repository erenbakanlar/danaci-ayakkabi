import type { Metadata } from "next";
import { ProductGrid } from "@/components/product/ProductGrid";
import { StoreStory } from "@/components/home/StoreStory";
import { PageShell } from "@/components/ui/PageShell";
import { getProductsByCategory } from "@/lib/products";

export const metadata: Metadata = { title: "Kadın" };

export default async function WomenPage() {
  const products = await getProductsByCategory("kadin");

  return (
    <>
      <PageShell title="Kadın">
        <p className="-mt-4 mb-10 text-sm text-muted">{products.length} model</p>
        <ProductGrid products={products} priority />
      </PageShell>
      <StoreStory only={["topuklu-ve-canta"]} />
    </>
  );
}
