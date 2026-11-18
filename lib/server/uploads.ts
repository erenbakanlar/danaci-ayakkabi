import fs from "node:fs/promises";
import path from "node:path";
import { randomUUID } from "node:crypto";
import sharp from "sharp";
import { UPLOAD_DIR, type PhotoRow } from "@/lib/server/db";

/**
 * Panelden yüklenen fotoğrafları işler ve storage/uploads altına yazar.
 * Dosyalar /media/<ad> adresinden sunulur (app/media/[...path]/route.ts).
 * Next.js, derlemeden sonra public/ klasörüne eklenen dosyaları sunmadığı
 * için yüklemeler public/ yerine buraya gider.
 */
export const MEDIA_PREFIX = "/media/";
const MAX_BYTES = 25 * 1024 * 1024;

export class UploadError extends Error {}

async function readImage(file: File): Promise<Buffer> {
  if (file.size === 0) throw new UploadError("Dosya boş.");
  if (file.size > MAX_BYTES) throw new UploadError("Dosya 25 MB'tan büyük olamaz.");
  const buffer = Buffer.from(await file.arrayBuffer());
  try {
    const meta = await sharp(buffer).metadata();
    if (!meta.width || !meta.height) throw new Error();
  } catch {
    throw new UploadError("Bu dosya bir fotoğraf olarak okunamadı (JPG, PNG veya WEBP).");
  }
  return buffer;
}

async function write(name: string, data: Buffer): Promise<string> {
  await fs.mkdir(UPLOAD_DIR, { recursive: true });
  await fs.writeFile(path.join(UPLOAD_DIR, name), data);
  return `${MEDIA_PREFIX}${name}`;
}

/**
 * Ürün fotoğrafı: 4:5 oranında, ayakkabıyı ortalayacak şekilde kırpılır.
 * Büyük hali ürün sayfasında, kart hali listelerde kullanılır.
 */
export async function saveProductPhoto(file: File): Promise<PhotoRow> {
  const buffer = await readImage(file);
  const id = randomUUID().slice(0, 12);
  const base = sharp(buffer).rotate();

  const [large, card] = await Promise.all([
    base
      .clone()
      .resize(1600, 2000, { fit: "cover", position: sharp.strategy.attention })
      .webp({ quality: 82 })
      .toBuffer(),
    base
      .clone()
      .resize(800, 1000, { fit: "cover", position: sharp.strategy.attention })
      .webp({ quality: 80 })
      .toBuffer(),
  ]);

  return {
    src: await write(`${id}-buyuk.webp`, large),
    card: await write(`${id}-kart.webp`, card),
  };
}

/** Şeffaf zeminli kesim (ana sayfa hero'su): boş kenarlar kırpılır. */
export async function saveCutout(file: File): Promise<string> {
  const buffer = await readImage(file);
  const meta = await sharp(buffer).metadata();
  if (!meta.hasAlpha) {
    throw new UploadError("Şeffaf zeminli bir PNG veya WEBP seçin (arka planı silinmiş görsel).");
  }
  const output = await sharp(buffer)
    .rotate()
    .trim()
    .resize({ width: 1400, withoutEnlargement: true })
    .webp({ quality: 82, alphaQuality: 90 })
    .toBuffer();
  return write(`${randomUUID().slice(0, 12)}-seffaf.webp`, output);
}
