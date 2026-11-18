import { SESSION_COOKIE, isValidSession } from "@/lib/server/auth";
import { UploadError, saveCutout, saveProductPhoto } from "@/lib/server/uploads";

/**
 * Yönetim paneli fotoğraf yükleme.
 * POST multipart: file=<dosya>, kind="photo" | "cutout"
 * Sunucu işlemleri 1 MB ile sınırlı olduğu için telefon fotoğrafları bu
 * rota üzerinden yüklenir.
 */
export async function POST(request: Request) {
  const session = request.headers
    .get("cookie")
    ?.split(/;\s*/)
    .find((part) => part.startsWith(`${SESSION_COOKIE}=`))
    ?.slice(SESSION_COOKIE.length + 1);

  if (!isValidSession(session ? decodeURIComponent(session) : undefined)) {
    return Response.json({ error: "Oturum süresi doldu, yeniden giriş yapın." }, { status: 401 });
  }

  try {
    const form = await request.formData();
    const file = form.get("file");
    if (!(file instanceof File)) {
      return Response.json({ error: "Dosya seçilmedi." }, { status: 400 });
    }

    if (form.get("kind") === "cutout") {
      return Response.json({ cutout: await saveCutout(file) });
    }
    return Response.json({ photo: await saveProductPhoto(file) });
  } catch (error) {
    if (error instanceof UploadError) {
      return Response.json({ error: error.message }, { status: 400 });
    }
    console.error("Fotoğraf yüklenemedi:", error);
    return Response.json({ error: "Fotoğraf yüklenemedi, tekrar deneyin." }, { status: 500 });
  }
}
