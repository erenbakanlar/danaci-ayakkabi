import type { SVGProps } from "react";

/**
 * Danacı logosu: "Da" amblemi (kalın D, sol alt köşede içinde "a" olan kare)
 * ve devamında ANACI. Vektör çizim; rengi `currentColor`'dan alır, "a"
 * harfi zemine açılan bir boşluktur. Böylece açık ve koyu zeminde aynı
 * dosya kullanılır.
 *
 * Harfler 52 birim yüksekliğinde, kalınlık 11 birim (y: 6–58).
 */
export function Logo({
  title = "Danacı Ayakkabı",
  ...props
}: SVGProps<SVGSVGElement> & { title?: string }) {
  return (
    <svg viewBox="0 0 260 64" role="img" aria-label={title} {...props}>
      <defs>
        <mask id="danaci-logo-mask" maskUnits="userSpaceOnUse" x="0" y="0" width="260" height="64">
          <rect width="260" height="64" fill="#fff" />
          {/* D'nin iç boşluğu ve köşedeki karenin çevresindeki boşluk */}
          <path d="M14 16H24C34.5 16 41 22.5 41 32S34.5 47 24 47H14Z" fill="#000" />
          <rect x="0" y="44" width="16" height="16" fill="#000" />
          {/* A harflerinin iç üçgenleri */}
          <path d="M77 37h8l-4-12.5Z M168 37h8l-4-12.5Z" fill="#000" />
        </mask>
        <mask id="danaci-logo-a" maskUnits="userSpaceOnUse" x="0" y="0" width="20" height="64">
          <rect width="20" height="64" fill="#fff" />
          <g fill="none" stroke="#000" strokeWidth="1.7" strokeLinecap="round">
            <path d="M5.3 50.7C5.7 49.4 6.7 48.8 7.9 48.8C9.3 48.8 10 49.6 10 51V56.3" />
            <ellipse cx="7.6" cy="54.2" rx="2.3" ry="1.85" />
          </g>
        </mask>
      </defs>

      <g fill="currentColor">
        <g mask="url(#danaci-logo-mask)">
          {/* D */}
          <path d="M2 6H25C41 6 52 16.5 52 32S41 58 25 58H2Z" />
          {/* A */}
          <path d="M59 58 76 6h10l17 52H91.5l-3.4-10.5H73.9L70.5 58Z" />
          {/* N */}
          <path d="M108 6h11l19 31.5V6h11v52h-11l-19-31.5V58h-11Z" />
          {/* A */}
          <path d="M150 58 167 6h10l17 52h-11.5l-3.4-10.5h-14.2l-3.4 10.5Z" />
        </g>
        {/* Köşedeki kare, içinde "a" */}
        <rect x="2" y="46" width="12" height="12" mask="url(#danaci-logo-a)" />
        {/* C */}
        <path
          d="M239.5 17.5A20.5 20.5 0 1 0 239.5 46.5"
          fill="none"
          stroke="currentColor"
          strokeWidth="11"
        />
        {/* I */}
        <rect x="247" y="6" width="11" height="52" />
      </g>
    </svg>
  );
}
