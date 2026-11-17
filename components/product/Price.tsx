import { formatPrice } from "@/lib/format";
import { siteConfig } from "@/lib/site-config";
import type { Product } from "@/types/product";

interface PriceProps {
  product: Product;
  className?: string;
}

/**
 * Arayüzde fiyat gösteren TEK bileşen. siteConfig.showPrices kapalıyken ya da
 * ürünün fiyatı henüz girilmemişken (0) hiçbir şey basmaz.
 */
export function Price({ product, className }: PriceProps) {
  if (!siteConfig.showPrices || product.price <= 0) return null;

  return (
    <span className={className}>
      <span>{formatPrice(product.price, product.currency)}</span>
      {product.compareAtPrice ? (
        <s className="ml-3 text-muted">
          {formatPrice(product.compareAtPrice, product.currency)}
        </s>
      ) : null}
    </span>
  );
}
