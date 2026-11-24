/**
 * Site / monetization config for the canonical subdomain.
 * Fill adsenseClient + adsenseSlot (and optionally gaMeasurementId) after
 * Google approves the site. Leave empty to keep the placeholder banner.
 */
export const SITE_CONFIG = {
  canonicalOrigin: 'https://qmethod.jaquinterob.com',
  /** e.g. ca-pub-xxxxxxxxxxxxxxxx — pégalo cuando AdSense te lo dé */
  adsenseClient: '',
  /** Id del bloque de anuncio (Ad unit) */
  adsenseSlot: '',
  /** e.g. G-XXXXXXXXXX — opcional, para GA4 */
  gaMeasurementId: '',
};

export function adsEnabled(): boolean {
  return Boolean(SITE_CONFIG.adsenseClient && SITE_CONFIG.adsenseSlot);
}
