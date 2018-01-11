import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { FormsModule } from '@angular/forms';
import { NgModule } from '@angular/core';
import {
  MatCardModule,
  MatSlideToggleModule,
  MatSidenavModule,
} from '@angular/material';


import { AppComponent } from './app.component';
import { SelectableTableModule } from './selectable-table';
import { ThemeManagerService } from './theme-manager.service';


@NgModule({
  declarations: [
    AppComponent,
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    FormsModule,
    SelectableTableModule,
    MatCardModule,
    MatSlideToggleModule,
    MatSidenavModule,
  ],
  providers: [
    ThemeManagerService,
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
