import { Component, OnInit } from '@angular/core';
import { Step } from '../../models/step';
import { CommonModule } from '@angular/common';
import { InitialValues } from '../../data/initial-values';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule],
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
  }

  badStep(): void {
    this.resetStreaks();
    const nextStep = this.getNextStep();
    if (nextStep.type === 'punishable') {
      this.steps.push({ done: false, isTheNext: false, type: 'punishable' });
      this.punishments++;
    }
    this.failAttemptsCounter++;
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
  }

  private setNextStep(indexLastStep: number): void {
    if (indexLastStep !== this.steps.length - 1) {
      this.steps[indexLastStep + 1].isTheNext = true;
    } else {
      this.resetStreaks();
      this.getBestStreak();
      this.stepsCompleted = true;
    }
  }

  private getNextStep(): Step {
    return this.steps.filter((step) => step.isTheNext)[0];
  }

  reset(): void {
    this.initSteps();
  }

  private getBestStreak() {
    this.bestStreak = Math.max(...this.streaks);
  }
}
