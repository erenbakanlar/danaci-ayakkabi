import { siteConfig } from "@/lib/site-config";

const query = encodeURIComponent(siteConfig.contact.address.mapQuery);

/** API anahtarı gerektirmeyen gömülü Google Haritalar adresi. */
export const mapEmbedUrl = `https://www.google.com/maps?q=${query}&hl=tr&z=16&output=embed`;

/** Google Haritalar'da mağazaya yol tarifi açar. */
export const mapDirectionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${query}`;
