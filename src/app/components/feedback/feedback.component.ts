import { Component, Input, OnInit } from '@angular/core';
import { ButtonPressed } from '../../models/step';

@Component({
  selector: 'q-feedback',
  standalone: true,
  imports: [],
  templateUrl: './feedback.component.html',
  styleUrl: './feedback.component.css',
})
export class FeedbackComponent implements OnInit {
  @Input() buttonPressed!: ButtonPressed;
  image = '';

  ngOnInit(): void {
    this.setGif();
  }

  private setGif(): void {
    if (this.buttonPressed === 'good') {
      this.image = `./assets/success/${this.getRandomNumber()}.gif`;
    } else if (this.buttonPressed === 'bad') {
      this.image = `./assets/error/${this.getRandomNumber()}.gif`;
    } else {
      this.image = './assets/success.gif';
    }
  }

  private getRandomNumber(): number {
    return Math.floor(Math.random() * 4) + 1;
  }
}
