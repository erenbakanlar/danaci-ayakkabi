import { InstagramIcon, WhatsAppIcon } from "@/components/ui/icons";
import { siteConfig } from "@/lib/site-config";
import { buildWhatsAppUrl } from "@/lib/whatsapp";

const button =
  "flex h-12 w-12 items-center justify-center rounded-full text-white shadow-md transition-[transform,filter] hover:scale-105 hover:brightness-110";

/**
 * Her sayfada sağ altta duran sabit iletişim butonları. Platformların kendi
 * renklerini kullanır (sitenin renk token'larının bilinçli istisnası).
 * Galeri penceresi (z-60) ve header (z-40) bunların üstünde kalır.
 */
export function FloatingContact() {
  return (
    <div className="fixed bottom-4 right-4 z-30 flex flex-col gap-3 lg:bottom-6 lg:right-6">
      <a
        href={siteConfig.instagram}
        target="_blank"
        rel="noopener noreferrer"
        className={`${button} bg-[radial-gradient(circle_at_30%_107%,#fdf497_0%,#fdf497_5%,#fd5949_45%,#d6249f_60%,#285AEB_90%)]`}
        aria-label="Instagram'da takip edin"
      >
        <InstagramIcon width={22} height={22} strokeWidth={1.8} />
      </a>
      <a
        href={buildWhatsAppUrl()}
        target="_blank"
        rel="noopener noreferrer"
        className={`${button} bg-[#25D366]`}
        aria-label="WhatsApp'tan yazın"
      >
        <WhatsAppIcon width={24} height={24} />
      </a>
    </div>
  );
}
