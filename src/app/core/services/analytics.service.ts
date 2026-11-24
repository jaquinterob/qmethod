import { Injectable } from '@angular/core';
import { SITE_CONFIG } from '../constants/site-config';

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
  }
}

@Injectable({ providedIn: 'root' })
export class AnalyticsService {
  private loaded = false;

  init(): void {
    const id = SITE_CONFIG.gaMeasurementId;
    if (!id || this.loaded || typeof document === 'undefined') {
      return;
    }
    this.loaded = true;

    window.dataLayer = window.dataLayer || [];
    window.gtag = function gtag(...args: unknown[]) {
      window.dataLayer?.push(args);
    };
    window.gtag('js', new Date());
    window.gtag('config', id);

    const script = document.createElement('script');
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${id}`;
    document.head.appendChild(script);
  }
}
