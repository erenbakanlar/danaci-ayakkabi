"use client";

import { useActionState, useRef, useState, useTransition } from "react";
import Link from "next/link";
import { removeProduct, saveProduct, type FormState } from "@/app/yonetim/actions";

export interface PhotoValue {
  src: string;
  card: string;
}

export interface ProductFormValue {
  id: string;
  slug: string;
  name: string;
  category: "kadin" | "erkek";
  subcategory: string;
  price: number;
  compareAtPrice?: number;
  description: string;
  colors: string[];
  sizes: string[];
  photos: PhotoValue[];
  cutout?: string;
  isFeatured: boolean;
  isNew: boolean;
  isActive: boolean;
  sort: number;
}

/** Formda seçilebilen numaralar */
const SIZE_OPTIONS = Array.from({ length: 16 }, (_, i) => String(35 + i));

const input =
  "mt-1.5 h-11 w-full border border-border bg-background px-3 outline-none focus:border-foreground";
const labelText = "text-sm font-medium";
const hint = "mt-1 text-xs text-muted";

function priceText(price?: number): string {
  return price && price > 0 ? String(price).replace(".", ",") : "";
}

async function upload(file: File, kind: "photo" | "cutout") {
  const form = new FormData();
  form.append("file", file);
  form.append("kind", kind);
  const response = await fetch("/yonetim/api/gorsel", { method: "POST", body: form });
  const data = (await response.json().catch(() => ({}))) as {
    error?: string;
    photo?: PhotoValue;
    cutout?: string;
  };
  if (!response.ok) throw new Error(data.error ?? "Fotoğraf yüklenemedi.");
  return data;
}

interface ProductFormProps {
  product?: ProductFormValue;
  subcategories: string[];
}

export function ProductForm({ product, subcategories }: ProductFormProps) {
  const [state, action, pending] = useActionState<FormState, FormData>(saveProduct, {});
  const [, startTransition] = useTransition();
  const [photos, setPhotos] = useState<PhotoValue[]>(product?.photos ?? []);
  const [cutout, setCutout] = useState<string | undefined>(product?.cutout);
  const [uploading, setUploading] = useState<string | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const photoInput = useRef<HTMLInputElement>(null);
  const cutoutInput = useRef<HTMLInputElement>(null);

  const addPhotos = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setUploadError(null);
    const list = Array.from(files);
    for (const [index, file] of list.entries()) {
      setUploading(`Fotoğraf yükleniyor (${index + 1}/${list.length})…`);
      try {
        const { photo } = await upload(file, "photo");
        if (photo) setPhotos((current) => [...current, photo]);
      } catch (error) {
        setUploadError(`${file.name}: ${(error as Error).message}`);
      }
    }
    setUploading(null);
    if (photoInput.current) photoInput.current.value = "";
  };

  const addCutout = async (files: FileList | null) => {
    const file = files?.[0];
    if (!file) return;
    setUploadError(null);
    setUploading("Şeffaf görsel yükleniyor…");
    try {
      const data = await upload(file, "cutout");
      if (data.cutout) setCutout(data.cutout);
    } catch (error) {
      setUploadError((error as Error).message);
    }
    setUploading(null);
    if (cutoutInput.current) cutoutInput.current.value = "";
  };

  const move = (index: number, delta: number) =>
    setPhotos((current) => {
      const next = [...current];
      const target = index + delta;
      if (target < 0 || target >= next.length) return current;
      [next[index], next[target]] = [next[target], next[index]];
      return next;
    });

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_320px]">
      <form
        // JavaScript yüklenmeden gönderilirse yine sunucu işlemine gider.
        action={action}
        className="space-y-8"
        onSubmit={(event) => {
          // Yüklendikten sonra: React, action ile gönderilen formu işlem bitince sıfırlar; hata
          // mesajında kullanıcının yazdıkları kaybolmasın diye elle gönderilir.
          event.preventDefault();
          const data = new FormData(event.currentTarget);
          startTransition(() => action(data));
        }}
      >
        <input type="hidden" name="id" value={product?.id ?? ""} />
        <input type="hidden" name="photos" value={JSON.stringify(photos)} />
        <input type="hidden" name="cutout" value={cutout ?? ""} />

        {/* Fotoğraflar */}
        <section className="border border-border bg-background p-5">
          <h2 className="font-medium">Fotoğraflar</h2>
          <p className={hint}>
            İlk fotoğraf kapak olur ve listelerde görünür. Fotoğraflar otomatik olarak 4:5 oranında
            kırpılır; telefonla dik çekim yeterli.
          </p>

          <ul className="mt-4 grid grid-cols-3 gap-3 sm:grid-cols-4">
            {photos.map((photo, index) => (
              <li key={photo.src} className="relative">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={photo.card}
                  alt=""
                  className="aspect-[4/5] w-full bg-surface object-cover"
                />
                {index === 0 ? (
                  <span className="absolute left-1 top-1 bg-foreground px-1.5 py-0.5 text-[10px] uppercase tracking-label text-background">
                    Kapak
                  </span>
                ) : null}
                <div className="mt-1 flex justify-between gap-1">
                  <button
                    type="button"
                    aria-label="Sola taşı"
                    onClick={() => move(index, -1)}
                    disabled={index === 0}
                    className="h-8 flex-1 cursor-pointer border border-border text-sm disabled:opacity-30"
                  >
                    ←
                  </button>
                  <button
                    type="button"
                    aria-label="Sağa taşı"
                    onClick={() => move(index, 1)}
                    disabled={index === photos.length - 1}
                    className="h-8 flex-1 cursor-pointer border border-border text-sm disabled:opacity-30"
                  >
                    →
                  </button>
                  <button
                    type="button"
                    aria-label="Fotoğrafı kaldır"
                    onClick={() => setPhotos((current) => current.filter((_, i) => i !== index))}
                    className="h-8 flex-1 cursor-pointer border border-border text-sm text-red-700"
                  >
                    ✕
                  </button>
                </div>
              </li>
            ))}
            <li>
              <button
                type="button"
                onClick={() => photoInput.current?.click()}
                disabled={Boolean(uploading)}
                className="flex aspect-[4/5] w-full cursor-pointer flex-col items-center justify-center gap-1 border-2 border-dashed border-border text-sm text-muted hover:border-foreground hover:text-foreground disabled:opacity-50"
              >
                <span className="text-2xl leading-none">+</span>
                Fotoğraf ekle
              </button>
            </li>
          </ul>
          <input
            ref={photoInput}
            type="file"
            accept="image/*"
            multiple
            hidden
            onChange={(event) => addPhotos(event.target.files)}
          />
        </section>

        {/* Bilgiler */}
        <section className="space-y-5 border border-border bg-background p-5">
          <h2 className="font-medium">Bilgiler</h2>

          <label className="block">
            <span className={labelText}>Model adı</span>
            <input name="name" required defaultValue={product?.name} placeholder="Deri Loafer" className={input} />
          </label>

          <label className="block">
            <span className={labelText}>Renkler</span>
            <input
              name="colors"
              defaultValue={product?.colors.join(", ")}
              placeholder="Siyah, Taba"
              className={input}
            />
            <p className={hint}>Virgülle ayırın. Müşteri WhatsApp mesajında renk seçebilir.</p>
          </label>

          <div className="grid gap-5 sm:grid-cols-2">
            <fieldset>
              <legend className={labelText}>Kategori</legend>
              <div className="mt-1.5 flex gap-2">
                {(["kadin", "erkek"] as const).map((value) => (
                  <label
                    key={value}
                    className="flex h-11 flex-1 cursor-pointer items-center justify-center border border-border text-sm has-[:checked]:border-foreground has-[:checked]:bg-foreground has-[:checked]:text-background"
                  >
                    <input
                      type="radio"
                      name="category"
                      value={value}
                      required
                      defaultChecked={(product?.category ?? "kadin") === value}
                      className="sr-only"
                    />
                    {value === "kadin" ? "Kadın" : "Erkek"}
                  </label>
                ))}
              </div>
            </fieldset>

            <label className="block">
              <span className={labelText}>Tür</span>
              <input
                name="subcategory"
                required
                list="subcategories"
                defaultValue={product?.subcategory}
                placeholder="Loafer, Bot, Topuklu…"
                className={input}
              />
              <datalist id="subcategories">
                {subcategories.map((item) => (
                  <option key={item} value={item} />
                ))}
              </datalist>
            </label>
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <label className="block">
              <span className={labelText}>Fiyat (₺)</span>
              <input
                name="price"
                inputMode="decimal"
                defaultValue={priceText(product?.price)}
                placeholder="2.450"
                className={input}
              />
              <p className={hint}>Boş bırakılırsa sitede fiyat görünmez.</p>
            </label>
            <label className="block">
              <span className={labelText}>İndirimsiz fiyat (₺, isteğe bağlı)</span>
              <input
                name="compareAtPrice"
                inputMode="decimal"
                defaultValue={priceText(product?.compareAtPrice)}
                placeholder="2.990"
                className={input}
              />
              <p className={hint}>Doldurulursa sitede üstü çizili gösterilir.</p>
            </label>
          </div>

          <fieldset>
            <legend className={labelText}>Mevcut numaralar</legend>
            <div className="mt-1.5 grid grid-cols-6 gap-2 sm:grid-cols-8">
              {SIZE_OPTIONS.map((size) => (
                <label
                  key={size}
                  className="flex h-10 cursor-pointer items-center justify-center border border-border text-sm has-[:checked]:border-foreground has-[:checked]:bg-foreground has-[:checked]:text-background"
                >
                  <input
                    type="checkbox"
                    name="sizes"
                    value={size}
                    defaultChecked={product?.sizes.includes(size)}
                    className="sr-only"
                  />
                  {size}
                </label>
              ))}
            </div>
            <p className={hint}>47 ve üstü seçilen modeller otomatik olarak “Büyük Numara” bölümünde listelenir.</p>
          </fieldset>

          <label className="block">
            <span className={labelText}>Açıklama</span>
            <textarea
              name="description"
              rows={3}
              defaultValue={product?.description}
              className="mt-1.5 w-full border border-border bg-background p-3 outline-none focus:border-foreground"
            />
          </label>
        </section>

        {/* Görünürlük */}
        <section className="space-y-4 border border-border bg-background p-5">
          <h2 className="font-medium">Sitede görünüm</h2>
          {[
            { name: "isActive", label: "Yayında", text: "Kapalıysa ürün sitede görünmez.", checked: product?.isActive ?? true },
            { name: "isFeatured", label: "Öne çıkan", text: "Ana sayfada “Öne Çıkanlar”da ve hero'da gösterilir.", checked: product?.isFeatured ?? false },
            { name: "isNew", label: "Yeni", text: "Yeni gelen model olarak işaretlenir.", checked: product?.isNew ?? false },
          ].map((item) => (
            <label key={item.name} className="flex cursor-pointer items-start gap-3">
              <input
                type="checkbox"
                name={item.name}
                defaultChecked={item.checked}
                className="mt-0.5 h-5 w-5 accent-[#6B4A2F]"
              />
              <span>
                <span className="block text-sm font-medium">{item.label}</span>
                <span className="block text-xs text-muted">{item.text}</span>
              </span>
            </label>
          ))}
          <label className="block max-w-40">
            <span className={labelText}>Sıra</span>
            <input name="sort" type="number" defaultValue={product?.sort ?? 0} className={input} />
            <p className={hint}>Küçük sayı önce gösterilir.</p>
          </label>
        </section>

        {state.error || uploadError ? (
          <p role="alert" className="border border-red-700/30 bg-red-50 px-4 py-3 text-sm text-red-800">
            {state.error ?? uploadError}
          </p>
        ) : null}

        <div className="sticky bottom-0 flex items-center gap-3 border-t border-border bg-surface/95 py-3 backdrop-blur">
          <button
            type="submit"
            disabled={pending || Boolean(uploading)}
            className="h-12 cursor-pointer bg-accent px-8 text-sm font-medium text-white hover:bg-accent-soft disabled:opacity-60"
          >
            {pending ? "Kaydediliyor…" : "Kaydet"}
          </button>
          <Link href="/yonetim" className="px-3 text-sm text-muted hover:text-foreground">
            Vazgeç
          </Link>
          {uploading ? <span className="text-sm text-muted">{uploading}</span> : null}
        </div>
      </form>

      {/* Yan sütun: hero görseli ve silme */}
      <aside className="space-y-6">
        <section className="border border-border bg-background p-5">
          <h2 className="font-medium">Ana sayfa görseli (isteğe bağlı)</h2>
          <p className={hint}>
            Arka planı silinmiş (şeffaf) PNG. Öne çıkan ürünlerde ana sayfadaki dönen ayakkabılarda
            kullanılır.
          </p>
          <div className="mt-4 flex aspect-[4/3] items-center justify-center bg-[repeating-conic-gradient(#eee_0_25%,#fff_0_50%)] bg-[length:16px_16px]">
            {cutout ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={cutout} alt="" className="max-h-full max-w-full object-contain" />
            ) : (
              <span className="text-xs text-muted">Görsel yok</span>
            )}
          </div>
          <div className="mt-3 flex gap-2">
            <button
              type="button"
              onClick={() => cutoutInput.current?.click()}
              disabled={Boolean(uploading)}
              className="h-10 flex-1 cursor-pointer border border-foreground text-sm hover:bg-surface disabled:opacity-50"
            >
              {cutout ? "Değiştir" : "Yükle"}
            </button>
            {cutout ? (
              <button
                type="button"
                onClick={() => setCutout(undefined)}
                className="h-10 cursor-pointer border border-border px-4 text-sm text-red-700"
              >
                Kaldır
              </button>
            ) : null}
          </div>
          <input
            ref={cutoutInput}
            type="file"
            accept="image/png,image/webp"
            hidden
            onChange={(event) => addCutout(event.target.files)}
          />
        </section>

        {product ? (
          <section className="border border-border bg-background p-5">
            <h2 className="font-medium">Ürün</h2>
            <Link
              href={`/urun/${product.slug}`}
              target="_blank"
              className="mt-3 block text-sm underline underline-offset-4"
            >
              Sitede gör ↗
            </Link>
            <form
              action={removeProduct}
              onSubmit={(event) => {
                if (!window.confirm(`"${product.name}" kalıcı olarak silinsin mi? Bu geri alınamaz.`)) {
                  event.preventDefault();
                }
              }}
              className="mt-5"
            >
              <input type="hidden" name="id" value={product.id} />
              <button
                type="submit"
                className="h-10 w-full cursor-pointer border border-red-700/40 text-sm text-red-700 hover:bg-red-50"
              >
                Ürünü sil
              </button>
            </form>
            <p className={hint}>Geçici olarak gizlemek için “Yayında” işaretini kaldırmanız yeterli.</p>
          </section>
        ) : null}
      </aside>
    </div>
  );
}
