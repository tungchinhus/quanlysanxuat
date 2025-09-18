import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EpBoiDayPopupComponent } from './ep-boi-day-popup.component';

describe('EpBoiDayPopupComponent', () => {
  let component: EpBoiDayPopupComponent;
  let fixture: ComponentFixture<EpBoiDayPopupComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ EpBoiDayPopupComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EpBoiDayPopupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
