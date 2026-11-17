/*
 * public/brand/danaci-logo.svg amblemini site ikonlarına çevirir.
 *
 *   npm run icons
 *
 * Çıktılar (Next.js app ikon kuralları):
 *   app/icon.svg        modern tarayıcılar
 *   app/favicon.ico     16, 32 ve 48 px (eski tarayıcılar, sekme)
 *   app/apple-icon.png  180 px (iPhone ana ekranı)
 *
 * İkonlar açık bej zemin üzerine çizilir; koyu temalı sekme çubuklarında
 * da görünür kalır.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const logo = fs.readFileSync(path.join(root, "public", "brand", "danaci-logo.svg"), "utf8");

/** Amblemin iç çizimi (dış <svg> etiketi olmadan) */
const inner = logo.replace(/^[\s\S]*?<svg[^>]*>/, "").replace(/<\/svg>\s*$/, "");

/** Zeminli ikon: yuvarlatılmış kare + ortalanmış amblem */
function iconSvg({ radius = 14, inset = 7 } = {}) {
  const scale = (64 - inset * 2) / 64;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
  <rect width="64" height="64" rx="${radius}" fill="#FAF8F4"/>
  <g transform="translate(${inset} ${inset}) scale(${scale})">${inner}</g>
</svg>
`;
}

/** PNG girişli ICO dosyası (tüm güncel tarayıcılar destekler) */
function buildIco(pngs) {
  const header = Buffer.alloc(6);
  header.writeUInt16LE(0, 0);
  header.writeUInt16LE(1, 2);
  header.writeUInt16LE(pngs.length, 4);
  const entries = [];
  let offset = 6 + 16 * pngs.length;
  for (const { size, data } of pngs) {
    const entry = Buffer.alloc(16);
    entry.writeUInt8(size >= 256 ? 0 : size, 0);
    entry.writeUInt8(size >= 256 ? 0 : size, 1);
    entry.writeUInt8(0, 2);
    entry.writeUInt8(0, 3);
    entry.writeUInt16LE(1, 4);
    entry.writeUInt16LE(32, 6);
    entry.writeUInt32LE(data.length, 8);
    entry.writeUInt32LE(offset, 12);
    offset += data.length;
    entries.push(entry);
  }
  return Buffer.concat([header, ...entries, ...pngs.map((p) => p.data)]);
}

async function png(svg, size) {
  return sharp(Buffer.from(svg), { density: 72 * (size / 64) * 4 })
    .resize(size, size)
    .png()
    .toBuffer();
}

async function main() {
  const appDir = path.join(root, "app");
  const tabIcon = iconSvg();

  fs.writeFileSync(path.join(appDir, "icon.svg"), tabIcon, "utf8");

  // Küçük boyutlarda kenar boşluğunu azaltıp amblemi büyüt.
  const small = iconSvg({ radius: 12, inset: 4 });
  const ico = buildIco(
    await Promise.all([16, 32, 48].map(async (size) => ({ size, data: await png(small, size) }))),
  );
  fs.writeFileSync(path.join(appDir, "favicon.ico"), ico);

  // iOS köşeleri kendisi yuvarlar; kare zemin kullan.
  fs.writeFileSync(
    path.join(appDir, "apple-icon.png"),
    await png(iconSvg({ radius: 0, inset: 14 }), 180),
  );

  console.log("İkonlar üretildi: app/icon.svg, app/favicon.ico, app/apple-icon.png");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
