# Danacı Ayakkabı

1965'ten beri Antalya'da hizmet veren Danacı Ayakkabı'nın vitrin sitesi.
Satış şimdilik WhatsApp üzerinden; yapı ileride e-ticarete geçecek şekilde kuruldu.

Next.js (App Router) · TypeScript · Tailwind CSS · Framer Motion · GSAP · SQLite (`node:sqlite`)

Node.js **22.13 veya üstü** gerekir (yerleşik SQLite için). Sunucuda Node 24 kullanılıyor.

## Çalıştırma

```bash
npm install
cp .env.example .env.local   # ADMIN_PASSWORD'u doldurun
npm run dev
```

Site `http://localhost:3000`, yönetim paneli `http://localhost:3000/yonetim` adresinde açılır.

## Yönetim paneli (`/yonetim`)

Ürün ekleme, düzenleme, silme; fiyat, fotoğraf, renk, numara ve yayın durumu buradan yönetilir.
Panelde kaydedilen değişiklik sitede birkaç saniye içinde görünür.

- **Giriş:** tek şifre, `ADMIN_PASSWORD` ortam değişkeninden. Şifre değişince açık oturumlar kapanır.
- **Toplu fiyat:** ürün listesinde fiyatlar doğrudan yazılıp “Fiyatları kaydet” ile tek seferde kaydedilir.
  Türkçe yazım kabul edilir: `2.450`, `2.199,90`.
- **İndirim:** her üründe “Normal fiyat” ve isteğe bağlı “İndirimli fiyat” var. İndirimli fiyat
  girilirse sitede normal fiyat üstü çizili, yanında indirimli fiyat ve görselin sol üst köşesinde
  kırmızı çerçeveli indirim yüzdesi görünür. İndirimli fiyat, normal fiyat olmadan kaydedilmez ve
  normal fiyattan düşük olmalıdır.
- **Fotoğraflar:** telefondan yüklenebilir; otomatik 4:5 kırpılır ve WebP'ye çevrilir.
  İlk fotoğraf kapak olur. İsteğe bağlı şeffaf PNG, ana sayfadaki dönen ayakkabılarda kullanılır.
- **Numaralar:** 47 ve üstü seçilen modeller otomatik olarak “Büyük Numara” bölümüne girer.
- **Fiyatsız ürün:** fiyatı boş olan üründe sitede fiyat görünmez.

### Veri nerede?

`storage/` klasöründe (depoya eklenmez, git çekmelerinde silinmez):

- `storage/danaci.db`: SQLite veritabanı
- `storage/uploads/`: panelden yüklenen fotoğraflar (`/media/<dosya>` adresinden sunulur)

Veritabanı ilk açıldığında boşsa `lib/product-data.ts`'deki ürünlerle doldurulur.
**Yedek:** `storage/` klasörünü kopyalamak yeterli. Konum `DANACI_DATA_DIR` ile değiştirilebilir.

## Plesk'e kurulum

1. **Node.js** ayarları: sürüm 24, mod `production`, başlatma dosyası `server.js`,
   belge kökü `<uygulama kökü>/public`.
2. **Ortam değişkenleri:** `ADMIN_PASSWORD` = panel şifresi (güçlü bir şifre seçin).
3. **Git > Ek dağıtım eylemleri** (her çekmeden sonra kendiliğinden çalışır):

   ```bash
   export PATH=/opt/plesk/node/24/bin:$PATH
   npm install
   npm run build
   mkdir -p tmp && touch tmp/restart.txt
   ```

## Komutlar

| Komut | Ne yapar |
| --- | --- |
| `npm run dev` | Geliştirme sunucusu |
| `npm run build` | Üretim derlemesi |
| `npm run lint` | ESLint |
| `npm run catalog` | `public/products` fotoğraflarından başlangıç ürün listesini (`lib/product-data.ts`) üretir |
| `npm run icons` | `public/brand/danaci-logo.svg` amblemden favicon ve uygulama ikonlarını üretir |
| `npm run plesk:check` / `build:plesk` | Plesk'te Node sürümü sorununa karşı yedek komutlar |

## Başlangıç ürün listesi

Yeni ürünler artık panelden eklenir. `npm run catalog` yalnızca veritabanı boşken kullanılan
başlangıç listesini üretir: `public/products` klasöründeki `<ad>-kart.webp`, `<ad>-detay.webp`,
`<ad>-magaza.webp` ve `<ad>-seffaf.png` dosyalarından. Ham kamera fotoğrafları
`kaynak-fotograflar/` klasörüne konur (depoya eklenmez).

Listeye sonradan yeni bir fotoğraf partisi eklenirse (`npm run catalog` yeni ürünleri
sona ekler), sunucu açılışta **yalnızca yeni ürünleri** mevcut veritabanına aktarır;
panelde düzenlenen ya da silinen eski ürünlere dokunulmaz.

## Önemli dosyalar

- `lib/site-config.ts`: iletişim bilgileri, menü, kampanya kartı, fiyat ve sepet anahtarları
- `lib/products.ts`: sitenin ürün verisine eriştiği tek yer (önbellekli; ileride e-ticaret API'siyle değişebilir)
- `lib/server/`: veritabanı, ürün işlemleri, panel girişi, fotoğraf yükleme
- `app/yonetim/`: yönetim paneli
- `components/product/PurchaseAction.tsx`: WhatsApp sipariş butonu (ileride "Sepete ekle")
- `tailwind.config.ts`: renk ve ölçü token'ları
