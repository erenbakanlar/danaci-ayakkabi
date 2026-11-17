"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import type { CSSProperties, MouseEvent } from "react";
import gsap from "gsap";

/*
 * Ana sayfa hero'su: marka tanıtımı + süs olarak dönen ayakkabılar.
 *
 * Solda 1965'ten bu yana süren hikâye ve "Modellerimizi İnceleyin" butonu
 * (sayfayı koleksiyona kaydırır), sağda üç kısa güven maddesi, ortada öne
 * çıkan modellerin şeffaf kesimleri. Ayakkabılar birkaç saniyede bir
 * değişir: eskisi yukarı çıkar, yenisi alttan gelir, arka plan tonu ve
 * arkadaki büyük yazı geçiş yapar, üzerinden ışık süpürür. Ayakkabı yavaşça
 * süzülür ve imlece doğru hafifçe eğilir.
 *
 * Hareketi GSAP yürütür. prefers-reduced-motion açıkken ayakkabılar dönmez,
 * süzülmez ve eğilmez; ilk ayakkabı sabit durur.
 * Stiller: components/home/brand-hero.css
 */

export interface HeroSlide {
  id: string;
  /** Şeffaf zeminli kesim */
  image: string;
  /** Ayakkabının arkasındaki büyük yazı, ör. "Loafer" */
  label: string;
}

interface BrandHeroProps {
  slides: HeroSlide[];
  /** "Modellerimizi İnceleyin" butonunun kaydıracağı bölümün id'si */
  collectionId: string;
}

/** Arka plan tonları sırayla: khaki ve accent-soft token'ları */
const TINTS = ["#6E6B4A", "#A9764A"];
/** Ayakkabıların değişme aralığı (ms) */
const INTERVAL = 5000;
/** Yansımanın en yüksek opaklığı */
const REFLECT = 0.22;

const VALUES = [
  {
    title: "Deri kalitesi",
    text: "Her modeli derisinin dokusu, işçiliği ve dayanıklılığıyla seçiyoruz; yıllarca giyilecek ayakkabılar.",
  },
  {
    title: "Altmış yılı aşkın tecrübe",
    text: "1965'ten bu yana doğru modeli ve doğru numarayı müşterilerimizle birlikte buluyoruz.",
  },
  {
    title: "Güvenilir hizmet",
    text: "Mağazada olduğu gibi WhatsApp'ta da birebir ilgileniyor, sorularınızı aynı özenle yanıtlıyoruz.",
  },
];

const prefersReduced = () =>
  typeof window !== "undefined" &&
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const cssVars = (vars: Record<string, string>) => vars as CSSProperties;

interface StageRefs {
  shoes: (HTMLImageElement | null)[];
  words: (HTMLSpanElement | null)[];
  reflections: (HTMLImageElement | null)[];
  sheen: HTMLSpanElement | null;
}

/** Işık bandı ayakkabının üzerinden geçer. */
function sweep(sheen: HTMLSpanElement | null, delay: number) {
  if (!sheen || prefersReduced()) return;
  gsap.fromTo(
    sheen,
    { backgroundPosition: "130% 0%" },
    { backgroundPosition: "-30% 0%", duration: 1.2, ease: "power2.inOut", delay },
  );
}

/** Görünen ayakkabıyı yukarı çıkarır, yenisini alttan getirir. */
function swap(prev: number, next: number, refs: StageRefs) {
  const { shoes, words, reflections } = refs;

  [shoes, words, reflections].forEach((list) =>
    list.forEach((el, i) => {
      if (!el) return;
      gsap.killTweensOf(el);
      if (i !== prev && i !== next) gsap.set(el, { autoAlpha: 0, yPercent: 0, rotation: 0 });
    }),
  );

  if (reflections[prev]) gsap.to(reflections[prev], { autoAlpha: 0, duration: 0.25 });
  if (reflections[next]) {
    gsap.to(reflections[next], { autoAlpha: REFLECT, duration: 0.6, delay: 0.45 });
  }
  if (shoes[prev]) {
    gsap.to(shoes[prev], {
      yPercent: -130,
      rotation: -7,
      autoAlpha: 0,
      duration: 0.5,
      ease: "power2.in",
    });
  }
  if (shoes[next]) {
    gsap.fromTo(
      shoes[next],
      { yPercent: 130, rotation: 9, autoAlpha: 0 },
      {
        yPercent: 0,
        rotation: 0,
        autoAlpha: 1,
        duration: 0.8,
        ease: "back.out(1.3)",
        delay: 0.08,
      },
    );
  }
  if (words[prev]) {
    gsap.to(words[prev], { yPercent: -70, autoAlpha: 0, duration: 0.55, ease: "power2.in" });
  }
  if (words[next]) {
    gsap.fromTo(
      words[next],
      { yPercent: 70, autoAlpha: 0 },
      { yPercent: 0, autoAlpha: 1, duration: 0.9, ease: "power3.out", delay: 0.12 },
    );
  }
  sweep(refs.sheen, 0.6);
}

export function BrandHero({ slides, collectionId }: BrandHeroProps) {
  const count = slides.length;
  const [active, setActive] = useState(0);

  const rootRef = useRef<HTMLElement | null>(null);
  const stageRef = useRef<HTMLDivElement | null>(null);
  const copyRef = useRef<HTMLDivElement | null>(null);
  const valuesRef = useRef<HTMLUListElement | null>(null);
  const shoeRefs = useRef<(HTMLImageElement | null)[]>([]);
  const wordRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const reflectRefs = useRef<(HTMLImageElement | null)[]>([]);
  const reflectWrapRef = useRef<HTMLDivElement | null>(null);
  const floatRef = useRef<HTMLDivElement | null>(null);
  const tiltRef = useRef<HTMLDivElement | null>(null);
  const floorRef = useRef<HTMLSpanElement | null>(null);
  const sheenRef = useRef<HTMLSpanElement | null>(null);
  /** Sahnede şu an görünen ayakkabı */
  const shown = useRef(0);
  /** İmleç hero'nun üzerindeyken dönüş durur */
  const paused = useRef(false);

  // Başlangıçta yalnızca ilk ayakkabı ve yazısı görünür.
  useLayoutEffect(() => {
    shoeRefs.current.forEach(
      (el, i) =>
        el && gsap.set(el, { yPercent: 0, rotation: 0, autoAlpha: i === shown.current ? 1 : 0 }),
    );
    wordRefs.current.forEach(
      (el, i) => el && gsap.set(el, { yPercent: 0, autoAlpha: i === shown.current ? 1 : 0 }),
    );
    reflectRefs.current.forEach(
      (el, i) => el && gsap.set(el, { autoAlpha: i === shown.current ? REFLECT : 0 }),
    );
  }, [count]);

  // Açılış: metinler sırayla yükselir, ayakkabı sahneye gelir.
  useLayoutEffect(() => {
    if (prefersReduced()) return;
    const ctx = gsap.context(() => {
      const copy = copyRef.current ? Array.from(copyRef.current.children) : [];
      const values = valuesRef.current ? Array.from(valuesRef.current.children) : [];
      gsap.from(copy, { y: 28, autoAlpha: 0, duration: 0.9, ease: "power3.out", stagger: 0.1 });
      gsap.from(values, {
        y: 24,
        autoAlpha: 0,
        duration: 0.8,
        ease: "power3.out",
        stagger: 0.12,
        delay: 0.35,
      });
      if (stageRef.current) {
        gsap.from(stageRef.current, {
          y: 40,
          autoAlpha: 0,
          duration: 1.1,
          ease: "power3.out",
          delay: 0.15,
        });
      }
    }, rootRef);
    sweep(sheenRef.current, 1.1);
    return () => ctx.revert();
  }, []);

  // Ayakkabılar sırayla değişir (hero görünürken, imleç üzerinde değilken).
  useEffect(() => {
    const root = rootRef.current;
    if (!root || count < 2 || prefersReduced()) return;

    let visible = true;
    const io = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
    });
    io.observe(root);

    const timer = window.setInterval(() => {
      if (!visible || paused.current || document.hidden) return;
      const prev = shown.current;
      const next = (prev + 1) % count;
      shown.current = next;
      swap(prev, next, {
        shoes: shoeRefs.current,
        words: wordRefs.current,
        reflections: reflectRefs.current,
        sheen: sheenRef.current,
      });
      setActive(next);
    }, INTERVAL);

    return () => {
      window.clearInterval(timer);
      io.disconnect();
    };
  }, [count]);

  // Bölüm ekrandayken yavaş süzülme.
  useEffect(() => {
    const wrap = floatRef.current;
    const floor = floorRef.current;
    const root = rootRef.current;
    if (!wrap || !floor || !root || prefersReduced()) return;

    const tl = gsap.timeline({
      repeat: -1,
      yoyo: true,
      defaults: { duration: 2.6, ease: "sine.inOut" },
    });
    tl.to(wrap, { y: "-1.2cqw" }, 0).to(floor, { scaleX: 0.88, opacity: 0.65 }, 0);
    if (reflectWrapRef.current) tl.to(reflectWrapRef.current, { y: "1.2cqw" }, 0);

    const io = new IntersectionObserver(([entry]) =>
      entry.isIntersecting ? tl.resume() : tl.pause(),
    );
    io.observe(root);
    return () => {
      io.disconnect();
      tl.kill();
    };
  }, []);

  // Ayakkabı hassas imlece doğru hafifçe eğilir; arka plan parıltısı onu izler.
  useEffect(() => {
    const root = rootRef.current;
    const tilt = tiltRef.current;
    const floor = floorRef.current;
    if (
      !root ||
      !tilt ||
      !floor ||
      prefersReduced() ||
      !window.matchMedia("(pointer: fine)").matches
    ) {
      return;
    }

    gsap.set(tilt, { transformPerspective: 1100 });
    const ry = gsap.quickTo(tilt, "rotationY", { duration: 0.8, ease: "power3.out" });
    const rx = gsap.quickTo(tilt, "rotationX", { duration: 0.8, ease: "power3.out" });
    const fx = gsap.quickTo(floor, "x", { duration: 0.9, ease: "power3.out" });
    const glow = { x: 0, y: 0 };
    const drift = (x: number, y: number) =>
      gsap.to(glow, {
        x,
        y,
        duration: 1,
        ease: "power3.out",
        overwrite: true,
        onUpdate: () => {
          root.style.setProperty("--mx", `${glow.x.toFixed(2)}%`);
          root.style.setProperty("--my", `${glow.y.toFixed(2)}%`);
        },
      });

    const onMove = (event: PointerEvent) => {
      if (event.pointerType !== "mouse" && event.pointerType !== "pen") return;
      const rect = (stageRef.current ?? root).getBoundingClientRect();
      const nx = Math.max(-1, Math.min(1, ((event.clientX - rect.left) / rect.width) * 2 - 1));
      const ny = Math.max(-1, Math.min(1, ((event.clientY - rect.top) / rect.height) * 2 - 1));
      ry(nx * 10);
      rx(-ny * 6);
      fx(-nx * 14);
      drift(nx * 8, ny * 6);
    };
    const onLeave = () => {
      ry(0);
      rx(0);
      fx(0);
      drift(0, 0);
    };

    root.addEventListener("pointermove", onMove);
    root.addEventListener("pointerleave", onLeave);
    return () => {
      root.removeEventListener("pointermove", onMove);
      root.removeEventListener("pointerleave", onLeave);
      gsap.killTweensOf(glow);
    };
  }, []);

  const scrollToCollection = (event: MouseEvent<HTMLAnchorElement>) => {
    const target = document.getElementById(collectionId);
    if (!target) return;
    event.preventDefault();
    target.scrollIntoView({ behavior: prefersReduced() ? "auto" : "smooth" });
  };

  return (
    <section
      ref={rootRef}
      className="bh-root"
      aria-labelledby="hero-heading"
      onPointerEnter={() => {
        paused.current = true;
      }}
      onPointerLeave={() => {
        paused.current = false;
      }}
    >
      {slides.map((slide, i) => (
        <span
          key={slide.id}
          className="bh-bg"
          data-on={i === active}
          style={cssVars({ "--t": TINTS[i % TINTS.length] })}
          aria-hidden="true"
        />
      ))}

      <div className="bh-body">
        <div className="bh-copy" ref={copyRef}>
          <p className="bh-eyebrow">
            <span className="bh-year">1965</span>
            <span>&apos;ten beri · Antalya</span>
          </p>
          <h1 className="bh-title" id="hero-heading">
            Altmış yılı aşkın özen, her adımda.
          </h1>
          <p className="bh-lead">
            Danacı Ayakkabı 1965&apos;ten bu yana kaliteli deri ayakkabıyı
            müşterileriyle buluşturuyor. Rahatlığına, işçiliğine ve
            dayanıklılığına güvendiğimiz modelleri seçiyor; aldığınız her
            çiftin arkasında duruyoruz.
          </p>
          <a href={`#${collectionId}`} className="bh-cta" onClick={scrollToCollection}>
            Modellerimizi İnceleyin
            <svg
              viewBox="0 0 24 24"
              width="18"
              height="18"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M12 5v14M6 13l6 6 6-6" />
            </svg>
          </a>
        </div>

        {/* Süs: dönen ayakkabılar */}
        <div className="bh-stage" ref={stageRef} aria-hidden="true">
          {slides.map((slide, i) => (
            <span
              key={slide.id}
              ref={(el) => {
                wordRefs.current[i] = el;
              }}
              className="bh-word"
              style={{
                ...cssVars({ "--t": TINTS[i % TINTS.length] }),
                visibility: i === 0 ? "visible" : "hidden",
              }}
            >
              {slide.label}
            </span>
          ))}
          <span className="bh-floor" ref={floorRef} />
          <div className="bh-reflects" ref={reflectWrapRef}>
            {slides.map((slide, i) => (
              // GSAP ile hareket eden, maskeyle aynı URL'yi paylaşan katmanlı
              // görseller; next/image burada uygun değil.
              // eslint-disable-next-line @next/next/no-img-element
              <img
                key={slide.id}
                ref={(el) => {
                  reflectRefs.current[i] = el;
                }}
                className="bh-shoe bh-reflect"
                src={slide.image}
                alt=""
                draggable={false}
                loading={i === 0 ? "eager" : "lazy"}
                decoding="async"
                style={{ visibility: i === 0 ? "visible" : "hidden" }}
              />
            ))}
          </div>
          <div className="bh-float" ref={floatRef}>
            <div className="bh-tilt" ref={tiltRef}>
              {slides.map((slide, i) => (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  key={slide.id}
                  ref={(el) => {
                    shoeRefs.current[i] = el;
                  }}
                  className="bh-shoe"
                  src={slide.image}
                  alt=""
                  draggable={false}
                  loading={i === 0 ? "eager" : "lazy"}
                  fetchPriority={i === 0 ? "high" : undefined}
                  decoding="async"
                  style={{ visibility: i === 0 ? "visible" : "hidden" }}
                />
              ))}
              <span
                className="bh-shoe bh-sheen"
                ref={sheenRef}
                style={{
                  WebkitMaskImage: `url("${slides[active]?.image}")`,
                  maskImage: `url("${slides[active]?.image}")`,
                }}
              />
            </div>
          </div>
        </div>

        <ul className="bh-values" ref={valuesRef}>
          {VALUES.map((value, i) => (
            <li key={value.title} className="bh-value">
              <span className="bh-num" aria-hidden="true">
                {String(i + 1).padStart(2, "0")}
              </span>
              <div>
                <h2 className="bh-value-title">{value.title}</h2>
                <p className="bh-value-text">{value.text}</p>
              </div>
            </li>
          ))}
        </ul>
      </div>

      <a
        href={`#${collectionId}`}
        className="bh-scroll"
        onClick={scrollToCollection}
        aria-label="Koleksiyona in"
      >
        <span>Koleksiyon</span>
        <span className="bh-scroll-line" aria-hidden="true" />
      </a>
    </section>
  );
}
