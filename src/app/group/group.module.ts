import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GroupCreateComponent } from './group-create/group-create.component';
import { GroupHomeComponent } from './group-home/group-home.component';
import { NgSelectModule } from '@ng-select/ng-select';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AppRoutingModule } from '../app-routing.module';
import { SharedModule } from '../shared/shared.module';






@NgModule({
  declarations: [GroupCreateComponent, GroupHomeComponent],
  imports: [
    CommonModule,
    NgSelectModule,
    AppRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    SharedModule
  ]
})
export class GroupModule { }
