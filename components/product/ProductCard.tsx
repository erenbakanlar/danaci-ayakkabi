import Image from "next/image";
import Link from "next/link";
import { Price } from "@/components/product/Price";
import type { Product } from "@/types/product";

interface ProductCardProps {
  product: Product;
  /** Renklerin altında gösterilecek kısa not (ör. mevcut büyük numaralar) */
  note?: string;
  /** Sayfanın üst kısmındaki ilk kartlar için görseli öncelikli yükler */
  priority?: boolean;
}

export function ProductCard({ product, note, priority = false }: ProductCardProps) {
  return (
    <Link href={`/urun/${product.slug}`} className="group block">
      <div className="relative aspect-[4/5] overflow-hidden bg-surface">
        <Image
          src={product.cardImage}
          alt={`${product.name} — ${product.colors.join(", ")}`}
          fill
          sizes="(min-width: 1024px) 25vw, (min-width: 768px) 33vw, 50vw"
          loading={priority ? "eager" : undefined}
          fetchPriority={priority ? "high" : undefined}
          className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.04]"
        />
      </div>
      <h3 className="mt-3 text-sm leading-snug underline-offset-4 decoration-accent-soft group-hover:underline lg:text-base">
        {product.name}
      </h3>
      {product.colors.length > 0 ? (
        <p className="mt-1 text-xs text-muted lg:text-sm">
          {product.colors.join(" · ")}
        </p>
      ) : null}
      {note ? <p className="mt-1 text-xs text-muted lg:text-sm">{note}</p> : null}
      <Price product={product} className="mt-1 block text-sm" />
    </Link>
  );
}
