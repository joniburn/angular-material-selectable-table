import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CdkTableModule } from '@angular/cdk/table';

import { SelectableTableComponent } from './selectable-table.component';

@NgModule({
  declarations: [
    SelectableTableComponent,
  ],
  exports: [
    SelectableTableComponent,
  ],
  imports: [
    CommonModule,
    CdkTableModule,
  ],
})
export class SelectableTableModule { }
