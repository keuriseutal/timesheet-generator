import { NgFor, NgIf } from '@angular/common';
import { Component, Input } from '@angular/core';
import {
  FormArray,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
} from '@angular/forms';

import { ButtonModule } from 'primeng/button';
import { CalendarModule } from 'primeng/calendar';
import { InputTextModule } from 'primeng/inputtext';
import { InputTextareaModule } from 'primeng/inputtextarea';
import { SelectButtonModule } from 'primeng/selectbutton';

import { ActivitiesFormComponent } from '../activities-form/activities-form.component';
import { DisabledDates } from 'src/app/core/types';

@Component({
  selector: 'app-timesheet-form',
  templateUrl: './timesheet-form.component.html',
  styleUrls: ['./timesheet-form.component.scss'],
  standalone: true,
  imports: [
    FormsModule,
    ReactiveFormsModule,
    NgFor,
    NgIf,
    SelectButtonModule,
    CalendarModule,
    ButtonModule,
    InputTextModule,
    InputTextareaModule,
    ActivitiesFormComponent,
  ],
})
export class TimesheetFormComponent {
  @Input() form!: FormGroup;
  @Input() activities!: FormArray;

  @Input() dateRange: Date[] = [];
  @Input() disabledDays: number[] = [];
  @Input() disabledDates!: DisabledDates;
}
