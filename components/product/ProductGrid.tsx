import { ProductCard } from "@/components/product/ProductCard";
import type { Product } from "@/types/product";

interface ProductGridProps {
  products: Product[];
  /** Kartın altında gösterilecek kısa not (ör. mevcut numaralar) */
  note?: (product: Product) => string | undefined;
  /** İlk satırdaki görselleri öncelikli yükle (sayfanın en üstündeki ızgara için) */
  priority?: boolean;
}

export function ProductGrid({ products, note, priority = false }: ProductGridProps) {
  return (
    <ul className="grid grid-cols-2 gap-x-4 gap-y-10 md:grid-cols-3 lg:grid-cols-4 lg:gap-x-6 lg:gap-y-14">
      {products.map((product, index) => (
        <li key={product.id}>
          <ProductCard
            product={product}
            note={note?.(product)}
            priority={priority && index < 4}
          />
        </li>
      ))}
    </ul>
  );
}
