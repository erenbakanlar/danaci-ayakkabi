/**
 * Site genelindeki sabit bilgiler. Marka adı, iletişim ve menüler
 * buradan okunur; bileşenlere elle yazılmaz.
 *
 * TODO: `url` hâlâ örnek değer; alan adı belli olunca değiştirin.
 */
export const siteConfig = {
  name: "DANACI",
  fullName: "Danacı Ayakkabı",
  description:
    "Danacı Ayakkabı — kadın ve erkek ayakkabı koleksiyonu. Sipariş için WhatsApp'tan yazın.",
  url: "https://www.example.com",

  /**
   * Vitrin / e-ticaret anahtarları. Fiyat verisi Product'ta durur;
   * bu bayraklar yalnızca arayüzde gösterilip gösterilmeyeceğini belirler.
   * - showPrices: fiyatlar (components/product/Price) ve WhatsApp mesajındaki fiyat satırı
   * - commerceEnabled: components/product/PurchaseAction içinde sepet akışı
   */
  showPrices: true as boolean,
  commerceEnabled: false as boolean,

  whatsapp: {
    /** Uluslararası formatta, başında + ve boşluk olmadan: 90XXXXXXXXXX */
    number: "905363030827",
    defaultMessage: "Merhaba, ürünleriniz hakkında bilgi almak istiyorum.",
  },

  contact: {
    phone: "+90 536 303 08 27",
    /** tel: linkleri için boşluksuz hali */
    phoneHref: "tel:+905363030827",
    address: {
      street: "Şehit Binbaşı Caddesi 41/B",
      city: "07010 Antalya",
      /** Google Haritalar aramasında ve yol tarifinde kullanılan metin */
      mapQuery: "Şehit Binbaşı Caddesi 41/B, 07010 Antalya, Türkiye",
    },
    hours: [
      { days: "Hafta içi & Cumartesi", time: "08:30 – 21:00" },
      { days: "Pazar", time: "12:00 – 19:00" },
    ],
  },

  instagram: "https://www.instagram.com/danaci07/?hl=tr",

  social: [
    { label: "Instagram", href: "https://www.instagram.com/danaci07/?hl=tr" },
  ],

  announcements: [
    "Sipariş için WhatsApp'tan yazın",
    "Türkiye'nin her yerine kargo",
    "Yeni sezon koleksiyonu yayında",
  ],

  /** "Büyük Numara" bölümüne girecek en küçük numara */
  largeSizeFrom: 47,

  /**
   * Sayfa her açıldığında gelen kampanya kartı
   * (components/layout/CampaignPopup). Header'daki `navLabel` bağlantısı da
   * kartı yeniden açar. `enabled: false` ile tamamen kapatılır.
   * TODO: metin ve maddeler geçici; kampanya ayrıntıları gelince güncellenecek.
   */
  campaign: {
    enabled: true as boolean,
    navLabel: "Kasım Kampanyaları",
    navLabelShort: "Kampanyalar",
    badge: "Kasım'a özel",
    title: "Dev Kasım İndirimleri",
    text: "Sezonun en sevilen deri modellerinde Kasım'a özel fiyatlar sizi bekliyor.",
    details: [
      "Seçili kadın ve erkek modellerinde indirim",
      "Stoklarla sınırlı fırsatlar",
      "Ayrıntılar ve numara bilgisi için WhatsApp'tan yazın",
    ],
    /**
     * Arka plandaki bulanık fotoğraf. Şimdilik Unsplash'ten (ücretsiz lisans);
     * kendi model fotoğrafınızı public/ altına koyup yolunu buraya yazın.
     */
    image: {
      src: "https://images.unsplash.com/photo-1426649397221-b62c5a7824ee?auto=format&fit=crop&w=1200&q=70",
      credit: "Fotoğraf: Alexander Andrews / Unsplash",
    },
    whatsappMessage:
      "Merhaba, Kasım indirimleriniz hakkında bilgi almak istiyorum.",
  },

  /** group: "shop" header'da solda (kategoriler), "info" sağda durur. */
  nav: [
    { label: "Kadın", href: "/kadin", group: "shop" },
    { label: "Erkek", href: "/erkek", group: "shop" },
    { label: "Büyük Numara", href: "/buyuk-numara", group: "shop" },
    { label: "Hakkımızda", href: "/hakkimizda", group: "info" },
    { label: "İletişim", href: "/iletisim", group: "info" },
  ],
} as const;

export type NavItem = (typeof siteConfig.nav)[number];
