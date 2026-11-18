import type { Currency } from "@/types/product";

/** 2450 → "₺2.450" ; 2199.9 → "₺2.199,90" (kuruş varsa gösterilir, yuvarlanmaz) */
export function formatPrice(amount: number, currency: Currency = "TRY"): string {
  const whole = Number.isInteger(amount);
  return new Intl.NumberFormat("tr-TR", {
    style: "currency",
    currency,
    minimumFractionDigits: whole ? 0 : 2,
    maximumFractionDigits: whole ? 0 : 2,
  }).format(amount);
}
