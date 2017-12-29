import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NgModule } from '@angular/core';


import { AppComponent } from './app.component';
import { SelectableTableModule } from './selectable-table/selectable-table.module';


@NgModule({
  declarations: [
    AppComponent,
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    SelectableTableModule,
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
