import fs from "node:fs/promises";
import path from "node:path";
import { UPLOAD_DIR } from "@/lib/server/db";

/**
 * Panelden yüklenen fotoğrafları sunar: /media/<dosya> → storage/uploads/<dosya>
 * Dosya adları her yüklemede benzersiz olduğu için uzun süre önbelleğe alınır.
 */
const TYPES: Record<string, string> = {
  ".webp": "image/webp",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
};

export async function GET(_request: Request, { params }: RouteContext<"/media/[...path]">) {
  const { path: parts } = await params;
  const name = parts.join("/");
  const type = TYPES[path.extname(name).toLowerCase()];

  // Yalnızca uploads klasöründeki düz dosya adları: ../ ile dışarı çıkılamaz.
  if (!type || parts.length !== 1 || !/^[\w.-]+$/.test(name)) {
    return new Response("Bulunamadı", { status: 404 });
  }

  try {
    const data = await fs.readFile(path.join(UPLOAD_DIR, name));
    return new Response(new Uint8Array(data), {
      headers: {
        "Content-Type": type,
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch {
    return new Response("Bulunamadı", { status: 404 });
  }
}
