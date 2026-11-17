"use client";

import { MotionConfig, motion } from "framer-motion";
import { Container } from "@/components/ui/Container";
import { PinIcon, WhatsAppIcon } from "@/components/ui/icons";
import { mapDirectionsUrl, mapEmbedUrl } from "@/lib/maps";
import { siteConfig } from "@/lib/site-config";
import { buildWhatsAppUrl } from "@/lib/whatsapp";

const ease = [0.2, 0.8, 0.2, 1] as const;

const list = {
  hidden: {},
  shown: { transition: { staggerChildren: 0.08 } },
};
const item = {
  hidden: { opacity: 0, y: 18 },
  shown: { opacity: 1, y: 0, transition: { duration: 0.6, ease } },
};

/**
 * Footer'ın hemen üstündeki "Adresimiz" bölümü: adres, çalışma saatleri ve
 * gömülü Google Haritalar. Ekrana girince bir kez açılır; metinler sırayla
 * yükselir, harita perdesi soldan sağa açılır. prefers-reduced-motion açıkken
 * kaydırma ve perde hareketi yapılmaz.
 */
export function LocationSection() {
  const { contact } = siteConfig;

  return (
    <MotionConfig reducedMotion="user">
      <section
        aria-labelledby="location-heading"
        className="border-t border-border bg-surface"
      >
        <Container className="grid items-center gap-10 py-section lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:gap-16 lg:py-section-lg">
          <motion.div
            variants={list}
            initial="hidden"
            whileInView="shown"
            viewport={{ once: true, amount: 0.3 }}
          >
            <motion.p
              variants={item}
              className="text-xs uppercase tracking-label text-muted"
            >
              Mağazamız
            </motion.p>
            <motion.h2
              variants={item}
              id="location-heading"
              className="mt-3 text-3xl font-medium tracking-tight lg:text-4xl"
            >
              Adresimiz
            </motion.h2>

            <motion.address
              variants={item}
              className="mt-8 flex gap-3 text-lg not-italic leading-snug"
            >
              <PinIcon className="mt-0.5 shrink-0" />
              <span>
                {contact.address.street}
                <br />
                {contact.address.city}
              </span>
            </motion.address>

            <motion.dl
              variants={item}
              className="mt-8 divide-y divide-border border-y border-border text-sm"
            >
              {contact.hours.map((row) => (
                <div key={row.days} className="flex justify-between gap-6 py-3">
                  <dt className="text-muted">{row.days}</dt>
                  <dd className="tabular-nums">{row.time}</dd>
                </div>
              ))}
              <div className="flex justify-between gap-6 py-3">
                <dt className="text-muted">Telefon</dt>
                <dd>
                  <a
                    href={contact.phoneHref}
                    className="tabular-nums underline-offset-4 decoration-accent hover:underline"
                  >
                    {contact.phone}
                  </a>
                </dd>
              </div>
            </motion.dl>

            <motion.div variants={item} className="mt-8 flex flex-wrap gap-3">
              <a
                href={mapDirectionsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-12 items-center justify-center bg-accent px-6 text-xs uppercase tracking-label text-white hover:bg-accent-soft"
              >
                Yol Tarifi Al
              </a>
              <a
                href={buildWhatsAppUrl()}
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-12 items-center justify-center gap-2 border border-foreground px-6 text-xs uppercase tracking-label hover:bg-background"
              >
                <WhatsAppIcon width={18} height={18} />
                WhatsApp&apos;tan Yaz
              </a>
            </motion.div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.25 }}
            transition={{ duration: 0.8, ease }}
            className="relative aspect-[4/3] overflow-hidden border border-border bg-background lg:aspect-[16/11]"
          >
            <iframe
              src={mapEmbedUrl}
              title={`${siteConfig.fullName} konumu — Google Haritalar`}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              className="absolute inset-0 h-full w-full border-0 saturate-[0.75] transition-[filter] duration-500 hover:saturate-100"
            />
            {/* Açılış perdesi: haritanın üstünden sağa doğru çekilir. */}
            <motion.span
              aria-hidden="true"
              initial={{ scaleX: 1 }}
              whileInView={{ scaleX: 0 }}
              viewport={{ once: true, amount: 0.25 }}
              transition={{ duration: 0.9, ease, delay: 0.15 }}
              className="pointer-events-none absolute inset-0 origin-right bg-surface"
            />
          </motion.div>
        </Container>
      </section>
    </MotionConfig>
  );
}
