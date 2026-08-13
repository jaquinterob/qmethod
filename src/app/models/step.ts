export type StepType = 'innocent' | 'punishable';
export type ButtonPressed = 'good' | 'bad' | '';

export interface Step {
  type: StepType;
  done: boolean;
}

export interface GameStats {
  failAttempts: number;
  punishments: number;
  totalSteps: number;
  bestStreak: number;
}
