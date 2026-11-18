"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { updateTag } from "next/cache";
import { PRODUCTS_TAG } from "@/lib/products";
import {
  SESSION_COOKIE,
  checkPassword,
  createSessionValue,
  isAdminConfigured,
  requireAdmin,
} from "@/lib/server/auth";
import {
  createProduct,
  deleteProduct,
  findProductById,
  setProductActive,
  updateProduct,
  type ProductInput,
} from "@/lib/server/catalog";
import { db, type PhotoRow } from "@/lib/server/db";

export interface FormState {
  error?: string;
}

// ── Giriş / çıkış ───────────────────────────────────────────────────────

export async function login(_state: FormState, formData: FormData): Promise<FormState> {
  if (!isAdminConfigured()) {
    return { error: "Panel şifresi sunucuda tanımlı değil (ADMIN_PASSWORD)." };
  }
  const candidate = String(formData.get("password") ?? "");
  if (!checkPassword(candidate)) {
    // Tahmin denemelerini yavaşlat.
    await new Promise((resolve) => setTimeout(resolve, 800));
    return { error: "Şifre hatalı." };
  }

  const { value, maxAge } = createSessionValue();
  (await cookies()).set(SESSION_COOKIE, value, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge,
  });
  redirect("/yonetim");
}

export async function logout() {
  (await cookies()).delete(SESSION_COOKIE);
  redirect("/yonetim/giris");
}

// ── Yardımcılar ─────────────────────────────────────────────────────────

/** "1.250,50", "1250.5", "1250 ₺" → 1250.5 ; boş → null ; geçersiz → NaN */
function parsePriceSync(raw: FormDataEntryValue | null): number | null {
  let text = String(raw ?? "").replace(/[\s₺]|TL/gi, "");
  if (!text) return null;
  if (/^\d{1,3}(\.\d{3})+(,\d{1,2})?$/.test(text) || text.includes(",")) {
    // Türkçe yazım: nokta binlik, virgül kuruş ("2.450", "2.199,90", "2450,5")
    text = text.replace(/\./g, "").replace(",", ".");
  }
  // Kalan durum: "2450" veya "2450.5" (nokta ondalık)
  const value = Number(text);
  if (!Number.isFinite(value) || value < 0) return NaN;
  return Math.round(value * 100) / 100;
}

function list(raw: FormDataEntryValue | null): string[] {
  return String(raw ?? "")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean)
    .map((item) => item.charAt(0).toLocaleUpperCase("tr") + item.slice(1));
}

function readPhotos(raw: FormDataEntryValue | null): PhotoRow[] {
  try {
    const value = JSON.parse(String(raw ?? "[]")) as PhotoRow[];
    return value.filter(
      (photo) => typeof photo?.src === "string" && typeof photo?.card === "string",
    );
  } catch {
    return [];
  }
}

// ── Ürün kaydet / sil ───────────────────────────────────────────────────

export async function saveProduct(_state: FormState, formData: FormData): Promise<FormState> {
  await requireAdmin();

  const id = String(formData.get("id") ?? "");
  const name = String(formData.get("name") ?? "").trim();
  const category = String(formData.get("category") ?? "");
  const subcategory = String(formData.get("subcategory") ?? "").trim();
  const price = parsePriceSync(formData.get("price"));
  const compareAtPrice = parsePriceSync(formData.get("compareAtPrice"));
  const photos = readPhotos(formData.get("photos"));
  const isActive = formData.get("isActive") === "on";

  if (!name) return { error: "Model adı boş olamaz." };
  if (category !== "kadin" && category !== "erkek") return { error: "Kategori seçin." };
  if (!subcategory) return { error: "Tür (ör. Loafer, Bot) boş olamaz." };
  if (Number.isNaN(price)) return { error: "Fiyat geçerli bir sayı olmalı (ör. 2.450 veya 2450)." };
  if (Number.isNaN(compareAtPrice)) return { error: "İndirimsiz fiyat geçerli bir sayı olmalı." };
  if (compareAtPrice !== null && price !== null && compareAtPrice <= price) {
    return { error: "İndirimsiz fiyat, satış fiyatından yüksek olmalı (ya da boş bırakın)." };
  }
  if (isActive && photos.length === 0) {
    return { error: "Yayına almak için en az bir fotoğraf ekleyin." };
  }

  const input: ProductInput = {
    name,
    category,
    subcategory,
    price: price ?? 0,
    compareAtPrice,
    description: String(formData.get("description") ?? "").trim(),
    colors: list(formData.get("colors")),
    sizes: formData
      .getAll("sizes")
      .map(String)
      .sort((a, b) => Number(a) - Number(b)),
    photos,
    cutout: String(formData.get("cutout") ?? "") || null,
    isFeatured: formData.get("isFeatured") === "on",
    isNew: formData.get("isNew") === "on",
    isActive,
    sort: Number(formData.get("sort")) || 0,
  };

  const saved = id ? updateProduct(id, input) : createProduct(input);
  if (!saved) return { error: "Ürün bulunamadı; başka bir sekmede silinmiş olabilir." };

  updateTag(PRODUCTS_TAG);
  redirect(`/yonetim?mesaj=${encodeURIComponent(`"${saved.name}" kaydedildi.`)}`);
}

export async function removeProduct(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  const product = findProductById(id);
  if (product) {
    deleteProduct(id);
    updateTag(PRODUCTS_TAG);
  }
  redirect(`/yonetim?mesaj=${encodeURIComponent(`"${product?.name ?? "Ürün"}" silindi.`)}`);
}

export async function toggleActive(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  const product = findProductById(id);
  if (!product) return;
  if (!product.isActive && product.photos.length === 0) return;
  setProductActive(id, !product.isActive);
  updateTag(PRODUCTS_TAG);
}

/** Listeden toplu fiyat girişi: yalnızca değişen fiyatlar yazılır. */
export async function savePrices(_state: FormState, formData: FormData): Promise<FormState> {
  await requireAdmin();

  const updates: { id: string; price: number }[] = [];
  for (const [key, raw] of formData.entries()) {
    if (!key.startsWith("price:")) continue;
    const id = key.slice("price:".length);
    const price = parsePriceSync(raw);
    const original = parsePriceSync(formData.get(`original:${id}`)) ?? 0;
    if (Number.isNaN(price)) return { error: `Geçersiz fiyat: "${String(raw)}"` };
    if ((price ?? 0) !== original) updates.push({ id, price: price ?? 0 });
  }

  if (updates.length > 0) {
    const statement = db().prepare(
      "UPDATE products SET price = ?, updated_at = ? WHERE id = ?",
    );
    const now = new Date().toISOString();
    db().exec("BEGIN");
    try {
      for (const { id, price } of updates) statement.run(price, now, id);
      db().exec("COMMIT");
    } catch (error) {
      db().exec("ROLLBACK");
      throw error;
    }
    updateTag(PRODUCTS_TAG);
  }

  redirect(
    `/yonetim?mesaj=${encodeURIComponent(
      updates.length > 0 ? `${updates.length} fiyat kaydedildi.` : "Değişen fiyat yok.",
    )}`,
  );
}
