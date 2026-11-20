import { formatPrice } from "@/lib/format";
import { siteConfig } from "@/lib/site-config";
import type { Product } from "@/types/product";

interface PriceProps {
  product: Product;
  className?: string;
}

/** İndirim yüzdesi (ör. 2990 → 2450 = 18). İndirim yoksa null. */
export function discountPercent(product: Product): number | null {
  const normal = product.compareAtPrice;
  if (!normal || product.price <= 0 || normal <= product.price) return null;
  return Math.max(1, Math.round((1 - product.price / normal) * 100));
}

/**
 * Arayüzde fiyat gösteren TEK bileşen. siteConfig.showPrices kapalıyken ya da
 * ürünün fiyatı henüz girilmemişken (0) hiçbir şey basmaz. İndirimli üründe
 * normal fiyat üstü çizili, yanında indirimli fiyat.
 */
export function Price({ product, className }: PriceProps) {
  if (!siteConfig.showPrices || product.price <= 0) return null;
  const onSale = discountPercent(product) !== null;

  return (
    <span className={className}>
      {onSale ? (
        <s className="mr-2.5 text-muted">
          <span className="sr-only">Normal fiyat: </span>
          {formatPrice(product.compareAtPrice!, product.currency)}
        </s>
      ) : null}
      <span className={onSale ? "font-semibold text-red-700" : undefined}>
        {onSale ? <span className="sr-only">İndirimli fiyat: </span> : null}
        {formatPrice(product.price, product.currency)}
      </span>
    </span>
  );
}

interface DiscountBadgeProps {
  product: Product;
  size?: "md" | "lg";
  className?: string;
}

/** Görselin sol üst köşesindeki kırmızı çerçeveli indirim yüzdesi rozeti */
export function DiscountBadge({ product, size = "md", className = "" }: DiscountBadgeProps) {
  if (!siteConfig.showPrices) return null;
  const percent = discountPercent(product);
  if (percent === null) return null;

  const box =
    size === "lg"
      ? "h-[76px] w-[76px] text-2xl lg:h-[88px] lg:w-[88px] lg:text-[28px]"
      : "h-[52px] w-[52px] text-base lg:h-[60px] lg:w-[60px] lg:text-lg";

  return (
    <span
      className={`pointer-events-none absolute left-2.5 top-2.5 z-10 lg:left-3 lg:top-3 ${className}`}
    >
      <span
        className={`flex flex-col items-center justify-center rounded-full border-[3px] border-red-600 bg-white leading-none text-red-600 shadow-[0_0_0_2px_#fff,0_0_0_4px_#dc2626,0_6px_16px_rgba(220,38,38,0.35)] ${box}`}
      >
        <span className="font-extrabold tracking-tight">%{percent}</span>
        <span className="mt-0.5 text-[0.5em] font-bold uppercase tracking-wider">İndirim</span>
      </span>
    </span>
  );
}
