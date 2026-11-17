"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, MotionConfig, motion } from "framer-motion";
import { CloseIcon, WhatsAppIcon } from "@/components/ui/icons";
import { CAMPAIGN_OPEN_EVENT } from "@/lib/campaign";
import { siteConfig } from "@/lib/site-config";
import { buildWhatsAppUrl } from "@/lib/whatsapp";

const ease = [0.2, 0.8, 0.2, 1] as const;

const list = {
  hidden: {},
  shown: { transition: { staggerChildren: 0.08, delayChildren: 0.2 } },
};
const item = {
  hidden: { opacity: 0, y: 16 },
  shown: { opacity: 1, y: 0, transition: { duration: 0.6, ease } },
};

/**
 * Kampanya kartı: bulanık fotoğraf üzerinde başlık, kısa metin ve maddeler.
 * Sayfa her açıldığında kısa bir gecikmeyle gelir, kapatınca gider.
 * Header'daki bağlantı CAMPAIGN_OPEN_EVENT ile yeniden açar.
 * İçerik siteConfig.campaign'den gelir.
 */
export function CampaignPopup() {
  const { campaign } = siteConfig;
  const [open, setOpen] = useState(false);
  const closeRef = useRef<HTMLButtonElement | null>(null);

  // Sayfa açılınca gel; header'dan istenince yeniden aç.
  useEffect(() => {
    if (!campaign.enabled) return;
    const timer = window.setTimeout(() => setOpen(true), 700);
    const onOpen = () => setOpen(true);
    window.addEventListener(CAMPAIGN_OPEN_EVENT, onOpen);
    return () => {
      window.clearTimeout(timer);
      window.removeEventListener(CAMPAIGN_OPEN_EVENT, onOpen);
    };
  }, [campaign.enabled]);

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    closeRef.current?.focus();
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open]);

  const close = () => setOpen(false);

  return (
    <MotionConfig reducedMotion="user">
      <AnimatePresence>
        {open ? (
          <motion.div
            key="campaign"
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <button
              type="button"
              aria-label="Kampanya kartını kapat"
              tabIndex={-1}
              className="absolute inset-0 cursor-default bg-foreground/50 backdrop-blur-sm"
              onClick={close}
            />

            <motion.div
              role="dialog"
              aria-modal="true"
              aria-labelledby="campaign-title"
              className="relative w-full max-w-lg overflow-hidden bg-foreground text-white shadow-2xl"
              initial={{ opacity: 0, y: 28, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 12, scale: 0.98 }}
              transition={{ duration: 0.55, ease }}
            >
              {/* Bulanık fotoğraf zemini */}
              <motion.div
                aria-hidden="true"
                className="absolute inset-0"
                initial={{ scale: 1.25 }}
                animate={{ scale: 1.12 }}
                transition={{ duration: 6, ease: "easeOut" }}
              >
                {/* Dış kaynaklı fotoğraf; dekoratif, optimize edilmesi gerekmiyor. */}
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={campaign.image.src}
                  alt=""
                  className="h-full w-full object-cover blur-[6px]"
                />
              </motion.div>
              <div
                aria-hidden="true"
                className="absolute inset-0 bg-[linear-gradient(180deg,rgb(20_20_20/0.35)_0%,rgb(20_20_20/0.55)_45%,rgb(20_20_20/0.88)_100%)]"
              />

              <motion.div
                className="relative flex min-h-[32rem] flex-col justify-end p-7 sm:p-10"
                variants={list}
                initial="hidden"
                animate="shown"
              >
                <motion.span
                  variants={item}
                  className="self-start bg-khaki px-3 py-1 text-xs uppercase tracking-label text-white"
                >
                  {campaign.badge}
                </motion.span>
                <motion.h2
                  variants={item}
                  id="campaign-title"
                  className="mt-5 text-5xl font-medium leading-[0.95] tracking-tight sm:text-6xl"
                >
                  {campaign.title}
                </motion.h2>
                <motion.p
                  variants={item}
                  className="mt-5 max-w-sm leading-relaxed text-white/80"
                >
                  {campaign.text}
                </motion.p>

                <motion.ul variants={item} className="mt-6 space-y-2 text-sm text-white/90">
                  {campaign.details.map((detail) => (
                    <li key={detail} className="flex items-start gap-3">
                      <span
                        aria-hidden="true"
                        className="mt-[0.55em] h-px w-4 shrink-0 bg-white/70"
                      />
                      {detail}
                    </li>
                  ))}
                </motion.ul>

                <motion.div variants={item} className="mt-8 flex flex-col gap-3 sm:flex-row">
                  <a
                    href={buildWhatsAppUrl(campaign.whatsappMessage)}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={close}
                    className="flex h-14 w-full shrink-0 items-center justify-center gap-2.5 whitespace-nowrap bg-accent px-4 text-sm font-semibold uppercase tracking-label text-white shadow-lg shadow-black/30 hover:bg-accent-soft sm:h-12 sm:w-auto sm:flex-1 sm:text-xs"
                  >
                    <WhatsAppIcon width={20} height={20} />
                    WhatsApp&apos;tan Bilgi Al
                  </a>
                  <button
                    type="button"
                    onClick={close}
                    className="flex h-14 w-full shrink-0 cursor-pointer items-center justify-center border-2 border-white bg-white/10 px-4 text-sm font-semibold uppercase tracking-label text-white backdrop-blur-sm hover:bg-white/20 sm:h-12 sm:w-auto sm:flex-1 sm:text-xs"
                  >
                    Modellere Göz At
                  </button>
                </motion.div>

                <p className="mt-6 text-[10px] text-white/45">{campaign.image.credit}</p>
              </motion.div>

              <button
                ref={closeRef}
                type="button"
                aria-label="Kapat"
                onClick={close}
                className="absolute right-3 top-3 flex h-10 w-10 cursor-pointer items-center justify-center rounded-full bg-white/15 text-white backdrop-blur hover:bg-white/25"
              >
                <CloseIcon width={20} height={20} />
              </button>
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </MotionConfig>
  );
}
