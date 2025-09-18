import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DsBangveComponent } from './ds-bangve.component';

describe('DsBangveComponent', () => {
  let component: DsBangveComponent;
  let fixture: ComponentFixture<DsBangveComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DsBangveComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DsBangveComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
