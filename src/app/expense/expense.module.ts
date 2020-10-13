import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ExpenseHomeComponent } from './expense-home/expense-home.component';
import { ExpenseCreateComponent } from './expense-create/expense-create.component';
import { ExpenseEditComponent } from './expense-edit/expense-edit.component';
import { AppRoutingModule } from '../app-routing.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgSelectModule } from '@ng-select/ng-select';
import { ExpenseViewComponent } from './expense-view/expense-view.component';

import { HistoryComponent } from './history/history.component';
import { SharedModule } from '../shared/shared.module';



@NgModule({
  declarations: [ExpenseHomeComponent, ExpenseCreateComponent, ExpenseEditComponent, ExpenseViewComponent, HistoryComponent],
  imports: [
    CommonModule,
    AppRoutingModule,
    FormsModule,
    NgSelectModule,
    ReactiveFormsModule,
    SharedModule
   
  ]
})
export class ExpenseModule { }
