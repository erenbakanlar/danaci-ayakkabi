import type { Metadata } from "next";
import { ProductGrid } from "@/components/product/ProductGrid";
import { StoreStory } from "@/components/home/StoreStory";
import { PageShell } from "@/components/ui/PageShell";
import { getProductsByCategory } from "@/lib/products";

export const metadata: Metadata = { title: "Erkek" };

export default async function MenPage() {
  const products = await getProductsByCategory("erkek");

  return (
    <>
      <PageShell title="Erkek">
        <p className="-mt-4 mb-10 text-sm text-muted">{products.length} model</p>
        <ProductGrid products={products} priority />
      </PageShell>
      <StoreStory only={["bot-ve-gunluk"]} />
    </>
  );
}
