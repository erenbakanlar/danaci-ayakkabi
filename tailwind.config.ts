import type { Config } from "tailwindcss";

/**
 * Tasarım token'ları. Tailwind v4 bu dosyayı app/globals.css içindeki
 * `@config` satırı üzerinden yükler.
 */
const config: Config = {
  theme: {
    extend: {
      colors: {
        // Sitede yalnızca bu token'lar kullanılır.
        // Kural: khaki ve accent metin rengi olarak kullanılmaz.
        background: "#FAF8F4", // sayfa zemini
        surface: "#F0EBE3", // kart / görsel zemini, hover
        border: "#E2DCD2", // ince ayırıcı çizgiler
        foreground: "#141414", // ana metin, footer zemini
        muted: "#6F6A62", // ikincil metin
        accent: {
          DEFAULT: "#6B4A2F", // ana butonlar, link vurgusu
          soft: "#A9764A", // hover, detay
        },
        khaki: "#6E6B4A", // rozet, duyuru bandı, hero arka plan tonu
      },
      fontFamily: {
        sans: ["var(--font-dm-sans)", "system-ui", "sans-serif"],
      },
      spacing: {
        gutter: "1.25rem", // mobil yatay boşluk
        "gutter-lg": "2.5rem", // masaüstü yatay boşluk
        section: "4rem", // mobil bölüm arası dikey boşluk
        "section-lg": "7rem", // masaüstü bölüm arası dikey boşluk
        announcement: "2.25rem", // duyuru bandı yüksekliği
        header: "4rem", // mobil header yüksekliği
        "header-lg": "5rem", // masaüstü header yüksekliği
      },
      maxWidth: {
        site: "90rem",
      },
      letterSpacing: {
        logo: "0.3em",
        label: "0.14em",
      },
      keyframes: {
        marquee: {
          from: { transform: "translateX(0)" },
          to: { transform: "translateX(-50%)" },
        },
      },
      animation: {
        marquee: "marquee 40s linear infinite",
      },
    },
  },
};

export default config;
