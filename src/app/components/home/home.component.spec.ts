import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideNoopAnimations } from '@angular/platform-browser/animations';

import { HomeComponent } from './home.component';
import { GameService } from '../../core/services/game.service';

describe('HomeComponent', () => {
  let component: HomeComponent;
  let fixture: ComponentFixture<HomeComponent>;
  let service: GameService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HomeComponent],
      providers: [provideNoopAnimations()],
    }).compileComponents();

    fixture = TestBed.createComponent(HomeComponent);
    component = fixture.componentInstance;
    service = TestBed.inject(GameService);
    localStorage.clear();
    service.reset();
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('renders one step chip per step', () => {
    const chips = fixture.nativeElement.querySelectorAll('.step');
    expect(chips.length).toBe(10);
  });

  it('calls game.goodAnswer() when the good action is clicked', () => {
    spyOn(service, 'goodAnswer');
    const button = fixture.nativeElement.querySelector('.action--good');

    button.click();

    expect(service.goodAnswer).toHaveBeenCalled();
  });

  it('calls game.badAnswer() when the bad action is clicked', () => {
    spyOn(service, 'badAnswer');
    const button = fixture.nativeElement.querySelector('.action--bad');

    button.click();

    expect(service.badAnswer).toHaveBeenCalled();
  });

  it('hides the actions and shows the summary when the run is completed', () => {
    for (let i = 0; i < 10; i++) {
      service.goodAnswer();
    }
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('.actions')).toBeNull();
    expect(fixture.nativeElement.querySelector('.summary')).toBeTruthy();
    expect(fixture.nativeElement.querySelector('.summary__title').textContent).toContain(
      'Método completado'
    );
  });

  it('celebrates a perfect run in the summary', () => {
    for (let i = 0; i < 10; i++) {
      service.goodAnswer();
    }
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('.summary__hint').textContent).toContain(
      'Perfección'
    );
  });

  it('mocks the player when the run finished with failures', () => {
    service.badAnswer();
    for (let i = 0; i < 10; i++) {
      service.goodAnswer();
    }
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('.summary__hint').textContent).toContain(
      'perfección'
    );
  });

  it('shows the feedback overlay when a step is answered', () => {
    service.goodAnswer();
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('.feedback-layer')).toBeTruthy();
  });

  it('restarts the game from the header button', () => {
    service.goodAnswer();
    const restart = fixture.nativeElement.querySelector('.icon-button');

    restart.click();

    expect(service.currentStepIndex()).toBe(0);
    expect(service.doneCount()).toBe(0);
  });
});
