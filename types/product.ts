export type ProductCategory = "kadin" | "erkek";

export type Currency = "TRY";

export interface ProductVariant {
  /** Beden (EU numara), ör. "38" */
  size: string;
  /** Stok adedi; 0 ise beden tükendi */
  stock: number;
  sku: string;
}

/** Bir renk seçeneğine ait tek görsel / kadraj. */
export interface ProductView {
  src: string;
  /** Galeride görünen etiket, ör. "Topuk" */
  label: string;
  /** Yakınlaştırılacak nokta, görselin oranı olarak (0–1). Varsayılan orta. */
  focus?: [number, number];
  /** 1 görselin tamamını gösterir. Varsayılan 1. */
  zoom?: number;
  /** Ayakkabının diğer yüzü için yatay çevir. */
  mirror?: boolean;
}

/** Ürünün bir renk seçeneği. */
export interface ProductColorway {
  /** Renk adı: seçici etiketi, alt metin ve hero'daki dev yazı */
  name: string;
  /** Renk seçici dairesinin rengi (herhangi bir CSS rengi) */
  swatch: string;
  /** Hero arka plan tonu */
  tint: string;
  /** Yandan profil, burun solda, şeffaf zeminli görsel */
  heroImage: string;
  /** İlk üçü küçük resim olur, kalanı "+N" ile sayılır */
  gallery: ProductView[];
}

export interface Product {
  id: string;
  slug: string;
  name: string;
  brand: string;
  category: ProductCategory;
  /** Ör. "Sneaker", "Bot", "Loafer" */
  subcategory: string;
  /** Güncel satış fiyatı */
  price: number;
  /** İndirim öncesi fiyat (varsa) */
  compareAtPrice?: number;
  currency: Currency;
  /** Güncel satış fiyatı 0 ise fiyat henüz girilmemiştir ve gösterilmez. */
  /** Ürün kartında ve link önizlemesinde kullanılan görsel (4:5) */
  cardImage: string;
  /** Ürün sayfası galerisi (4:5) */
  images: string[];
  /** Şeffaf zeminli kesim; ana sayfa hero'su kullanır */
  cutout?: string;
  /** Modelin renk seçenekleri, ör. ["Siyah", "Taba"] */
  colors: string[];
  /**
   * Renk başına ayrı görseli olan seçenekler (hero'da renk değiştirme
   * animasyonu için). Şu an fotoğraflar tüm renkleri tek karede gösterdiği
   * için boş; renk başına tek çekim gelirse doldurulur.
   */
  colorways: ProductColorway[];
  variants: ProductVariant[];
  description: string;
  isNew: boolean;
  isFeatured: boolean;
}
