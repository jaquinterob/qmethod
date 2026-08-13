import { Injectable, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class MotionPreference {
  private readonly mq =
    typeof matchMedia !== 'undefined' ? matchMedia('(prefers-reduced-motion: reduce)') : null;

  readonly reduced = signal(this.mq?.matches ?? false);

  constructor() {
    this.mq?.addEventListener('change', (event) => this.reduced.set(event.matches));
  }
}
