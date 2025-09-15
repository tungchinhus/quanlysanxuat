import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProductionManagement } from './production-management';

describe('ProductionManagement', () => {
  let component: ProductionManagement;
  let fixture: ComponentFixture<ProductionManagement>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProductionManagement]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ProductionManagement);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
