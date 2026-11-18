import { randomUUID } from "node:crypto";
import { db, type PhotoRow, type ProductRow } from "@/lib/server/db";
import type { Product, ProductCategory } from "@/types/product";

/**
 * Ürün okuma/yazma işlemleri (yalnızca sunucuda). Site tarafı bunları
 * lib/products.ts üzerinden, önbellekli olarak kullanır; yönetim paneli
 * doğrudan kullanır.
 */

/** Görseli olmayan ürünler için yer tutucu */
const FALLBACK_IMAGE = "/brand/danaci-logo.svg";

function parse<T>(json: string, fallback: T): T {
  try {
    return JSON.parse(json) as T;
  } catch {
    return fallback;
  }
}

export function toProduct(row: ProductRow): Product {
  const photos = parse<PhotoRow[]>(row.photos, []);
  const sizes = parse<{ size: string; stock: number }[]>(row.sizes, []);

  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    brand: row.brand,
    category: row.category,
    subcategory: row.subcategory,
    price: row.price,
    compareAtPrice: row.compare_at_price ?? undefined,
    currency: "TRY",
    cardImage: photos[0]?.card ?? FALLBACK_IMAGE,
    images: photos.length > 0 ? photos.map((photo) => photo.src) : [FALLBACK_IMAGE],
    cutout: row.cutout ?? undefined,
    colors: parse<string[]>(row.colors, []),
    colorways: [],
    variants: sizes.map(({ size, stock }) => ({
      size,
      stock,
      sku: `DNC-${row.id.replace(/^p-/, "").slice(0, 8)}-${size}`,
    })),
    description: row.description,
    isNew: row.is_new === 1,
    isFeatured: row.is_featured === 1,
  };
}

const ORDER = "ORDER BY is_featured DESC, sort ASC, created_at ASC";

/** Sitede yayında olan ürünler */
export function listActiveProducts(): Product[] {
  const rows = db()
    .prepare(`SELECT * FROM products WHERE is_active = 1 ${ORDER}`)
    .all() as unknown as ProductRow[];
  return rows.map(toProduct);
}

export function findActiveProductBySlug(slug: string): Product | undefined {
  const row = db()
    .prepare("SELECT * FROM products WHERE slug = ? AND is_active = 1")
    .get(slug) as unknown as ProductRow | undefined;
  return row ? toProduct(row) : undefined;
}

// ── Yönetim paneli ──────────────────────────────────────────────────────

export interface AdminProduct extends Product {
  photos: PhotoRow[];
  isActive: boolean;
  sort: number;
  updatedAt: string;
}

function toAdminProduct(row: ProductRow): AdminProduct {
  return {
    ...toProduct(row),
    photos: parse<PhotoRow[]>(row.photos, []),
    isActive: row.is_active === 1,
    sort: row.sort,
    updatedAt: row.updated_at,
  };
}

/** Panel listesi: yayında olmayanlar dahil tüm ürünler */
export function listAllProducts(): AdminProduct[] {
  const rows = db().prepare(`SELECT * FROM products ${ORDER}`).all() as unknown as ProductRow[];
  return rows.map(toAdminProduct);
}

export function findProductById(id: string): AdminProduct | undefined {
  const row = db().prepare("SELECT * FROM products WHERE id = ?").get(id) as unknown as
    | ProductRow
    | undefined;
  return row ? toAdminProduct(row) : undefined;
}

/** Panelden gelen, doğrulanmış ürün bilgisi */
export interface ProductInput {
  name: string;
  category: ProductCategory;
  subcategory: string;
  price: number;
  compareAtPrice: number | null;
  description: string;
  colors: string[];
  sizes: string[];
  photos: PhotoRow[];
  cutout: string | null;
  isFeatured: boolean;
  isNew: boolean;
  isActive: boolean;
  sort: number;
}

const TR_MAP: Record<string, string> = { ç: "c", ğ: "g", ı: "i", ö: "o", ş: "s", ü: "u" };

/** "Siyah Deri Loafer" → "siyah-deri-loafer" */
export function slugify(text: string): string {
  return text
    .toLocaleLowerCase("tr")
    .replace(/[çğıöşü]/g, (ch) => TR_MAP[ch] ?? ch)
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

/** Aynı adresi kullanan başka ürün varsa sonuna -2, -3… ekler. */
function uniqueSlug(base: string, excludeId?: string): string {
  const root = base || "urun";
  const taken = db().prepare("SELECT 1 FROM products WHERE slug = ? AND id IS NOT ?");
  let slug = root;
  for (let n = 2; taken.get(slug, excludeId ?? null); n++) slug = `${root}-${n}`;
  return slug;
}

/** Ürün adresi (slug) renkler + ad ile oluşturulur: "siyah-taba-deri-loafer" */
function slugFor(input: ProductInput): string {
  return slugify([...input.colors, input.name].join(" "));
}

function values(input: ProductInput) {
  return [
    input.name,
    input.category,
    input.subcategory,
    input.price,
    input.compareAtPrice,
    input.description,
    JSON.stringify(input.colors),
    JSON.stringify(input.sizes.map((size) => ({ size, stock: 1 }))),
    JSON.stringify(input.photos),
    input.cutout,
    input.isFeatured ? 1 : 0,
    input.isNew ? 1 : 0,
    input.isActive ? 1 : 0,
    input.sort,
  ] as const;
}

export function createProduct(input: ProductInput): AdminProduct {
  const id = `p-${randomUUID().slice(0, 8)}`;
  const now = new Date().toISOString();
  db()
    .prepare(
      `INSERT INTO products (name, category, subcategory, price, compare_at_price,
        description, colors, sizes, photos, cutout, is_featured, is_new, is_active,
        sort, id, slug, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    )
    .run(...values(input), id, uniqueSlug(slugFor(input)), now, now);
  return findProductById(id)!;
}

/**
 * Ürünü günceller. Adres (slug) yalnızca ad veya renkler değiştiyse yenilenir;
 * böylece WhatsApp'ta paylaşılmış eski linkler gereksiz yere bozulmaz.
 */
export function updateProduct(id: string, input: ProductInput): AdminProduct | undefined {
  const current = findProductById(id);
  if (!current) return undefined;

  const identityChanged =
    current.name !== input.name || current.colors.join("|") !== input.colors.join("|");
  const slug = identityChanged ? uniqueSlug(slugFor(input), id) : current.slug;

  db()
    .prepare(
      `UPDATE products SET name = ?, category = ?, subcategory = ?, price = ?,
        compare_at_price = ?, description = ?, colors = ?, sizes = ?, photos = ?,
        cutout = ?, is_featured = ?, is_new = ?, is_active = ?, sort = ?,
        slug = ?, updated_at = ?
       WHERE id = ?`,
    )
    .run(...values(input), slug, new Date().toISOString(), id);
  return findProductById(id);
}

export function setProductActive(id: string, active: boolean) {
  db()
    .prepare("UPDATE products SET is_active = ?, updated_at = ? WHERE id = ?")
    .run(active ? 1 : 0, new Date().toISOString(), id);
}

export function deleteProduct(id: string) {
  db().prepare("DELETE FROM products WHERE id = ?").run(id);
}

/** Paneldeki alt kategori önerileri */
export function listSubcategories(): string[] {
  const rows = db()
    .prepare("SELECT DISTINCT subcategory FROM products ORDER BY subcategory")
    .all() as { subcategory: string }[];
  return rows.map((row) => row.subcategory);
}
