import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FeedbackComponent } from './feedback.component';
import { ButtonPressed } from '../../models/step';

describe('FeedbackComponent', () => {
  let fixture: ComponentFixture<FeedbackComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FeedbackComponent],
    }).compileComponents();
  });

  function createComponent(buttonPressed: ButtonPressed = ''): ComponentFixture<FeedbackComponent> {
    const f = TestBed.createComponent(FeedbackComponent);
    f.componentInstance.buttonPressed = buttonPressed;
    f.detectChanges();
    return f;
  }

  it('should create', () => {
    expect(createComponent()).toBeTruthy();
  });

  it('shows a random success gif for a good answer', () => {
    fixture = createComponent('good');

    expect(fixture.componentInstance.image).toMatch(/^assets\/success\/[1-5]\.gif$/);
    expect(fixture.nativeElement.querySelector('img').getAttribute('src')).toBe(
      fixture.componentInstance.image
    );
  });

  it('shows a random error gif for a bad answer', () => {
    fixture = createComponent('bad');

    expect(fixture.componentInstance.image).toMatch(/^assets\/error\/[1-5]\.gif$/);
  });

  it('shows the neutral gif when no button was pressed', () => {
    fixture = createComponent();

    expect(fixture.componentInstance.image).toBe('assets/success.gif');
  });

  it('tints the card by answer and never renders a text label', () => {
    const bad = createComponent('bad');
    const good = createComponent('good');

    expect(bad.nativeElement.querySelector('.feedback-card').className).toContain(
      'feedback-card--bad'
    );
    expect(good.nativeElement.querySelector('.feedback-card').className).toContain(
      'feedback-card--good'
    );
    expect(bad.nativeElement.querySelector('.feedback-card__label')).toBeNull();
  });
});
