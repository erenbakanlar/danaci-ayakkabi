import { AnnouncementBar } from "@/components/layout/AnnouncementBar";
import { CampaignPopup } from "@/components/layout/CampaignPopup";
import { FloatingContact } from "@/components/layout/FloatingContact";
import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/layout/Header";
import { LocationSection } from "@/components/layout/LocationSection";

/** Sitenin herkese açık sayfaları: menü, alt bilgi ve iletişim öğeleriyle. */
export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <AnnouncementBar />
      <Header />
      <main className="flex-1">{children}</main>
      <LocationSection />
      <Footer />
      <FloatingContact />
      <CampaignPopup />
    </>
  );
}
