import fs from "node:fs";
import path from "node:path";
import { DatabaseSync } from "node:sqlite";
import { productData } from "@/lib/product-data";

/**
 * SUNUCU VERİTABANI (SQLite)
 *
 * Ürünler `storage/danaci.db` dosyasında tutulur; yüklenen fotoğraflar
 * `storage/uploads` altına yazılır. `storage/` depoya eklenmez ve git
 * çekmelerinde silinmez. Yedek almak için bu klasörü kopyalamak yeterli.
 *
 * Konum DANACI_DATA_DIR ortam değişkeniyle değiştirilebilir.
 * Veritabanı ilk açıldığında boşsa lib/product-data.ts içeriği aktarılır.
 */
export const DATA_DIR = process.env.DANACI_DATA_DIR || path.join(process.cwd(), "storage");
export const UPLOAD_DIR = path.join(DATA_DIR, "uploads");

const SCHEMA = `
CREATE TABLE IF NOT EXISTS products (
  id               TEXT PRIMARY KEY,
  slug             TEXT NOT NULL UNIQUE,
  name             TEXT NOT NULL,
  brand            TEXT NOT NULL DEFAULT 'Danacı',
  category         TEXT NOT NULL CHECK (category IN ('kadin', 'erkek')),
  subcategory      TEXT NOT NULL,
  price            REAL NOT NULL DEFAULT 0,
  compare_at_price REAL,
  currency         TEXT NOT NULL DEFAULT 'TRY',
  description      TEXT NOT NULL DEFAULT '',
  colors           TEXT NOT NULL DEFAULT '[]',
  sizes            TEXT NOT NULL DEFAULT '[]',
  photos           TEXT NOT NULL DEFAULT '[]',
  cutout           TEXT,
  is_featured      INTEGER NOT NULL DEFAULT 0,
  is_new           INTEGER NOT NULL DEFAULT 0,
  is_active        INTEGER NOT NULL DEFAULT 1,
  sort             INTEGER NOT NULL DEFAULT 0,
  created_at       TEXT NOT NULL,
  updated_at       TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS products_category ON products (category);
`;

/** Bir ürün fotoğrafı: büyük hali (ürün sayfası) ve kart hali (listeler) */
export interface PhotoRow {
  src: string;
  card: string;
}

export interface ProductRow {
  id: string;
  slug: string;
  name: string;
  brand: string;
  category: "kadin" | "erkek";
  subcategory: string;
  price: number;
  compare_at_price: number | null;
  currency: string;
  description: string;
  colors: string;
  sizes: string;
  photos: string;
  cutout: string | null;
  is_featured: number;
  is_new: number;
  is_active: number;
  sort: number;
  created_at: string;
  updated_at: string;
}

let instance: DatabaseSync | undefined;

/** Veritabanı bağlantısı (süreç başına bir kez açılır). */
export function db(): DatabaseSync {
  if (instance) return instance;

  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
  const database = new DatabaseSync(path.join(DATA_DIR, "danaci.db"));
  database.exec("PRAGMA journal_mode = WAL; PRAGMA busy_timeout = 5000;");
  database.exec(SCHEMA);
  seedIfEmpty(database);
  importNewCatalogProducts(database);

  instance = database;
  return database;
}

/** Katalog kimliği "p-062" → 62; panelden eklenenler (p-1a2b3c4d) → null */
function catalogNumber(id: string): number | null {
  const match = /^p-(\d{3})$/.exec(id);
  return match ? Number(match[1]) : null;
}

/**
 * Veritabanına aktarılmış en yüksek katalog numarası PRAGMA user_version'da
 * tutulur. İlk sürüm (p-001…p-061) bu sayaçtan önce aktarıldığı için, sayaç
 * 0 olan dolu bir veritabanı 61'e kadar aktarılmış sayılır.
 */
const FIRST_CATALOG_SIZE = 61;

function catalogVersion(database: DatabaseSync): number {
  const { user_version } = database.prepare("PRAGMA user_version").get() as {
    user_version: number;
  };
  return user_version;
}

function setCatalogVersion(database: DatabaseSync, version: number) {
  database.exec(`PRAGMA user_version = ${Math.floor(version)}`);
}

const INSERT_PRODUCT = `
  INSERT INTO products (id, slug, name, brand, category, subcategory, price,
    compare_at_price, currency, description, colors, sizes, photos, cutout,
    is_featured, is_new, is_active, sort, created_at, updated_at)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1, ?, ?, ?)
`;

function insertCatalogProduct(
  database: DatabaseSync,
  product: (typeof productData)[number],
  sort: number,
  now: string,
) {
  // Eski katalog: kart görseli + galeri. İlk galeri görselinin kartı
  // hazır kart görselidir; diğerleri kendi kartı olarak kullanılır.
  const photos: PhotoRow[] = product.images.map((src, i) => ({
    src,
    card: i === 0 ? product.cardImage : src,
  }));
  database.prepare(INSERT_PRODUCT).run(
    product.id,
    product.slug,
    product.name,
    product.brand,
    product.category,
    product.subcategory,
    product.price,
    product.compareAtPrice ?? null,
    product.currency,
    product.description,
    JSON.stringify(product.colors),
    JSON.stringify(product.variants.map(({ size, stock }) => ({ size, stock }))),
    JSON.stringify(photos),
    product.cutout ?? null,
    product.isFeatured ? 1 : 0,
    product.isNew ? 1 : 0,
    sort,
    now,
    now,
  );
}

function transaction(database: DatabaseSync, work: () => void) {
  database.exec("BEGIN");
  try {
    work();
    database.exec("COMMIT");
  } catch (error) {
    database.exec("ROLLBACK");
    throw error;
  }
}

function highestCatalogNumber(): number {
  return Math.max(0, ...productData.map((p) => catalogNumber(p.id) ?? 0));
}

/** İlk açılışta mevcut ürün listesini veritabanına aktarır. */
function seedIfEmpty(database: DatabaseSync) {
  const { count } = database.prepare("SELECT COUNT(*) AS count FROM products").get() as {
    count: number;
  };
  if (count > 0) return;

  const now = new Date().toISOString();
  transaction(database, () => {
    productData.forEach((product, index) => insertCatalogProduct(database, product, index, now));
    setCatalogVersion(database, highestCatalogNumber());
  });
}

/**
 * Katalog sonradan büyüdüyse (yeni fotoğraf partisi, npm run catalog), yalnızca
 * yeni eklenen ürünleri mevcut veritabanına aktarır. Panelden silinen ya da
 * düzenlenen eski ürünlere dokunmaz.
 */
function importNewCatalogProducts(database: DatabaseSync) {
  const version = catalogVersion(database) || FIRST_CATALOG_SIZE;
  const fresh = productData.filter((product) => (catalogNumber(product.id) ?? 0) > version);
  if (fresh.length === 0) {
    if (catalogVersion(database) === 0) setCatalogVersion(database, version);
    return;
  }

  const exists = database.prepare("SELECT 1 FROM products WHERE id = ? OR slug = ?");
  const { maxSort } = database
    .prepare("SELECT COALESCE(MAX(sort), 0) AS maxSort FROM products")
    .get() as { maxSort: number };
  const now = new Date().toISOString();
  transaction(database, () => {
    fresh.forEach((product, index) => {
      if (exists.get(product.id, product.slug)) return;
      insertCatalogProduct(database, product, maxSort + 1 + index, now);
    });
    setCatalogVersion(database, highestCatalogNumber());
  });
}
