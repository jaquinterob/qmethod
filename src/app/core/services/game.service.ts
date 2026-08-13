import { DestroyRef, Injectable, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Subscription, timer } from 'rxjs';
import { ButtonPressed, GameStats, Step } from '../../models/step';
import { GAME_CONFIG } from '../constants/game-config';

interface GameSnapshot {
  steps: Step[];
  currentStepIndex: number;
  streak: number;
  streaks: number[];
  failAttempts: number;
  punishments: number;
}

@Injectable({ providedIn: 'root' })
export class GameService {
  private readonly config = GAME_CONFIG;
  private readonly destroyRef = inject(DestroyRef);
  private readonly storageKey = 'qmethod:game';

  readonly steps = signal<Step[]>(this.buildInitialSteps());
  readonly currentStepIndex = signal(0);
  readonly streak = signal(0);
  readonly streaks = signal<number[]>([]);
  readonly failAttempts = signal(0);
  readonly punishments = signal(0);
  readonly showFeedback = signal(false);
  readonly buttonPressed = signal<ButtonPressed>('');
  readonly showFire = signal(false);

  readonly currentStep = computed(() => this.steps()[this.currentStepIndex()] ?? null);
  readonly stepsCompleted = computed(() => this.currentStepIndex() >= this.steps().length);
  readonly doneCount = computed(() => this.steps().filter((step) => step.done).length);
  readonly remaining = computed(() => this.steps().length - this.doneCount());
  readonly totalSteps = computed(() => this.steps().length);
  readonly bestStreak = computed(() => (this.streaks().length ? Math.max(...this.streaks()) : 0));
  readonly progress = computed(() =>
    this.totalSteps() ? this.doneCount() / this.totalSteps() : 0
  );
  readonly punishableStartIndex = computed(() =>
    this.steps().findIndex((step) => step.type === 'punishable')
  );

  private hideFeedback = new Subscription();
  private showFireTimer = new Subscription();

  constructor() {
    this.hydrate();
  }

  goodAnswer(): void {
    if (this.stepsCompleted()) {
      return;
    }
    const current = this.currentStep();
    if (!current) {
      return;
    }
    const index = this.currentStepIndex();
    this.steps.update((steps) =>
      steps.map((step, i) => (i === index ? { ...step, done: true } : step))
    );
    this.streak.set(this.streak() + 1);
    this.advance();
    this.showFeedbackFor('good');
    this.scheduleFire();
    this.persist();
  }

  badAnswer(): void {
    this.commitStreak();
    const current = this.currentStep();
    if (current?.type === 'punishable') {
      this.steps.update((steps) => [...steps, { type: 'punishable', done: false }]);
      this.punishments.update((punishments) => punishments + 1);
    }
    this.failAttempts.update((failAttempts) => failAttempts + 1);
    this.showFeedbackFor('bad');
    this.persist();
  }

  reset(): void {
    this.hideFeedback.unsubscribe();
    this.showFireTimer.unsubscribe();
    this.steps.set(this.buildInitialSteps());
    this.currentStepIndex.set(0);
    this.streak.set(0);
    this.streaks.set([]);
    this.failAttempts.set(0);
    this.punishments.set(0);
    this.showFeedback.set(false);
    this.buttonPressed.set('');
    this.showFire.set(false);
    this.persist();
  }

  stats(): GameStats {
    return {
      failAttempts: this.failAttempts(),
      punishments: this.punishments(),
      totalSteps: this.totalSteps(),
      bestStreak: this.bestStreak(),
    };
  }

  private advance(): void {
    const nextIndex = this.currentStepIndex() + 1;
    this.currentStepIndex.set(nextIndex);
    if (nextIndex >= this.steps().length) {
      this.commitStreak();
      this.showFireTimer.unsubscribe();
      this.showFire.set(false);
    }
  }

  private commitStreak(): void {
    this.streaks.update((streaks) => [...streaks, this.streak()]);
    this.streak.set(0);
  }

  private showFeedbackFor(button: ButtonPressed): void {
    this.buttonPressed.set(this.stepsCompleted() ? '' : button);
    this.showFeedback.set(true);
    this.hideFeedback.unsubscribe();
    this.hideFeedback = timer(this.config.feedbackDurationMs)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => this.showFeedback.set(false));
  }

  private scheduleFire(): void {
    if (this.doneCount() !== this.config.fireThreshold) {
      return;
    }
    this.showFireTimer.unsubscribe();
    this.showFireTimer = timer(this.config.fireDelayMs)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => this.showFire.set(true));
  }

  private buildInitialSteps(): Step[] {
    return [
      ...Array.from(
        { length: this.config.initialInnocentSteps },
        () =>
          ({
            type: 'innocent',
            done: false,
          }) as Step
      ),
      ...Array.from(
        { length: this.config.initialPunishableSteps },
        () =>
          ({
            type: 'punishable',
            done: false,
          }) as Step
      ),
    ];
  }

  private hydrate(): void {
    const raw = localStorage.getItem(this.storageKey);
    if (!raw) {
      return;
    }
    try {
      const saved = JSON.parse(raw) as Partial<GameSnapshot>;
      if (!Array.isArray(saved.steps) || saved.steps.length === 0) {
        return;
      }
      if ((saved.currentStepIndex ?? 0) >= saved.steps.length) {
        return;
      }
      this.steps.set(saved.steps as Step[]);
      this.currentStepIndex.set(saved.currentStepIndex ?? 0);
      this.streak.set(saved.streak ?? 0);
      this.streaks.set(saved.streaks ?? []);
      this.failAttempts.set(saved.failAttempts ?? 0);
      this.punishments.set(saved.punishments ?? 0);
    } catch {
      // Snapshot corrupto: se empieza una partida nueva.
    }
  }

  private persist(): void {
    const snapshot: GameSnapshot = {
      steps: this.steps(),
      currentStepIndex: this.currentStepIndex(),
      streak: this.streak(),
      streaks: this.streaks(),
      failAttempts: this.failAttempts(),
      punishments: this.punishments(),
    };
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(snapshot));
    } catch {
      // Almacenamiento no disponible: la partida no se guarda, pero se sigue jugando.
    }
  }
}
