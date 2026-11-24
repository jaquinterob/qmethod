import { Component, HostListener, computed, effect, inject, signal } from '@angular/core';
import {
  animate,
  keyframes,
  query,
  stagger,
  style,
  transition,
  trigger,
} from '@angular/animations';
import confetti from 'canvas-confetti';
import { GameService } from '../../core/services/game.service';
import { MotionPreference } from '../../core/services/motion-preference.service';
import { SoundService } from '../../core/services/sound.service';
import { FeedbackComponent } from '../feedback/feedback.component';
import { AdBannerComponent } from '../ad-banner/ad-banner.component';
import { DUR, EASE, T } from '../../shared/motion-tokens';
import {
  GAME_MODE_ORDER,
  GAME_MODES,
  GameMode,
  GameModeId,
} from '../../core/constants/game-config';

export type ThemeId = 'dark' | 'light' | 'midnight';

const THEME_ORDER: ThemeId[] = ['dark', 'light', 'midnight'];

const THEME_LABEL: Record<ThemeId, string> = {
  dark: 'Oscuro',
  light: 'Claro',
  midnight: 'Midnight',
};

const THEME_NEXT_LABEL: Record<ThemeId, string> = {
  dark: 'Cambiar a modo claro',
  light: 'Cambiar a modo midnight',
  midnight: 'Cambiar a modo oscuro',
};

@Component({
  selector: 'q-home',
  standalone: true,
  imports: [FeedbackComponent, AdBannerComponent],
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
  private readonly sound = inject(SoundService);

  readonly theme = signal<ThemeId>(this.loadTheme());
  /** @deprecated use theme(); kept for templates that still branch on dark vs light */
  readonly darkMode = computed(() => this.theme() !== 'light');
  readonly soundEnabled = this.sound.enabled;
  readonly themeLabel = computed(() => THEME_LABEL[this.theme()]);
  readonly themeToggleLabel = computed(() => THEME_NEXT_LABEL[this.theme()]);

  constructor() {
    effect(() => {
      this.applyTheme(this.theme());
    });

    effect(() => {
      if (this.game.stepsCompleted() && !this.motion.reduced()) {
        this.fireConfetti();
      }
    });
  }

  readonly progressPercent = computed(() => Math.round(this.game.progress() * 100));

  readonly modes: GameMode[] = GAME_MODE_ORDER.map((id) => GAME_MODES[id]);

  readonly modesById = GAME_MODES;

  readonly pendingMode = signal<GameModeId | null>(null);

  readonly showMethod = signal(false);

  selectMode(id: GameModeId): void {
    if (id === this.game.mode()) {
      return;
    }
    if (this.game.doneCount() > 0) {
      this.pendingMode.set(id);
      return;
    }
    this.game.setMode(id);
  }

  confirmModeChange(): void {
    const target = this.pendingMode();
    this.pendingMode.set(null);
    if (target) {
      this.game.setMode(target);
    }
  }

  cancelModeChange(): void {
    this.pendingMode.set(null);
  }

  closeMethod(): void {
    this.showMethod.set(false);
  }

  onModalBackdrop(event: Event): void {
    if (event.target === event.currentTarget) {
      this.cancelModeChange();
      this.closeMethod();
    }
  }

  @HostListener('document:keydown.escape')
  onEscape(): void {
    this.cancelModeChange();
    this.closeMethod();
  }

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
    const current = this.theme();
    const next = THEME_ORDER[(THEME_ORDER.indexOf(current) + 1) % THEME_ORDER.length];
    this.theme.set(next);
    localStorage.setItem('qmethod:theme', next);
  }

  toggleSound(): void {
    this.sound.toggle();
  }

  private loadTheme(): ThemeId {
    const saved = localStorage.getItem('qmethod:theme');
    if (saved === 'light' || saved === 'midnight' || saved === 'dark') {
      return saved;
    }
    // Prefer midnight as the branded night look when OS is dark
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'midnight' : 'light';
  }

  private applyTheme(theme: ThemeId): void {
    document.body.classList.remove('light', 'midnight');
    if (theme === 'light') {
      document.body.classList.add('light');
    } else if (theme === 'midnight') {
      document.body.classList.add('midnight');
    }
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) {
      const color = getComputedStyle(document.body).getPropertyValue('--theme-color').trim();
      if (color) {
        meta.setAttribute('content', color);
      }
    }
  }

  private fireConfetti(): void {
    const duration = 3000;
    const end = Date.now() + duration;

    const frame = () => {
      confetti({
        particleCount: 3,
        angle: 60,
        spread: 55,
        origin: { x: 0, y: 0.7 },
        colors: ['#fbbf24', '#34d399', '#ffffff'],
      });
      confetti({
        particleCount: 3,
        angle: 120,
        spread: 55,
        origin: { x: 1, y: 0.7 },
        colors: ['#fbbf24', '#34d399', '#ffffff'],
      });

      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    };

    frame();
  }
}
