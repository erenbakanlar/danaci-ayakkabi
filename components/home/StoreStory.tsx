"use client";

import Image from "next/image";
import Link from "next/link";
import { MotionConfig, motion } from "framer-motion";
import { Container } from "@/components/ui/Container";
import { mapDirectionsUrl } from "@/lib/maps";

export interface StoreStoryRow {
  id: string;
  image: string;
  imageAlt: string;
  eyebrow: string;
  title: string;
  text: string;
  points: string[];
  link: { label: string; href: string };
}

/** Mağaza içi karelerle anlatılan satırlar. Sırayla görsel sağda / solda. */
const STORE_ROWS: StoreStoryRow[] = [
  {
    id: "bot-ve-gunluk",
    image: "/magaza/magaza-bot-ve-gunluk.webp",
    imageAlt: "Danacı Ayakkabı mağazasında bot ve günlük ayakkabı rafları",
    eyebrow: "Mağazamızdan",
    title: "Her tarza, her mevsime bir model",
    text: "Antalya'daki mağazamızda uzun botlardan kısa botlara, günlük ayakkabılardan rahat comfort serilerine kadar geniş bir seçki sizi bekliyor.",
    points: [
      "Kadın ve erkek koleksiyonları bir arada",
      "Deriden süete, rugandan nubuğa farklı dokular",
      "Denemek için mağazamıza bekleriz",
    ],
    link: { label: "Yol Tarifi Al", href: mapDirectionsUrl },
  },
  {
    id: "topuklu-ve-canta",
    image: "/magaza/magaza-topuklu-ve-canta.webp",
    imageAlt: "Danacı Ayakkabı mağazasında topuklu ayakkabı ve çanta köşesi",
    eyebrow: "Özel günler için",
    title: "Topuklu ve çanta köşemiz",
    text: "Taşlı topuklulardan zarif stilettolara, platform sandaletlerden onlara eşlik eden çantalara kadar davetler ve özel günler için seçilmiş modeller.",
    points: [
      "Taşlı, saten ve rugan topuklu modeller",
      "Ayakkabıya uyumlu çanta seçenekleri",
      "Numara ve model bilgisi için bize yazın",
    ],
    link: { label: "Kadın Koleksiyonu", href: "/kadin" },
  },
];

const ease = [0.2, 0.8, 0.2, 1] as const;

interface StoreStoryProps {
  /** Gösterilecek satırların id'leri; verilmezse hepsi. */
  only?: string[];
}

/**
 * Mağaza içi kareler ve yanında, ekrana girince kayarak beliren açıklama
 * metinleri. Satırlar sırayla görseli sağa ve sola alır.
 * prefers-reduced-motion açıkken kaydırma hareketi yapılmaz.
 */
export function StoreStory({ only }: StoreStoryProps) {
  const rows = only ? STORE_ROWS.filter((row) => only.includes(row.id)) : STORE_ROWS;
  if (rows.length === 0) return null;

  return (
    <MotionConfig reducedMotion="user">
      <section aria-label="Mağazamız" className="border-t border-border">
        <Container className="space-y-section py-section lg:space-y-section-lg lg:py-section-lg">
          {rows.map((row, index) => (
            <StoreRow key={row.id} row={row} imageFirst={index % 2 === 1} />
          ))}
        </Container>
      </section>
    </MotionConfig>
  );
}

function StoreRow({ row, imageFirst }: { row: StoreStoryRow; imageFirst: boolean }) {
  // Metin, görselin karşı tarafından kayarak gelir.
  const fromX = imageFirst ? 40 : -40;
  const external = row.link.href.startsWith("http");

  return (
    <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-20">
      <motion.div
        className={`relative aspect-[4/5] overflow-hidden bg-surface ${imageFirst ? "lg:order-first" : "lg:order-last"}`}
        initial={{ clipPath: "inset(12% 12% 12% 12%)", opacity: 0 }}
        whileInView={{ clipPath: "inset(0% 0% 0% 0%)", opacity: 1 }}
        viewport={{ once: true, amount: 0.3 }}
        transition={{ duration: 1.1, ease }}
      >
        <motion.div
          className="absolute inset-0"
          initial={{ scale: 1.15 }}
          whileInView={{ scale: 1 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 1.6, ease }}
        >
          <Image
            src={row.image}
            alt={row.imageAlt}
            fill
            sizes="(min-width: 1024px) 50vw, 100vw"
            className="object-cover"
          />
        </motion.div>
      </motion.div>

      <motion.div
        initial="hidden"
        whileInView="shown"
        viewport={{ once: true, amount: 0.35 }}
        variants={{ hidden: {}, shown: { transition: { staggerChildren: 0.1 } } }}
        className="max-w-xl"
      >
        {[
          <p key="eyebrow" className="text-xs uppercase tracking-label text-muted">
            {row.eyebrow}
          </p>,
          <h2
            key="title"
            className="mt-4 text-3xl font-medium leading-tight tracking-tight lg:text-5xl"
          >
            {row.title}
          </h2>,
          <p key="text" className="mt-6 text-lg leading-relaxed text-muted">
            {row.text}
          </p>,
          <ul key="points" className="mt-8 divide-y divide-border border-y border-border">
            {row.points.map((point, i) => (
              <li key={point} className="flex gap-4 py-4">
                <span className="w-6 shrink-0 text-xs tabular-nums text-muted">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span>{point}</span>
              </li>
            ))}
          </ul>,
          external ? (
            <a
              key="link"
              href={row.link.href}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-8 inline-flex h-12 items-center bg-accent px-6 text-xs uppercase tracking-label text-white hover:bg-accent-soft"
            >
              {row.link.label}
            </a>
          ) : (
            <Link
              key="link"
              href={row.link.href}
              className="mt-8 inline-flex h-12 items-center bg-accent px-6 text-xs uppercase tracking-label text-white hover:bg-accent-soft"
            >
              {row.link.label}
            </Link>
          ),
        ].map((child) => (
          <motion.div
            key={child.key}
            variants={{
              hidden: { opacity: 0, x: fromX },
              shown: { opacity: 1, x: 0, transition: { duration: 0.8, ease } },
            }}
          >
            {child}
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
}
