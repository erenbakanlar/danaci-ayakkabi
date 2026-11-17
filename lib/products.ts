import { productData } from "@/lib/product-data";
import { siteConfig } from "@/lib/site-config";
import type { Product, ProductCategory } from "@/types/product";

/**
 * ÜRÜN VERİ KATMANI
 *
 * Sayfalar ve bileşenler ürün verisine SADECE bu dosyanın export ettiği
 * fonksiyonlarla erişir. E-ticarete geçişte yalnızca bu dosyanın içi bir API
 * istemcisiyle değiştirilecek; fonksiyon imzaları aynı kalacak. Bu yüzden
 * fonksiyonlar şimdiden async.
 *
 * Veri şu an lib/product-data.ts içinden gelir; o dosya public/products
 * altındaki fotoğraflardan `npm run catalog` ile üretilir.
 */
const products: Product[] = productData;

export async function getProducts(): Promise<Product[]> {
  return products;
}

/** Öne çıkan ürünler, katalogdaki sırasıyla. */
export async function getFeaturedProducts(): Promise<Product[]> {
  return products.filter((product) => product.isFeatured);
}

/** Ana sayfa hero'sunda gösterilecek ürün: isFeatured olan ilk ürün. */
export async function getHeroProduct(): Promise<Product | undefined> {
  return products.find((product) => product.isFeatured);
}

export async function getProductBySlug(
  slug: string,
): Promise<Product | undefined> {
  return products.find((product) => product.slug === slug);
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
  return products.filter((product) => getLargeSizes(product).length > 0);
}

export async function getProductsByCategory(
  category: ProductCategory,
): Promise<Product[]> {
  return products.filter((product) => product.category === category);
}
