import type { Currency } from "@/types/product";

export function formatPrice(amount: number, currency: Currency = "TRY"): string {
  return new Intl.NumberFormat("tr-TR", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(amount);
}
