import { formatPrice } from "@/lib/format";
import { siteConfig } from "@/lib/site-config";
import type { Product } from "@/types/product";

/** Hazır mesajla WhatsApp sohbeti açan linki üretir. */
export function buildWhatsAppUrl(
  message: string = siteConfig.whatsapp.defaultMessage,
): string {
  return `https://wa.me/${siteConfig.whatsapp.number}?text=${encodeURIComponent(message)}`;
}

interface ProductMessageOptions {
  product: Product;
  size?: string | null;
  color?: string | null;
  /** "order": sipariş talebi, "inquiry": bilgi sorusu */
  intent?: "order" | "inquiry";
}

/** Seçilen model, renk ve numarayı içeren hazır WhatsApp mesajı. */
export function buildProductMessage({
  product,
  size,
  color,
  intent = "order",
}: ProductMessageOptions): string {
  // Mesaj her üründe aynı kalıpta gider: önce ürün bilgileri, sonra ürün
  // sayfasının linki (WhatsApp bu linkten ürün fotoğraflı önizleme kartı
  // üretir), en sonda müşterinin niyeti.
  const lines = [
    "Merhaba,",
    "",
    `Model: ${product.brand} ${product.name}`,
  ];
  if (color) lines.push(`Renk: ${color}`);
  lines.push(`Numara: ${size ?? "henüz seçilmedi"}`);
  if (siteConfig.showPrices && product.price > 0) {
    const onSale = product.compareAtPrice && product.compareAtPrice > product.price;
    lines.push(
      onSale
        ? `Fiyat: ${formatPrice(product.price, product.currency)} (indirimli, normal fiyatı ${formatPrice(product.compareAtPrice!, product.currency)})`
        : `Fiyat: ${formatPrice(product.price, product.currency)}`,
    );
  }
  lines.push(
    "",
    `${siteConfig.url}/urun/${product.slug}`,
    "",
    intent === "order"
      ? "Bu ürününüzü sipariş etmek istiyorum."
      : "Bu ürününüzle ilgileniyorum.",
  );

  return lines.join("\n");
}
