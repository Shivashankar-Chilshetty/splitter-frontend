import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RemoveMinusPipe } from './pipe/removeMinus.pipe';



@NgModule({
  declarations: [RemoveMinusPipe],
  imports: [
    CommonModule,
    FormsModule
  ],
  exports:[RemoveMinusPipe]
})
export class SharedModule { }
