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
import { DUR, EASE, T } from '../../shared/motion-tokens';
import {
  GAME_MODE_ORDER,
  GAME_MODES,
  GameMode,
  GameModeId,
} from '../../core/constants/game-config';

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
  private readonly sound = inject(SoundService);

  readonly darkMode = signal(this.loadTheme());
  readonly soundEnabled = this.sound.enabled;

  constructor() {
    effect(() => {
      document.body.classList.toggle('light', !this.darkMode());
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
    this.darkMode.update((v) => !v);
    this.applyTheme();
    localStorage.setItem('qmethod:theme', this.darkMode() ? 'dark' : 'light');
  }

  toggleSound(): void {
    this.sound.toggle();
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
