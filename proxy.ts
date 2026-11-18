import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * Yönetim paneli için ön kontrol: oturum çerezi yoksa giriş sayfasına
 * yönlendirir. Asıl doğrulama (imza, süre) sayfalarda ve sunucu
 * işlemlerinde yapılır (lib/server/auth.ts).
 */
export function proxy(request: NextRequest) {
  if (!request.cookies.has("danaci_yonetim")) {
    return NextResponse.redirect(new URL("/yonetim/giris", request.url));
  }
  return NextResponse.next();
}

export const config = {
  // Giriş sayfası ve fotoğraf yükleme rotası hariç tüm panel sayfaları
  matcher: ["/yonetim", "/yonetim/((?!giris|api).*)"],
};
