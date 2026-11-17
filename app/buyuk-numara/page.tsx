import type { Metadata } from "next";
import { ProductGrid } from "@/components/product/ProductGrid";
import { StoreStory } from "@/components/home/StoreStory";
import { PageShell } from "@/components/ui/PageShell";
import { getLargeSizeProducts, getLargeSizes } from "@/lib/products";
import { siteConfig } from "@/lib/site-config";
import { buildWhatsAppUrl } from "@/lib/whatsapp";

const from = siteConfig.largeSizeFrom;

export const metadata: Metadata = {
  title: "Büyük Numara",
  description: `${from} numara ve üzeri ayakkabı modellerimiz.`,
};

export default async function LargeSizesPage() {
  const products = await getLargeSizeProducts();

  return (
    <>
      <PageShell title="Büyük Numara">
        <p className="-mt-4 max-w-xl text-lg leading-relaxed text-muted">
          {from} numara ve üzeri modellerimiz. Aradığınız numarayı listede
          göremezseniz bize yazın, sizin için bakalım.
        </p>

        <div className="mt-10">
          {products.length > 0 ? (
            <ProductGrid
              products={products}
              note={(product) => `Numara ${getLargeSizes(product).join(" · ")}`}
            />
          ) : (
            <p className="border-y border-border py-6 text-muted">
              Şu an listelenen büyük numara modelimiz yok.
            </p>
          )}
        </div>

        <a
          href={buildWhatsAppUrl(
            `Merhaba, ${from} numara ve üzeri modelleriniz hakkında bilgi almak istiyorum.`,
          )}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-10 inline-flex h-12 items-center justify-center bg-accent px-6 text-xs uppercase tracking-label text-white hover:bg-accent-soft"
        >
          Numaranızı Sorun
        </a>
      </PageShell>
      <StoreStory only={["bot-ve-gunluk"]} />
    </>
  );
}
