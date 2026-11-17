/** Kampanya kartını açmak için sayfa genelinde yayınlanan olay. */
export const CAMPAIGN_OPEN_EVENT = "danaci:open-campaign";

/** Kampanya kartını açar (ör. header'daki bağlantıdan). */
export function openCampaign() {
  window.dispatchEvent(new Event(CAMPAIGN_OPEN_EVENT));
}
