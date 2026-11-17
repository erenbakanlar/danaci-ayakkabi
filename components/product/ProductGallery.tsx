"use client";

import { useState } from "react";
import Image from "next/image";

interface ProductGalleryProps {
  images: string[];
  alt: string;
}

/** Ürün sayfası galerisi: büyük görsel + altında küçük resimler. */
export function ProductGallery({ images, alt }: ProductGalleryProps) {
  const [active, setActive] = useState(0);
  const current = images[active] ?? images[0];

  if (!current) return null;

  return (
    <div>
      <div className="relative aspect-[4/5] overflow-hidden bg-surface">
        <Image
          key={current}
          src={current}
          alt={alt}
          fill
          loading="eager"
          fetchPriority="high"
          sizes="(min-width: 1024px) 50vw, 100vw"
          className="object-cover"
        />
      </div>

      {images.length > 1 ? (
        <ul className="mt-3 flex gap-3">
          {images.map((src, index) => (
            <li key={src}>
              <button
                type="button"
                aria-label={`Görsel ${index + 1}`}
                aria-pressed={index === active}
                onClick={() => setActive(index)}
                className="relative block h-24 w-20 cursor-pointer overflow-hidden bg-surface outline-offset-2 aria-pressed:outline aria-pressed:outline-1 aria-pressed:outline-foreground"
              >
                <Image src={src} alt="" fill sizes="80px" className="object-cover" />
              </button>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
