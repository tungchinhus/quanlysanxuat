import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BangVeComponent } from './bang-ve.component';

describe('BangVeComponent', () => {
  let component: BangVeComponent;
  let fixture: ComponentFixture<BangVeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ BangVeComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BangVeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
