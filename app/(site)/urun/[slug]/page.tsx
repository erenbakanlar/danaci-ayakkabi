import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { Price } from "@/components/product/Price";
import { ProductGallery } from "@/components/product/ProductGallery";
import { PurchaseAction } from "@/components/product/PurchaseAction";
import { Container } from "@/components/ui/Container";
import { getProductBySlug, getProducts } from "@/lib/products";

const CATEGORY_LABEL = { kadin: "Kadın", erkek: "Erkek" } as const;

export async function generateStaticParams() {
  const products = await getProducts();
  return products.map((product) => ({ slug: product.slug }));
}

export async function generateMetadata({
  params,
}: PageProps<"/urun/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) return {};

  // openGraph görseli, ürün linki WhatsApp'ta paylaşıldığında çıkan
  // önizleme kartındaki fotoğraftır.
  return {
    title: product.name,
    description: product.description,
    openGraph: {
      type: "website",
      title: `${product.brand} ${product.name}`,
      description: product.description,
      url: `/urun/${product.slug}`,
      images: [{ url: product.cardImage, width: 800, height: 1000, alt: product.name }],
    },
  };
}

export default function ProductPage({ params }: PageProps<"/urun/[slug]">) {
  return (
    <Container className="py-10 lg:py-section">
      {/* Önceden üretilmemiş slug'larda sayfa kabuğu anında gelir, detay akar. */}
      <Suspense fallback={<div className="min-h-[60vh]" aria-busy="true" />}>
        {params.then(({ slug }) => (
          <ProductDetail slug={slug} />
        ))}
      </Suspense>
    </Container>
  );
}

async function ProductDetail({ slug }: { slug: string }) {
  const product = await getProductBySlug(slug);
  if (!product) notFound();

  return (
    <div className="grid gap-10 lg:grid-cols-2 lg:gap-16">
      <ProductGallery
        images={product.images}
        alt={`${product.name} — ${product.colors.join(", ")}`}
      />

      <div className="lg:sticky lg:top-32 lg:self-start">
        <p className="text-xs uppercase tracking-label text-muted">
          {CATEGORY_LABEL[product.category]} · {product.subcategory}
        </p>
        <h1 className="mt-3 text-3xl font-medium tracking-tight lg:text-4xl">
          {product.name}
        </h1>
        <Price product={product} className="mt-4 block text-lg" />
        <p className="mt-6 max-w-md leading-relaxed text-muted">
          {product.description}
        </p>

        <div className="mt-10 max-w-md">
          <PurchaseAction product={product} />
        </div>
      </div>
    </div>
  );
}
