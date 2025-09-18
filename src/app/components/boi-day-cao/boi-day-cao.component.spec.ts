import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BoiDayHaComponent } from './boi-day-cao.component';

describe('BoiDayHaComponent', () => {
  let component: BoiDayHaComponent;
  let fixture: ComponentFixture<BoiDayHaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ BoiDayHaComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BoiDayHaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
