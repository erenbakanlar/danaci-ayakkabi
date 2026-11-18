import { createHash, createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { connection } from "next/server";

/**
 * YÖNETİM PANELİ GİRİŞİ (tek şifre)
 *
 * Şifre sunucuda ADMIN_PASSWORD ortam değişkeninde tutulur (Plesk > Node.js >
 * Ortam değişkenleri; yerelde .env.local). Giriş yapınca imzalı bir oturum
 * çerezi verilir. Şifre değişirse tüm açık oturumlar geçersiz olur.
 */
export const SESSION_COOKIE = "danaci_yonetim";
const SESSION_DAYS = 14;

function password(): string | undefined {
  const value = process.env.ADMIN_PASSWORD?.trim();
  return value ? value : undefined;
}

/** Panelin kullanılabilir olup olmadığı (şifre tanımlı mı) */
export function isAdminConfigured(): boolean {
  return Boolean(password());
}

function signingKey(): Buffer {
  const secret = process.env.ADMIN_SECRET?.trim() || password() || "";
  return createHash("sha256").update(`danaci-yonetim:${secret}`).digest();
}

function sign(payload: string): string {
  return createHmac("sha256", signingKey()).update(payload).digest("base64url");
}

function safeEqual(a: string, b: string): boolean {
  const left = Buffer.from(a);
  const right = Buffer.from(b);
  return left.length === right.length && timingSafeEqual(left, right);
}

export function checkPassword(candidate: string): boolean {
  const expected = password();
  if (!expected) return false;
  // Uzunluk farkını sızdırmamak için özetleri karşılaştır.
  const hash = (value: string) => createHash("sha256").update(value).digest("hex");
  return safeEqual(hash(candidate), hash(expected));
}

export function createSessionValue(): { value: string; maxAge: number } {
  const maxAge = SESSION_DAYS * 24 * 60 * 60;
  const expires = String(Date.now() + maxAge * 1000);
  return { value: `${expires}.${sign(expires)}`, maxAge };
}

export function isValidSession(value: string | undefined): boolean {
  if (!value || !isAdminConfigured()) return false;
  const [expires, signature] = value.split(".");
  if (!expires || !signature) return false;
  if (!safeEqual(signature, sign(expires))) return false;
  return Number(expires) > Date.now();
}

/** Sunucu bileşeni veya sunucu işleminde oturumu kontrol eder. */
export async function isAdmin(): Promise<boolean> {
  // Oturum süresi saate göre kontrol edilir; sayfa önceden üretilmesin.
  await connection();
  return isValidSession((await cookies()).get(SESSION_COOKIE)?.value);
}

/** Oturum yoksa giriş sayfasına yönlendirir. */
export async function requireAdmin(): Promise<void> {
  if (!(await isAdmin())) redirect("/yonetim/giris");
}
