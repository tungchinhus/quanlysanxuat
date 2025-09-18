import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EpBoiDayComponent } from './ep-boi-day.component';

describe('EpBoiDayComponent', () => {
  let component: EpBoiDayComponent;
  let fixture: ComponentFixture<EpBoiDayComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ EpBoiDayComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EpBoiDayComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
