export interface Step {
  isTheNext: boolean;
  done: boolean;
  type: StepType;
}

export type StepType = 'punishable' | 'innocent';
