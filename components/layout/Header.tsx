"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { CloseIcon, MenuIcon, SearchIcon, WhatsAppIcon } from "@/components/ui/icons";
import { openCampaign } from "@/lib/campaign";
import { siteConfig } from "@/lib/site-config";
import { buildWhatsAppUrl } from "@/lib/whatsapp";

const iconButton =
  "inline-flex h-10 w-10 items-center justify-center rounded-full hover:bg-surface";

const navLink =
  "whitespace-nowrap text-xs uppercase tracking-label underline-offset-8 hover:underline aria-[current=page]:underline xl:text-sm";

const { campaign } = siteConfig;

/** Kampanya bağlantısının önündeki yanıp sönen nokta */
function CampaignDot() {
  return (
    <span aria-hidden="true" className="relative flex h-2 w-2">
      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-khaki opacity-60 motion-reduce:animate-none" />
      <span className="relative inline-flex h-2 w-2 rounded-full bg-khaki" />
    </span>
  );
}

// Masaüstünde kategoriler solda, bilgi sayfaları sağda durur.
const shopNav = siteConfig.nav.filter((item) => item.group === "shop");
const infoNav = siteConfig.nav.filter((item) => item.group === "info");

export function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const pathname = usePathname();

  // Mobil menü açıkken Escape ile kapat ve arka plan kaymasını kilitle.
  useEffect(() => {
    if (!menuOpen) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setMenuOpen(false);
    };
    document.addEventListener("keydown", onKeyDown);
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background">
      <div className="mx-auto grid h-header w-full max-w-site grid-cols-[1fr_auto_1fr] items-center px-gutter lg:h-header-lg lg:px-gutter-lg">
        {/* Sol: menü + arama */}
        <div className="flex items-center gap-1 lg:gap-6 xl:gap-8">
          <button
            type="button"
            className={`${iconButton} -ml-2 lg:hidden`}
            aria-label={menuOpen ? "Menüyü kapat" : "Menüyü aç"}
            aria-expanded={menuOpen}
            aria-controls="mobile-menu"
            onClick={() => setMenuOpen((open) => !open)}
          >
            {menuOpen ? <CloseIcon /> : <MenuIcon />}
          </button>

          <nav aria-label="Ana menü" className="hidden lg:block">
            <ul className="flex items-center gap-6 xl:gap-8">
              {shopNav.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    aria-current={pathname === item.href ? "page" : undefined}
                    className={navLink}
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* TODO: Arama işlevi sonraki adımda eklenecek. */}
          <button type="button" className={iconButton} aria-label="Ara">
            <SearchIcon />
          </button>
        </div>

        {/* Orta: logo */}
        <Link
          href="/"
          aria-label="Danacı Ayakkabı — ana sayfa"
          className="block"
          onClick={() => setMenuOpen(false)}
        >
          {/* Firma logosu (public/magaza/logo.jpg). Beyaz zemini, mix-blend-multiply
              ile header rengine karışır. */}
          <Image
            src="/magaza/logo.jpg"
            alt="Danacı Ayakkabı"
            width={142}
            height={55}
            loading="eager"
            unoptimized
            className="h-11 w-auto mix-blend-multiply lg:h-[52px]"
          />
        </Link>

        {/* Sağ: bilgi sayfaları + WhatsApp */}
        <div className="flex items-center justify-end gap-6 xl:gap-8">
          {campaign.enabled ? (
            <button
              type="button"
              onClick={openCampaign}
              className={`${navLink} hidden cursor-pointer items-center gap-2 lg:inline-flex`}
            >
              <CampaignDot />
              {/* Dar masaüstünde logoya değmesin diye kısa ad */}
              <span className="xl:hidden">{campaign.navLabelShort}</span>
              <span className="hidden xl:inline">{campaign.navLabel}</span>
            </button>
          ) : null}
          <nav aria-label="Bilgi sayfaları" className="hidden lg:block">
            <ul className="flex items-center gap-6 xl:gap-8">
              {infoNav.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    aria-current={pathname === item.href ? "page" : undefined}
                    className={navLink}
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
          <a
            href={buildWhatsAppUrl()}
            target="_blank"
            rel="noopener noreferrer"
            className={`${iconButton} -mr-2`}
            aria-label="WhatsApp'tan yazın"
          >
            <WhatsAppIcon />
          </a>
        </div>
      </div>

      {/* Mobil menü */}
      {menuOpen ? (
        <nav
          id="mobile-menu"
          aria-label="Mobil menü"
          className="absolute inset-x-0 top-full h-[calc(100dvh-100%)] overflow-y-auto border-t border-border bg-background lg:hidden"
        >
          <ul className="px-gutter py-4">
            {campaign.enabled ? (
              <li className="border-b border-border">
                <button
                  type="button"
                  onClick={() => {
                    setMenuOpen(false);
                    openCampaign();
                  }}
                  className="flex w-full cursor-pointer items-center gap-3 py-5 text-left text-lg uppercase tracking-label"
                >
                  <CampaignDot />
                  {campaign.navLabel}
                </button>
              </li>
            ) : null}
            {siteConfig.nav.map((item) => (
              <li key={item.href} className="border-b border-border">
                <Link
                  href={item.href}
                  aria-current={pathname === item.href ? "page" : undefined}
                  className="block py-5 text-lg uppercase tracking-label"
                  onClick={() => setMenuOpen(false)}
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      ) : null}
    </header>
  );
}
