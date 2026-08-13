import { ChangeDetectionStrategy, Component, Input, OnInit } from '@angular/core';
import { ButtonPressed } from '../../models/step';

const RANDOM_GIFS = 5;

@Component({
  selector: 'q-feedback',
  standalone: true,
  imports: [],
  templateUrl: './feedback.component.html',
  styleUrl: './feedback.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FeedbackComponent implements OnInit {
  @Input() buttonPressed: ButtonPressed = '';

  image = 'assets/success.gif';
  labelClass = 'done';

  ngOnInit(): void {
    if (this.buttonPressed === 'good') {
      this.image = `assets/success/${randomInt(RANDOM_GIFS)}.gif`;
      this.labelClass = 'good';
    } else if (this.buttonPressed === 'bad') {
      this.image = `assets/error/${randomInt(RANDOM_GIFS)}.gif`;
      this.labelClass = 'bad';
    }
  }
}

function randomInt(max: number): number {
  return Math.floor(Math.random() * max) + 1;
}
