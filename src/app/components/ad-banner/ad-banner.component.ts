import { AfterViewInit, Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { SITE_CONFIG, adsEnabled } from '../../core/constants/site-config';

declare global {
  interface Window {
    adsbygoogle?: unknown[];
  }
}

@Component({
  selector: 'q-ad-banner',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './ad-banner.component.html',
  styleUrl: './ad-banner.component.css',
})
export class AdBannerComponent implements AfterViewInit {
  readonly enabled = adsEnabled();
  readonly client = SITE_CONFIG.adsenseClient;
  readonly slot = SITE_CONFIG.adsenseSlot;

  ngAfterViewInit(): void {
    if (!this.enabled) {
      return;
    }
    this.ensureScript()
      .then(() => this.pushAd())
      .catch(() => undefined);
  }

  private ensureScript(): Promise<void> {
    const src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${this.client}`;
    const existing = document.querySelector<HTMLScriptElement>(`script[src="${src}"]`);
    if (existing) {
      return Promise.resolve();
    }
    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.async = true;
      script.src = src;
      script.crossOrigin = 'anonymous';
      script.onload = () => resolve();
      script.onerror = () => reject(new Error('AdSense script failed to load'));
      document.head.appendChild(script);
    });
  }

  private pushAd(): void {
    try {
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch {
      // Ad blockers / empty slot — keep layout via CSS min-height.
    }
  }
}
