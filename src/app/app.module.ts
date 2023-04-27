import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppComponent } from './app.component';
import { TimesheetFormComponent } from './components/timesheet-form/timesheet-form.component';
import { ActivitiesFormComponent } from './components/activities-form/activities-form.component';

@NgModule({
  declarations: [
    AppComponent,
    TimesheetFormComponent,
    ActivitiesFormComponent
  ],
  imports: [
    BrowserModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
