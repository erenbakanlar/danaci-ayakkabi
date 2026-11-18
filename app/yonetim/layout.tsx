import type { Metadata } from "next";
import Link from "next/link";
import { logout } from "@/app/yonetim/actions";

export const metadata: Metadata = {
  title: "Yönetim",
  robots: { index: false, follow: false },
};

/** Yönetim paneli düzeni: sitenin menüsü ve kampanya kartı burada yok. */
export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-full bg-surface/40">
      <header className="sticky top-0 z-30 border-b border-border bg-background">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between gap-4 px-4">
          <Link href="/yonetim" className="flex items-baseline gap-2">
            <span className="font-medium tracking-logo">DANACI</span>
            <span className="text-xs uppercase tracking-label text-muted">Yönetim</span>
          </Link>
          <nav className="flex items-center gap-1 text-sm">
            <Link href="/" target="_blank" className="rounded px-3 py-2 hover:bg-surface">
              Siteyi gör
            </Link>
            <form action={logout}>
              <button type="submit" className="cursor-pointer rounded px-3 py-2 hover:bg-surface">
                Çıkış
              </button>
            </form>
          </nav>
        </div>
      </header>
      <div className="mx-auto max-w-6xl px-4 py-6 lg:py-10">{children}</div>
    </div>
  );
}
