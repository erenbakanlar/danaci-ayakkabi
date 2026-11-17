/*
 * public/products içindeki fotoğraflardan ürün kataloğunu üretir.
 *
 *   npm run catalog
 *
 * Her model için dosya adı kalıbı:
 *   <slug>-kart.webp    ürün kartı (800x1000)
 *   <slug>-detay.webp   aynı çekimin büyük hali (1600x2000)
 *   <slug>-magaza.webp  mağaza çekimi (1200x1500)
 *   <slug>-seffaf.png   şeffaf zeminli kesim (hero için)
 *
 * Çıktılar:
 *   lib/product-data.ts            ürün listesi (elle düzenlemeyin; bu betik üzerine yazar)
 *   public/products/<slug>-seffaf.webp  PNG kesimin hafifletilmiş hali
 *
 * Ad, renkler ve tür dosya adından çıkarılır. Kadın/erkek ayrımı, numara
 * aralığı ve öne çıkanlar aşağıdaki listelerden gelir.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const root = path.join(__dirname, "..");
const dir = path.join(root, "public", "products");

// ── Elle yönetilen listeler ──────────────────────────────────────────────
const WOMEN = new Set([
  "siyah-platform-topuklu-sandalet",
  "siyah-tasli-topuklu-ayakkabi",
  "yesil-taba-siyah-gunluk-ayakkabi",
  "siyah-taba-suet-kovboy-bot",
  "siyah-kahverengi-gri-tokali-bot",
  "siyah-kahverengi-kisa-bot",
  "siyah-deri-kahverengi-suet-tokali-bot",
  "siyah-rugan-krem-deri-loafer",
  "siyah-deri-kahverengi-suet-bot",
  "siyah-deri-kahverengi-suet-topuklu-bot",
  "siyah-suet-deri-topuklu-bot",
  "siyah-murdum-kirmizi-stiletto",
  "siyah-murdum-deri-stiletto",
  "siyah-vizon-rugan-tokali-stiletto",
  "siyah-kahverengi-kisa-topuklu-ayakkabi",
  "siyah-kahverengi-tasli-dolgu-topuk-ayakkabi",
  "siyah-pudra-tokali-loafer",
  "siyah-murdum-kalin-topuklu-ayakkabi",
  "yesil-kahverengi-topuklu-loafer",
  "siyah-kahverengi-dolgu-topuk-ayakkabi",
  "siyah-deri-hardal-suet-comfort-ayakkabi",
  "siyah-kahverengi-suet-zincirli-loafer",
  "siyah-deri-bagcikli-comfort-ayakkabi",
  "siyah-taba-deri-bagcikli-bot",
  "vizon-siyah-bagcikli-bot",
  "siyah-kahverengi-suet-bagcikli-ayakkabi",
  "siyah-rugan-deri-zincirli-loafer",
]);

/** İlk sıradaki ana sayfa hero'sunda gösterilir. */
const FEATURED = [
  "siyah-taba-deri-brogue-ayakkabi",
  "siyah-murdum-kirmizi-stiletto",
  "siyah-bej-chelsea-bot",
  "siyah-rugan-krem-deri-loafer",
  "taba-siyah-deri-loafer",
  "siyah-taba-suet-kovboy-bot",
  "siyah-taba-deri-klasik-ayakkabi",
  "siyah-vizon-rugan-tokali-stiletto",
];

// TODO: Gerçek numara aralıkları ve stok bilgisi gelince güncellenecek.
const SIZES = {
  kadin: ["36", "37", "38", "39", "40"],
  erkek: ["40", "41", "42", "43", "44"],
};

/** Büyük numara modelleri; "Büyük Numara" bölümünde listelenir. */
// TODO: Bu modellerin gerçek numara aralığı teyit edilecek.
const LARGE_SIZES = ["47", "48", "49"];

// ── Ham kamera fotoğrafları (kaynak-fotograflar/, siteye doğrudan gitmez) ──
const RAW_DIR = path.join(root, "kaynak-fotograflar");

/** Mağaza rafında çekilmiş büyük numara modelleri → ürün görselleri */
const RAW_PRODUCTS = [
  { file: "47 numara üstü/DSC01258.JPG", slug: "lacivert-siyah-rugan-burunlu-klasik-ayakkabi" },
  { file: "47 numara üstü/DSC01260.JPG", slug: "lacivert-siyah-deri-kalin-tabanli-sneaker" },
  { file: "47 numara üstü/DSC01262.JPG", slug: "lacivert-delikli-deri-ayakkabi" },
];
const LARGE_SLUGS = new Set(RAW_PRODUCTS.map((item) => item.slug));

/** Mağaza içi kareler → public/magaza (anasayfa ve kategori sayfalarında) */
const STORE_PHOTOS = [
  { file: "magaza ici cekimler/DSC01275.JPG", out: "magaza-bot-ve-gunluk" },
  { file: "magaza ici cekimler/DSC01270.JPG", out: "magaza-topuklu-ve-canta" },
];

/** Kaynak yeniyse (veya çıktı yoksa) çıktıyı üretir. */
async function render(src, out, pipeline) {
  if (fs.existsSync(out) && fs.statSync(out).mtimeMs >= fs.statSync(src).mtimeMs) return;
  await pipeline(sharp(src).rotate()).toFile(out);
  console.log(`  üretildi: ${path.relative(root, out)}`);
}

async function processRawPhotos() {
  if (!fs.existsSync(RAW_DIR)) return;

  for (const { file, slug } of RAW_PRODUCTS) {
    const src = path.join(RAW_DIR, file);
    if (!fs.existsSync(src)) continue;
    // Ayakkabılar karenin alt kısmında; 4:5 kırpmada üst raf kesilir.
    const crop = (w, h) => (img) =>
      img.resize(w, h, { fit: "cover", position: "bottom" }).webp({ quality: 80 });
    await render(src, path.join(dir, `${slug}-kart.webp`), crop(800, 1000));
    await render(src, path.join(dir, `${slug}-magaza.webp`), crop(1200, 1500));
  }

  const storeDir = path.join(root, "public", "magaza");
  fs.mkdirSync(storeDir, { recursive: true });
  for (const { file, out } of STORE_PHOTOS) {
    const src = path.join(RAW_DIR, file);
    if (!fs.existsSync(src)) continue;
    await render(src, path.join(storeDir, `${out}.webp`), (img) =>
      img.resize({ width: 1400, withoutEnlargement: true }).webp({ quality: 80 }),
    );
  }
}

// ── Sözlükler ────────────────────────────────────────────────────────────
const COLORS = {
  siyah: "Siyah",
  bordo: "Bordo",
  kahverengi: "Kahverengi",
  taba: "Taba",
  lacivert: "Lacivert",
  haki: "Haki",
  mavi: "Mavi",
  yesil: "Yeşil",
  bej: "Bej",
  gri: "Gri",
  murdum: "Mürdüm",
  kirmizi: "Kırmızı",
  vizon: "Vizon",
  pudra: "Pudra",
  krem: "Krem",
  hardal: "Hardal",
};
const MATERIALS = { deri: "Deri", rugan: "Rugan", suet: "Süet", nubuk: "Nubuk" };
const WORDS = {
  ...MATERIALS,
  oxford: "Oxford",
  brogue: "Brogue",
  ayakkabi: "Ayakkabı",
  gunluk: "Günlük",
  klasik: "Klasik",
  sneaker: "Sneaker",
  bagcikli: "Bağcıklı",
  spor: "Spor",
  puskullu: "Püsküllü",
  loafer: "Loafer",
  bagciksiz: "Bağcıksız",
  tokali: "Tokalı",
  bot: "Bot",
  fermuarli: "Fermuarlı",
  chelsea: "Chelsea",
  platform: "Platform",
  topuklu: "Topuklu",
  sandalet: "Sandalet",
  tasli: "Taşlı",
  kovboy: "Kovboy",
  kisa: "Kısa",
  stiletto: "Stiletto",
  dolgu: "Dolgu",
  topuk: "Topuk",
  kalin: "Kalın",
  comfort: "Comfort",
  zincirli: "Zincirli",
  burunlu: "Burunlu",
  tabanli: "Tabanlı",
  delikli: "Delikli",
};

function word(token) {
  return WORDS[token] ?? token.charAt(0).toLocaleUpperCase("tr") + token.slice(1);
}

/** "siyah-deri-kahverengi-suet-tokali-bot" → renkler + model adı */
function parseSlug(slug) {
  const tokens = slug.split("-").filter((t) => !/^\d+$/.test(t));
  const colors = [];
  const colorMaterials = [];
  let i = 0;
  let anyAttached = false;

  while (i < tokens.length && COLORS[tokens[i]]) {
    let label = COLORS[tokens[i]];
    const next = tokens[i + 1];
    const laterColor = tokens.slice(i + 2).some((t) => COLORS[t]);
    if (MATERIALS[next] && (laterColor || anyAttached)) {
      label += ` ${MATERIALS[next]}`;
      colorMaterials.push(MATERIALS[next]);
      anyAttached = true;
      i += 1;
    }
    colors.push(label);
    i += 1;
  }

  const rest = tokens.slice(i);
  const parts = [];
  // Renklere bağlanan malzemeler adın başına taşınır: "Deri & Süet Bot"
  const lead = [...new Set(colorMaterials)];
  let j = 0;
  while (j < rest.length && MATERIALS[rest[j]]) {
    lead.push(MATERIALS[rest[j]]);
    j += 1;
  }
  if (lead.length) parts.push([...new Set(lead)].join(" & "));
  parts.push(...rest.slice(j).map(word));

  return { colors, name: parts.join(" "), tokens };
}

function subcategory(tokens) {
  const has = (t) => tokens.includes(t);
  if (has("bot")) return "Bot";
  if (has("sandalet")) return "Sandalet";
  if (has("loafer")) return "Loafer";
  if (has("sneaker") || has("spor")) return "Spor";
  if (has("stiletto") || has("topuklu") || has("topuk")) return "Topuklu";
  if (has("oxford") || has("klasik") || has("brogue")) return "Klasik";
  return "Günlük";
}

function listTr(items) {
  if (items.length <= 1) return items.join("");
  return `${items.slice(0, -1).join(", ")} ve ${items.at(-1)}`;
}

async function main() {
  await processRawPhotos();
  const files = fs.readdirSync(dir);
  const slugs = files
    .filter((f) => f.endsWith("-magaza.webp"))
    .map((f) => ({
      slug: f.replace("-magaza.webp", ""),
      time: fs.statSync(path.join(dir, f)).mtimeMs,
    }))
    .sort((a, b) => a.time - b.time || a.slug.localeCompare(b.slug))
    .map((item) => item.slug);

  const products = [];
  for (const [index, slug] of slugs.entries()) {
    const has = (suffix) => files.includes(`${slug}-${suffix}`);
    const url = (suffix) => `/products/${slug}-${suffix}`;

    // Şeffaf PNG'yi hafif bir WebP'ye çevir (varsa ve güncel değilse).
    let cutout;
    if (has("seffaf.png")) {
      const src = path.join(dir, `${slug}-seffaf.png`);
      const out = path.join(dir, `${slug}-seffaf.webp`);
      if (!fs.existsSync(out) || fs.statSync(out).mtimeMs < fs.statSync(src).mtimeMs) {
        await sharp(src)
          .resize({ width: 1400, withoutEnlargement: true })
          .webp({ quality: 82, alphaQuality: 90 })
          .toFile(out);
      }
      cutout = url("seffaf.webp");
    } else if (has("seffaf.webp")) {
      // PNG'ler depoda tutulmaz; daha önce üretilmiş WebP yeterli.
      cutout = url("seffaf.webp");
    }

    const { colors, name, tokens } = parseSlug(slug);
    const category = WOMEN.has(slug) ? "kadin" : "erkek";
    const magaza = url("magaza.webp");
    const studio = has("detay.webp") ? url("detay.webp") : undefined;
    const id = `p-${String(index + 1).padStart(3, "0")}`;
    const lowerName = name.toLocaleLowerCase("tr");
    const lowerColors = colors.map((c) => c.toLocaleLowerCase("tr"));
    const description =
      colors.length > 1
        ? `${listTr(lowerColors).replace(/^./, (c) => c.toLocaleUpperCase("tr"))} renk seçenekleriyle ${lowerName}.`
        : `${colors[0] ?? ""} ${lowerName}.`.trim();

    products.push({
      id,
      slug,
      name,
      brand: "Danacı",
      category,
      subcategory: subcategory(tokens),
      price: 0,
      currency: "TRY",
      cardImage: has("kart.webp") ? url("kart.webp") : magaza,
      images: studio ? [studio, magaza] : [magaza],
      cutout,
      colors,
      colorways: [],
      variants: (LARGE_SLUGS.has(slug) ? LARGE_SIZES : SIZES[category]).map((size) => ({
        size,
        stock: 1,
        sku: `DNC-${id.slice(2)}-${size}`,
      })),
      description,
      isNew: false,
      isFeatured: FEATURED.includes(slug),
    });
  }

  // Öne çıkanlar FEATURED sırasıyla başa gelsin (hero ilkini kullanır).
  const rank = (p) => {
    const i = FEATURED.indexOf(p.slug);
    return i === -1 ? Number.MAX_SAFE_INTEGER : i;
  };
  const ordered = [...products].sort((a, b) => rank(a) - rank(b));

  const banner = `// BU DOSYA OTOMATİK ÜRETİLİR — elle düzenlemeyin.
// Kaynak: public/products içindeki fotoğraflar + scripts/build-catalog.cjs
// Yenilemek için: npm run catalog
`;
  const body = `${banner}import type { Product } from "@/types/product";

export const productData: Product[] = ${JSON.stringify(ordered, null, 2)};
`;
  fs.writeFileSync(path.join(root, "lib", "product-data.ts"), body, "utf8");

  const women = products.filter((p) => p.category === "kadin").length;
  console.log(
    `${products.length} ürün yazıldı (${women} kadın, ${products.length - women} erkek).`,
  );
  for (const p of products) console.log(`  ${p.category.padEnd(5)} ${p.name}  [${p.colors.join(", ")}]`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
