import { TestBed, fakeAsync, tick } from '@angular/core/testing';
import { GameService } from './game.service';
import { GAME_CONFIG } from '../constants/game-config';

describe('GameService', () => {
  let service: GameService;

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({});
    service = TestBed.inject(GameService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('starts with 5 innocent and 5 punishable steps', () => {
    expect(service.steps().length).toBe(10);
    expect(
      service
        .steps()
        .slice(0, 5)
        .every((step) => step.type === 'innocent')
    ).toBeTrue();
    expect(
      service
        .steps()
        .slice(5)
        .every((step) => step.type === 'punishable')
    ).toBeTrue();
    expect(service.currentStepIndex()).toBe(0);
    expect(service.currentStep()?.type).toBe('innocent');
    expect(service.stepsCompleted()).toBeFalse();
    expect(service.remaining()).toBe(10);
  });

  it('goodAnswer() completes the current step and advances', () => {
    service.goodAnswer();

    expect(service.steps()[0].done).toBeTrue();
    expect(service.currentStepIndex()).toBe(1);
    expect(service.streak()).toBe(1);
    expect(service.doneCount()).toBe(1);
    expect(service.remaining()).toBe(9);
  });

  it('goodAnswer() shows feedback and hides it after the configured delay', fakeAsync(() => {
    service.goodAnswer();

    expect(service.showFeedback()).toBeTrue();
    expect(service.buttonPressed()).toBe('good');

    tick(GAME_CONFIG.feedbackDurationMs);
    expect(service.showFeedback()).toBeFalse();
  }));

  it('goodAnswer() on the last step completes the run with the final streak', () => {
    for (let i = 0; i < 10; i++) {
      service.goodAnswer();
    }

    expect(service.stepsCompleted()).toBeTrue();
    expect(service.bestStreak()).toBe(10);
    expect(service.doneCount()).toBe(10);
    expect(service.buttonPressed()).toBe('');
  });

  it('ignores goodAnswer() after completion', () => {
    for (let i = 0; i < 10; i++) {
      service.goodAnswer();
    }
    const done = service.doneCount();

    service.goodAnswer();

    expect(service.doneCount()).toBe(done);
    expect(service.streak()).toBe(0);
  });

  it('badAnswer() on an innocent step only increments failures and resets the streak', () => {
    service.goodAnswer();
    service.goodAnswer();

    service.badAnswer();

    expect(service.failAttempts()).toBe(1);
    expect(service.punishments()).toBe(0);
    expect(service.steps().length).toBe(10);
    expect(service.streak()).toBe(0);
    expect(service.currentStepIndex()).toBe(2);
  });

  it('badAnswer() on a punishable step appends a step and counts a punishment', () => {
    for (let i = 0; i < 5; i++) {
      service.goodAnswer();
    }
    const totalBefore = service.steps().length;

    service.badAnswer();

    expect(service.failAttempts()).toBe(1);
    expect(service.punishments()).toBe(1);
    expect(service.steps().length).toBe(totalBefore + 1);
    expect(service.steps()[totalBefore].type).toBe('punishable');
    expect(service.remaining()).toBe(totalBefore + 1 - service.doneCount());
  });

  it('schedules the fire only once the threshold is reached', fakeAsync(() => {
    for (let i = 0; i < GAME_CONFIG.fireThreshold; i++) {
      service.goodAnswer();
    }

    expect(service.showFire()).toBeFalse();
    tick(GAME_CONFIG.fireDelayMs);
    expect(service.showFire()).toBeTrue();
  }));

  it('does not schedule fire below the threshold', fakeAsync(() => {
    for (let i = 0; i < GAME_CONFIG.fireThreshold - 1; i++) {
      service.goodAnswer();
    }

    tick(GAME_CONFIG.fireDelayMs);
    expect(service.showFire()).toBeFalse();
  }));

  it('cancels the fire when the run is completed', fakeAsync(() => {
    for (let i = 0; i < 10; i++) {
      service.goodAnswer();
    }
    service.goodAnswer();

    tick(GAME_CONFIG.fireDelayMs);
    expect(service.showFire()).toBeFalse();
  }));

  it('reset() restores the initial state', () => {
    for (let i = 0; i < 5; i++) {
      service.goodAnswer();
    }
    service.badAnswer();

    service.reset();

    expect(service.steps().length).toBe(10);
    expect(service.currentStepIndex()).toBe(0);
    expect(service.failAttempts()).toBe(0);
    expect(service.punishments()).toBe(0);
    expect(service.streak()).toBe(0);
    expect(service.streaks()).toEqual([]);
    expect(service.doneCount()).toBe(0);
    expect(service.remaining()).toBe(10);
    expect(service.stepsCompleted()).toBeFalse();
    expect(service.showFeedback()).toBeFalse();
    expect(service.showFire()).toBeFalse();
  });

  it('stats() exposes the final metrics', () => {
    for (let i = 0; i < 10; i++) {
      service.goodAnswer();
    }

    expect(service.stats()).toEqual({
      failAttempts: 0,
      punishments: 0,
      totalSteps: 10,
      bestStreak: 10,
    });
  });

  it('persists the run and restores it on a new instance', () => {
    service.goodAnswer();
    service.goodAnswer();
    service.badAnswer();

    TestBed.resetTestingModule();
    TestBed.configureTestingModule({});
    const restored = TestBed.inject(GameService);

    expect(restored.steps().length).toBe(10);
    expect(restored.currentStepIndex()).toBe(2);
    expect(restored.streak()).toBe(0);
    expect(restored.failAttempts()).toBe(1);
    expect(restored.steps()[0].done).toBeTrue();
    expect(restored.steps()[1].done).toBeTrue();
  });

  it('does not restore a finished run', () => {
    for (let i = 0; i < 10; i++) {
      service.goodAnswer();
    }
    expect(service.stepsCompleted()).toBeTrue();

    TestBed.resetTestingModule();
    TestBed.configureTestingModule({});
    const restored = TestBed.inject(GameService);

    expect(restored.stepsCompleted()).toBeFalse();
    expect(restored.currentStepIndex()).toBe(0);
  });
});
