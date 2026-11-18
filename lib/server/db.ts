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

  instance = database;
  return database;
}

/** İlk açılışta mevcut ürün listesini veritabanına aktarır. */
function seedIfEmpty(database: DatabaseSync) {
  const { count } = database.prepare("SELECT COUNT(*) AS count FROM products").get() as {
    count: number;
  };
  if (count > 0) return;

  const insert = database.prepare(`
    INSERT INTO products (id, slug, name, brand, category, subcategory, price,
      compare_at_price, currency, description, colors, sizes, photos, cutout,
      is_featured, is_new, is_active, sort, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1, ?, ?, ?)
  `);
  const now = new Date().toISOString();

  database.exec("BEGIN");
  try {
    productData.forEach((product, index) => {
      // Eski katalog: kart görseli + galeri. İlk galeri görselinin kartı
      // hazır kart görselidir; diğerleri kendi kartı olarak kullanılır.
      const photos: PhotoRow[] = product.images.map((src, i) => ({
        src,
        card: i === 0 ? product.cardImage : src,
      }));
      insert.run(
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
        index,
        now,
        now,
      );
    });
    database.exec("COMMIT");
  } catch (error) {
    database.exec("ROLLBACK");
    throw error;
  }
}
