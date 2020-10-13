import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ExpenseHomeComponent } from './expense-home.component';

describe('ExpenseHomeComponent', () => {
  let component: ExpenseHomeComponent;
  let fixture: ComponentFixture<ExpenseHomeComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ExpenseHomeComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ExpenseHomeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
