import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BoiDayCaoComponent } from './boi-day-cao.component';

describe('BoiDayCaoComponent', () => {
  let component: BoiDayCaoComponent;
  let fixture: ComponentFixture<BoiDayCaoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ BoiDayCaoComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BoiDayCaoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
