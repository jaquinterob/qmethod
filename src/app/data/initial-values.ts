import { Step } from '../models/step';

export class InitialValues {
  static steps: Step[] = [
    { done: false, type: 'innocent', isTheNext: true },
    { done: false, type: 'innocent', isTheNext: false },
    { done: false, type: 'innocent', isTheNext: false },
    { done: false, type: 'innocent', isTheNext: false },
    { done: false, type: 'innocent', isTheNext: false },
    { done: false, type: 'punishable', isTheNext: false },
    { done: false, type: 'punishable', isTheNext: false },
    { done: false, type: 'punishable', isTheNext: false },
    { done: false, type: 'punishable', isTheNext: false },
    { done: false, type: 'punishable', isTheNext: false },
  ];

  static stepsCompleted = false;
  static failAttemptsCounter = 0;
  static punishments = 0;
  static streak = 0;
  static streaks = [];
  static bestStreak = 0;
  static remaining = 10;
}
