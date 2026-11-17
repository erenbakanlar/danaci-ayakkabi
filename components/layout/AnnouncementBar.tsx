import { siteConfig } from "@/lib/site-config";

/**
 * Kayan duyuru bandı. Mesaj grubu iki kez basılır ve şerit kendi
 * genişliğinin yarısı kadar kaydırılır; böylece döngü kesintisiz görünür.
 * Kopyalar ekran okuyuculardan gizlenir.
 */
export function AnnouncementBar() {
  // Geniş ekranlarda boşluk kalmaması için mesajlar grup içinde tekrarlanır.
  const group = [...siteConfig.announcements, ...siteConfig.announcements];

  return (
    <div className="flex h-announcement items-center overflow-hidden bg-khaki text-background">
      <div className="flex w-max shrink-0 animate-marquee hover:[animation-play-state:paused]">
        {[0, 1].map((copy) => (
          <ul
            key={copy}
            aria-hidden={copy === 1}
            className="flex shrink-0 items-center"
          >
            {group.map((message, i) => (
              <li
                key={i}
                aria-hidden={i >= siteConfig.announcements.length || undefined}
                className="whitespace-nowrap px-8 text-xs uppercase tracking-label"
              >
                {message}
              </li>
            ))}
          </ul>
        ))}
      </div>
    </div>
  );
}
