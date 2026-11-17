# Danacı Ayakkabı

1965'ten beri Antalya'da hizmet veren Danacı Ayakkabı'nın vitrin sitesi.
Satış şimdilik WhatsApp üzerinden; yapı ileride e-ticarete geçecek şekilde kuruldu.

Next.js (App Router) · TypeScript · Tailwind CSS · Framer Motion · GSAP

## Çalıştırma

```bash
npm install
npm run dev
```

Site `http://localhost:3000` adresinde açılır.

## Komutlar

| Komut | Ne yapar |
| --- | --- |
| `npm run dev` | Geliştirme sunucusu |
| `npm run build` | Üretim derlemesi |
| `npm run lint` | ESLint |
| `npm run catalog` | `public/products` fotoğraflarından ürün listesini (`lib/product-data.ts`) yeniden üretir |
| `npm run icons` | `public/brand/danaci-logo.svg` amblemden favicon ve uygulama ikonlarını üretir |

## Ürün eklemek

Her model için `public/products` klasörüne aynı adla şu dosyalar konur:

- `<ad>-kart.webp`: ürün kartı (4:5)
- `<ad>-detay.webp`: ürün sayfasındaki büyük görsel (4:5)
- `<ad>-magaza.webp`: mağaza çekimi (4:5)
- `<ad>-seffaf.png`: şeffaf zeminli kesim (ana sayfa hero'su için; WebP'ye çevrilir, PNG depoya eklenmez)

Ad ve renkler dosya adından çıkarılır (ör. `siyah-taba-deri-loafer`). Kadın/erkek ayrımı,
öne çıkanlar ve numaralar `scripts/build-catalog.mjs` içindeki listelerden gelir.
Ardından `npm run catalog` çalıştırılır.

Kameradan gelen ham fotoğraflar `kaynak-fotograflar/` klasörüne konur (depoya eklenmez);
`npm run catalog` bunları küçültüp siteye uygun kopyalarını üretir.

## Önemli dosyalar

- `lib/site-config.ts`: iletişim bilgileri, menü, kampanya kartı, fiyat ve sepet anahtarları
- `lib/products.ts`: sayfaların ürün verisine eriştiği tek yer (ileride e-ticaret API'siyle değişecek)
- `components/product/PurchaseAction.tsx`: WhatsApp sipariş butonu (ileride "Sepete ekle")
- `tailwind.config.ts`: renk ve ölçü token'ları
