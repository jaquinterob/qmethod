import { Component, computed, effect, inject, signal } from '@angular/core';
import {
  animate,
  keyframes,
  query,
  stagger,
  style,
  transition,
  trigger,
} from '@angular/animations';
import { GameService } from '../../core/services/game.service';
import { MotionPreference } from '../../core/services/motion-preference.service';
import { FeedbackComponent } from '../feedback/feedback.component';
import { DUR, EASE, T } from '../../shared/motion-tokens';

@Component({
  selector: 'q-home',
  standalone: true,
  imports: [FeedbackComponent],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css',
  animations: [
    trigger('stepsAnim', [
      transition('* => *', [
        query(
          ':enter',
          [
            style({ opacity: 0, transform: 'translateY(8px) scale(0.9)' }),
            stagger(40, animate(T.enter, style({ opacity: 1, transform: 'none' }))),
          ],
          { optional: true }
        ),
      ]),
    ]),
    trigger('chipDone', [
      transition('* => done', [
        animate(T.bounce, style({ transform: 'scale(1.2)' })),
        animate(`${DUR.fast} ${EASE.out}`, style({ transform: 'scale(1)' })),
      ]),
    ]),
    trigger('fadeInUp', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(12px)' }),
        animate(T.panel, style({ opacity: 1, transform: 'none' })),
      ]),
    ]),
    trigger('feedback', [
      transition(':enter', [style({ opacity: 0 }), animate(T.panel, style({ opacity: 1 }))]),
      transition(':leave', [animate(T.exit, style({ opacity: 0 }))]),
    ]),
    trigger('fire', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(40px)' }),
        animate(T.panel, style({ opacity: 1, transform: 'none' })),
      ]),
    ]),
    trigger('failShake', [
      transition('* => *', [
        animate(
          `${DUR.base} ${EASE.out}`,
          keyframes([
            style({ transform: 'translateX(-12px)' }),
            style({ transform: 'translateX(11px)' }),
            style({ transform: 'translateX(-8px)' }),
            style({ transform: 'translateX(6px)' }),
            style({ transform: 'translateX(-4px)' }),
            style({ transform: 'translateX(3px)' }),
            style({ transform: 'none' }),
          ])
        ),
      ]),
    ]),
  ],
})
export class HomeComponent {
  readonly game = inject(GameService);
  readonly motion = inject(MotionPreference);

  readonly darkMode = signal(this.loadTheme());

  constructor() {
    effect(() => {
      document.body.classList.toggle('light', !this.darkMode());
    });
  }

  readonly progressPercent = computed(() => Math.round(this.game.progress() * 100));

  readonly summaryLine = computed(() => {
    const errors = this.game.failAttempts();
    const blocks = this.game.punishments();
    if (errors === 0 && blocks === 0) {
      return '¡Perfecto! ¡Te superaste a ti mismo! 🌟';
    }
    const faults = errors + blocks;
    if (faults === 1) {
      return '¡Lo lograste! ¡Un pequeño tropiezo no te detuvo! 💪';
    }
    return `¡Lo lograste con ${faults} fallos! ¡Cada intento te hace más fuerte! 🎯`;
  });

  good(): void {
    this.game.goodAnswer();
  }

  bad(): void {
    this.game.badAnswer();
  }

  toggleTheme(): void {
    this.darkMode.update((v) => !v);
    this.applyTheme();
    localStorage.setItem('qmethod:theme', this.darkMode() ? 'dark' : 'light');
  }

  private loadTheme(): boolean {
    const saved = localStorage.getItem('qmethod:theme');
    if (saved) {
      return saved === 'dark';
    }
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  }

  private applyTheme(): void {
    document.body.classList.toggle('light', !this.darkMode());
  }
}
