import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { siteConfig } from "@/lib/site-config";
import { buildWhatsAppUrl } from "@/lib/whatsapp";

const heading = "text-xs uppercase tracking-label text-background/60";
const link =
  "underline-offset-4 decoration-accent-soft hover:underline";

export function Footer() {
  const { contact } = siteConfig;

  return (
    <footer className="mt-auto bg-foreground text-background">
      <Container className="grid gap-12 py-section sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <p className="text-xl font-medium tracking-logo">{siteConfig.name}</p>
          <p className="mt-4 max-w-xs text-sm leading-relaxed text-background/60">
            {siteConfig.description}
          </p>
        </div>

        <nav aria-label="Hızlı linkler">
          <h2 className={heading}>Hızlı Linkler</h2>
          <ul className="mt-5 space-y-3 text-sm">
            {siteConfig.nav.map((item) => (
              <li key={item.href}>
                <Link href={item.href} className={link}>
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div>
          <h2 className={heading}>İletişim</h2>
          <ul className="mt-5 space-y-3 text-sm">
            <li>
              <a
                href={buildWhatsAppUrl()}
                target="_blank"
                rel="noopener noreferrer"
                className={link}
              >
                WhatsApp: {contact.phone}
              </a>
            </li>
            <li>
              <a href={contact.phoneHref} className={link}>
                Telefon: {contact.phone}
              </a>
            </li>
            <li className="text-background/60">
              {contact.address.street}, {contact.address.city}
            </li>
            {contact.hours.map((row) => (
              <li key={row.days} className="text-background/60">
                {row.days}: {row.time}
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h2 className={heading}>Sosyal Medya</h2>
          <ul className="mt-5 space-y-3 text-sm">
            {siteConfig.social.map((item) => (
              <li key={item.href}>
                <a
                  href={item.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={link}
                >
                  {item.label}
                </a>
              </li>
            ))}
          </ul>
        </div>
      </Container>

      <div className="border-t border-background/15">
        <Container className="py-6 text-xs text-background/60">
          © 2026 {siteConfig.fullName}. Tüm hakları saklıdır.
        </Container>
      </div>
    </footer>
  );
}
