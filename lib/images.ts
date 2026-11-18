/**
 * Next.js görsel optimizasyonundan geçmeyecek görseller:
 * - /media/…: panelden yüklenen, sunucuda zaten boyutlandırılmış WebP'ler
 * - .svg: yer tutucu amblem
 */
export function skipOptimization(src: string): boolean {
  return src.startsWith("/media/") || src.endsWith(".svg");
}
