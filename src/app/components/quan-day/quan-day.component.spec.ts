import { ComponentFixture, TestBed } from '@angular/core/testing';

import { QuanDayComponent } from './quan-day.component';

describe('QuanDayComponent', () => {
  let component: QuanDayComponent;
  let fixture: ComponentFixture<QuanDayComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ QuanDayComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(QuanDayComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
