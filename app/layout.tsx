import type { Metadata } from "next";
import { DM_Sans } from "next/font/google";
import { siteConfig } from "@/lib/site-config";
import "./globals.css";

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin", "latin-ext"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: {
    default: siteConfig.fullName,
    template: `%s | ${siteConfig.fullName}`,
  },
  description: siteConfig.description,
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="tr" className={`${dmSans.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col font-sans">
        {children}
      </body>
    </html>
  );
}
