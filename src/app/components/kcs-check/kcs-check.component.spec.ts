import { ComponentFixture, TestBed } from '@angular/core/testing';

import { KcsCheckComponent } from './kcs-check.component';

describe('KcsCheckComponent', () => {
  let component: KcsCheckComponent;
  let fixture: ComponentFixture<KcsCheckComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ KcsCheckComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(KcsCheckComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
