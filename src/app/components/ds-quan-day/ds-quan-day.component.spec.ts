import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DsQuanDayComponent } from './ds-quan-day.component';

describe('DsQuanDayComponent', () => {
  let component: DsQuanDayComponent;
  let fixture: ComponentFixture<DsQuanDayComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DsQuanDayComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DsQuanDayComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
