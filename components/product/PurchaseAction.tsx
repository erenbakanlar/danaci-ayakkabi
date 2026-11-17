"use client";

import { useState } from "react";
import { WhatsAppIcon } from "@/components/ui/icons";
import { buildProductMessage, buildWhatsAppUrl } from "@/lib/whatsapp";
import type { Product } from "@/types/product";

interface PurchaseActionProps {
  product: Product;
  /**
   * Seçim dışarıda yapılıyorsa (ör. ana sayfa hero'su) verilir. Verildiğinde
   * bileşen kendi numara seçicisini göstermez, yalnızca butonu basar.
   */
  selection?: { size?: string | null; color?: string | null };
  /** "order": sipariş talebi (varsayılan), "inquiry": bilgi sorusu */
  intent?: "order" | "inquiry";
  label?: string;
  /** Dar kolonlar için daha küçük buton */
  compact?: boolean;
}

/**
 * Sitenin TEK satın alma noktası. Şu an seçilen model, renk ve numarayla
 * hazır mesaj içeren WhatsApp sohbeti açar.
 *
 * E-ticarete geçiş: siteConfig.commerceEnabled true yapıldığında bu bileşenin
 * içi "Sepete ekle" akışıyla değiştirilecek (TODO: sepet henüz yok). Onu
 * çağıran sayfalar ve hero aynı kalır.
 */
export function PurchaseAction({
  product,
  selection,
  intent = "order",
  label = "WhatsApp ile sipariş ver",
  compact = false,
}: PurchaseActionProps) {
  const [pickedSize, setPickedSize] = useState<string | null>(null);
  const [pickedColor, setPickedColor] = useState<string | null>(null);
  const [showSizeError, setShowSizeError] = useState(false);

  const buttonClass = `flex w-full cursor-pointer items-center justify-center bg-accent uppercase tracking-label text-white hover:bg-accent-soft ${
    compact ? "h-12 gap-2 px-3 text-xs" : "h-14 gap-3 px-6 text-sm"
  }`;
  const iconSize = compact ? 18 : 20;

  // Seçim dışarıdan geliyor: sadece buton.
  if (selection) {
    const message = buildProductMessage({
      product,
      size: selection.size,
      color: selection.color,
      intent,
    });

    return (
      <a
        href={buildWhatsAppUrl(message)}
        target="_blank"
        rel="noopener noreferrer"
        className={buttonClass}
      >
        <WhatsAppIcon width={iconSize} height={iconSize} />
        {label}
      </a>
    );
  }

  const inStock = product.variants.some((variant) => variant.stock > 0);

  if (!inStock) {
    return (
      <p className="border border-border px-6 py-4 text-center text-sm uppercase tracking-label text-muted">
        Tükendi
      </p>
    );
  }

  return (
    <div>
      {product.colors.length > 1 ? (
        <fieldset className="mb-8">
          <legend className="text-xs uppercase tracking-label text-muted">
            Renk
          </legend>
          <div className="mt-3 flex flex-wrap gap-2">
            {product.colors.map((name) => (
              <button
                key={name}
                type="button"
                aria-pressed={pickedColor === name}
                onClick={() =>
                  setPickedColor((current) => (current === name ? null : name))
                }
                className={`h-12 border px-4 text-sm ${
                  pickedColor === name
                    ? "border-foreground bg-foreground text-background"
                    : "border-border hover:border-foreground"
                }`}
              >
                {name}
              </button>
            ))}
          </div>
        </fieldset>
      ) : null}

      <fieldset>
        <legend className="text-xs uppercase tracking-label text-muted">
          Numara
        </legend>
        <div className="mt-3 flex flex-wrap gap-2">
          {product.variants.map((variant) => {
            const soldOut = variant.stock === 0;
            const selected = variant.size === pickedSize;

            return (
              <button
                key={variant.sku}
                type="button"
                disabled={soldOut}
                aria-pressed={selected}
                aria-label={soldOut ? `${variant.size} (tükendi)` : variant.size}
                onClick={() => {
                  setPickedSize(variant.size);
                  setShowSizeError(false);
                }}
                className={`h-12 min-w-12 border px-3 text-sm ${
                  selected
                    ? "border-foreground bg-foreground text-background"
                    : "border-border hover:border-foreground"
                } disabled:cursor-not-allowed disabled:border-border disabled:text-muted disabled:line-through disabled:opacity-60`}
              >
                {variant.size}
              </button>
            );
          })}
        </div>
      </fieldset>

      <p role="alert" className="mt-3 min-h-5 text-sm font-medium">
        {showSizeError ? "Lütfen bir numara seçin." : ""}
      </p>

      <button
        type="button"
        onClick={() => {
          if (!pickedSize) {
            setShowSizeError(true);
            return;
          }
          const message = buildProductMessage({
            product,
            size: pickedSize,
            // Tek renkli modelde renk zaten belli.
            color:
              product.colors.length === 1 ? product.colors[0] : pickedColor,
            intent,
          });
          window.open(buildWhatsAppUrl(message), "_blank", "noopener,noreferrer");
        }}
        className={`mt-1 ${buttonClass}`}
      >
        <WhatsAppIcon width={iconSize} height={iconSize} />
        {label}
      </button>
    </div>
  );
}
