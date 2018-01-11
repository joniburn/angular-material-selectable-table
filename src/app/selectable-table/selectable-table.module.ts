import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CdkTableModule } from '@angular/cdk/table';
import { MatCheckboxModule, MatPaginatorModule } from '@angular/material';

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
    MatCheckboxModule,
    MatPaginatorModule,
  ],
})
export class SelectableTableModule { }
