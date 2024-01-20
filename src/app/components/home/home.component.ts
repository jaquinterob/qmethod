import { Component, OnInit } from '@angular/core';
import { Step, ButtonPressed } from '../../models/step';
import { CommonModule } from '@angular/common';
import { InitialValues } from '../../data/initial-values';
import { FeedbackComponent } from '../feedback/feedback.component';

@Component({
  selector: 'q-home',
  standalone: true,
  imports: [CommonModule, FeedbackComponent],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css',
})
export class HomeComponent implements OnInit {
  steps!: Step[];
  stepsCompleted!: boolean;
  failAttemptsCounter!: number;
  punishments!: number;
  streak!: number;
  streaks!: number[];
  bestStreak!: number;
  remaining!: number;
  showFeedback!: boolean;
  buttonPressed!: ButtonPressed;
  showFire!: Boolean;

  ngOnInit(): void {
    this.initSteps();
  }

  goodStep(): void {
    this.streak++;
    const nextStep = this.getNextStep();
    nextStep.done = true;
    const indexCurrentStep = this.steps.indexOf(nextStep);
    nextStep.isTheNext = false;
    this.setNextStep(indexCurrentStep);
    this.remainingRecalculation();
    this.displayFeedback('good');
    this.calculateShowFire();
  }

  badStep(): void {
    this.resetStreaks();
    const nextStep = this.getNextStep();
    if (nextStep.type === 'punishable') {
      this.steps.push({ done: false, isTheNext: false, type: 'punishable' });
      this.punishments++;
    }
    this.failAttemptsCounter++;
    this.remainingRecalculation();
    this.displayFeedback('bad');
  }

  private resetStreaks() {
    this.streaks.push(this.streak);
    this.streak = 0;
  }

  private initSteps(): void {
    this.steps = JSON.parse(JSON.stringify(InitialValues.steps));
    this.stepsCompleted = InitialValues.stepsCompleted;
    this.failAttemptsCounter = InitialValues.failAttemptsCounter;
    this.punishments = InitialValues.punishments;
    this.streak = InitialValues.streak;
    this.streaks = JSON.parse(JSON.stringify(InitialValues.streaks));
    this.bestStreak = InitialValues.bestStreak;
    this.remaining = InitialValues.remaining;
    this.showFeedback = InitialValues.showFeedback;
    this.buttonPressed = InitialValues.buttonPressed;
    this.showFire = InitialValues.showFire;
  }

  private setNextStep(indexLastStep: number): void {
    if (indexLastStep !== this.steps.length - 1) {
      this.steps[indexLastStep + 1].isTheNext = true;
    } else {
      this.resetStreaks();
      this.getBestStreak();
      this.stepsCompleted = true;
      this.showFire = false;
    }
  }

  private getNextStep(): Step {
    return this.steps.filter((step) => step.isTheNext)[0];
  }

  reset(): void {
    this.initSteps();
  }

  private getBestStreak(): void {
    this.bestStreak = Math.max(...this.streaks);
  }

  private remainingRecalculation(): void {
    const doneNumber = this.steps.filter((step) => step.done).length;
    this.remaining = this.steps.length - doneNumber;
  }

  private displayFeedback(button: ButtonPressed): void {
    this.buttonPressed = this.stepsCompleted ? '' : button;
    this.showFeedback = true;
    setTimeout(() => {
      this.showFeedback = false;
    }, 2000);
  }

  private calculateShowFire(): void {
    const stepDone = this.steps.filter((step) => step.done).length;
    if (stepDone >= 5) {
      setTimeout(() => {
        this.showFire = true;
      }, 2000);
    }
  }
}
