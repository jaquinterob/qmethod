import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HomeComponent } from './home.component';
import { of } from 'rxjs';
import { Step } from '../../models/step';

describe('HomeComponent', () => {
  let component: HomeComponent;
  let fixture: ComponentFixture<HomeComponent>;
  const step: Step = {
    isTheNext: false,
    done: false,
    type: 'punishable',
  };
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HomeComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(HomeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('goodStep() works', () => {
    const getNextStep = spyOn<any>(component, 'getNextStep').and.returnValue(
      step
    );
    component.goodStep();
    expect(getNextStep).toHaveBeenCalled();
  });

  it('badStep() works', () => {
    const getNextStep = spyOn<any>(component, 'getNextStep').and.returnValue(
      step
    );
    component.badStep();
    expect(getNextStep).toHaveBeenCalled();
  });

  it('private getNextStep() works', () => {
    expect(component['getNextStep']()).toEqual({
      done: false,
      type: 'innocent',
      isTheNext: true,
    });
  });

  it('reset() works', () => {
    const initSteps = spyOn<any>(component,'initSteps')
    component.reset()
    expect(initSteps).toHaveBeenCalled()

  });

});
