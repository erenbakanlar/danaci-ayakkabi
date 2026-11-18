import { cacheLife, cacheTag } from "next/cache";
import { findActiveProductBySlug, listActiveProducts } from "@/lib/server/catalog";
import { siteConfig } from "@/lib/site-config";
import type { Product, ProductCategory } from "@/types/product";

/**
 * ÜRÜN VERİ KATMANI (site tarafı)
 *
 * Sayfalar ve bileşenler ürün verisine SADECE bu dosyanın export ettiği
 * fonksiyonlarla erişir. Veri, yönetim panelinden düzenlenen SQLite
 * veritabanından gelir (lib/server/catalog.ts).
 *
 * Okumalar önbelleğe alınır ve "products" etiketiyle işaretlenir. Panelde
 * bir ürün kaydedildiğinde updateTag("products") ile önbellek hemen
 * yenilenir; birden fazla sunucu süreci çalışıyorsa diğerleri en geç bir
 * dakika içinde güncellenir.
 */
export const PRODUCTS_TAG = "products";

async function activeProducts(): Promise<Product[]> {
  "use cache";
  cacheTag(PRODUCTS_TAG);
  cacheLife({ stale: 60, revalidate: 60, expire: 3600 });
  return listActiveProducts();
}

export async function getProducts(): Promise<Product[]> {
  return activeProducts();
}

/** Öne çıkan ürünler, panelde verilen sırayla. */
export async function getFeaturedProducts(): Promise<Product[]> {
  return (await activeProducts()).filter((product) => product.isFeatured);
}

/** Ana sayfa hero'sunda gösterilecek ürün: isFeatured olan ilk ürün. */
export async function getHeroProduct(): Promise<Product | undefined> {
  return (await activeProducts()).find((product) => product.isFeatured);
}

export async function getProductBySlug(slug: string): Promise<Product | undefined> {
  "use cache";
  cacheTag(PRODUCTS_TAG);
  cacheLife({ stale: 60, revalidate: 60, expire: 3600 });
  return findActiveProductBySlug(slug);
}

/** Ürünün "Büyük Numara" eşiğinde ve üstünde, stokta olan numaraları. */
export function getLargeSizes(product: Product): string[] {
  return product.variants
    .filter(
      (variant) =>
        Number(variant.size) >= siteConfig.largeSizeFrom && variant.stock > 0,
    )
    .map((variant) => variant.size);
}

/** "Büyük Numara" bölümü: eşik ve üstü numarası stokta olan modeller. */
export async function getLargeSizeProducts(): Promise<Product[]> {
  return (await activeProducts()).filter((product) => getLargeSizes(product).length > 0);
}

export async function getProductsByCategory(
  category: ProductCategory,
): Promise<Product[]> {
  return (await activeProducts()).filter((product) => product.category === category);
}
