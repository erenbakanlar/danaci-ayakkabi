import Link from "next/link";
import { ProductGrid } from "@/components/product/ProductGrid";
import { Container } from "@/components/ui/Container";
import type { Product } from "@/types/product";

interface FeaturedProductsProps {
  products: Product[];
  /** Hero'daki "Modellerimizi İnceleyin" bu id'ye kaydırır */
  id?: string;
}

/** Ana sayfadaki "Öne Çıkanlar" ızgarası ve kategori bağlantıları. */
export function FeaturedProducts({ products, id }: FeaturedProductsProps) {
  if (products.length === 0) return null;

  return (
    <section
      id={id}
      aria-labelledby="featured-heading"
      className="scroll-mt-header lg:scroll-mt-header-lg"
    >
      <Container className="py-section lg:py-section-lg">
        <div className="mb-10 flex flex-wrap items-end justify-between gap-6 lg:mb-14">
          <div>
            <p className="text-xs uppercase tracking-label text-muted">
              Koleksiyon
            </p>
            <h2
              id="featured-heading"
              className="mt-3 text-3xl font-medium tracking-tight lg:text-4xl"
            >
              Öne Çıkanlar
            </h2>
          </div>
          <div className="flex gap-3">
            <Link
              href="/kadin"
              className="flex h-11 items-center border border-foreground px-5 text-xs uppercase tracking-label hover:bg-surface"
            >
              Kadın
            </Link>
            <Link
              href="/erkek"
              className="flex h-11 items-center border border-foreground px-5 text-xs uppercase tracking-label hover:bg-surface"
            >
              Erkek
            </Link>
          </div>
        </div>

        <ProductGrid products={products} />
      </Container>
    </section>
  );
}
