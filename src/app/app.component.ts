import { Component, OnInit, OnDestroy } from '@angular/core';
import {
  FormsModule,
  ReactiveFormsModule,
  FormBuilder,
  Validators,
  FormGroup,
  FormArray,
} from '@angular/forms';
import { NgFor, NgIf } from '@angular/common';
import { SelectButtonModule } from 'primeng/selectbutton';
import { CalendarModule } from 'primeng/calendar';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { InputTextareaModule } from 'primeng/inputtextarea';
import { Subject, takeUntil } from 'rxjs';

import { ExcelService } from './core/services/excel.service';
import { ThemeService } from './core/services/theme.service';
import { Theme } from './core/enums';
import { getDateRange, getWeeksInAMonth } from './core/utils';
import { DisabledDates, ThemeOptions } from './core/types';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
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
  ],
})
export class AppComponent implements OnInit, OnDestroy {
  themeOptions: ThemeOptions[] = [
    { label: 'Light', icon: 'pi pi-sun', value: Theme.LIGHT },
    { label: 'Dark', icon: 'pi pi-moon', value: Theme.DARK },
  ];

  theme: string = Theme.LIGHT;
  loading: boolean = false;
  destroy$ = new Subject<void>();

  form!: FormGroup;

  dateRange: Date[] = [];
  disabledDays: number[] = [0, 6]; // weekends;
  disabledDates: DisabledDates = {
    holidays: [],
    fullLeaves: [],
    halfLeaves: [],
  };

  constructor(
    private excelService: ExcelService,
    private themeService: ThemeService,
    private formBuilder: FormBuilder
  ) {}

  ngOnInit() {
    this.form = this.formBuilder.group({
      name: [undefined, Validators.required],
      project: [undefined, Validators.required],
      approver: [undefined, Validators.required],
      activity: [undefined, Validators.required],
      activities: this.formBuilder.array([]),
      date: [undefined, Validators.required],
      weekends: [[]],
      fullDays: [[]],
      calendarFullLeaves: [[]],
      fullLeaves: [[]],
      calendarHalfLeaves: [[]],
      halfLeaves: [[]],
      calendarHolidays: [[]],
      holidays: [[]],
      dateRange: [[]],
    });

    this.initializeFormListener();

    this.form.get('calendarFullLeaves')?.disable();
    this.form.get('calendarHalfLeaves')?.disable();
    this.form.get('calendarHolidays')?.disable();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  get activities(): FormArray {
    return this.form.get('activities') as FormArray;
  }

  toggleTheme(theme: string) {
    this.themeService.switchTheme(theme);
  }

  initializeFormListener() {
    this.form
      .get('date')
      ?.valueChanges.pipe(takeUntil(this.destroy$))
      .subscribe((value) => {
        this.activities.clear();
        if (value) {
          this.formatCalendar(value);
          this.form.get('calendarFullLeaves')?.enable();
          this.form.get('calendarHalfLeaves')?.enable();
          this.form.get('calendarHolidays')?.enable();
        } else {
          this.dateRange = [];
          this.disabledDates = {
            holidays: [],
            fullLeaves: [],
            halfLeaves: [],
          };
          this.form.get('calendarFullLeaves')?.disable();
          this.form.get('calendarHalfLeaves')?.disable();
          this.form.get('calendarHolidays')?.disable();
        }
      });

    this.form
      .get('calendarFullLeaves')
      ?.valueChanges.pipe(takeUntil(this.destroy$))
      .subscribe((value) => {
        if (value) {
          this.disabledDates.halfLeaves = [
            ...value,
            ...(this.form.get('calendarHolidays')?.value ?? []),
          ];
          this.disabledDates.holidays = [
            ...value,
            ...(this.form.get('calendarHalfLeaves')?.value ?? []),
          ];
        }
      });

    this.form
      .get('calendarHalfLeaves')
      ?.valueChanges.pipe(takeUntil(this.destroy$))
      .subscribe((value) => {
        if (value) {
          this.disabledDates.fullLeaves = [
            ...value,
            ...(this.form.get('calendarHolidays')?.value ?? []),
          ];
          this.disabledDates.holidays = [
            ...value,
            ...(this.form.get('calendarFullLeaves')?.value ?? []),
          ];
        }
      });

    this.form
      .get('calendarHolidays')
      ?.valueChanges.pipe(takeUntil(this.destroy$))
      .subscribe((value) => {
        if (value) {
          this.disabledDates.fullLeaves = [
            ...value,
            ...(this.form.get('calendarHalfLeaves')?.value ?? []),
          ];
          this.disabledDates.halfLeaves = [
            ...value,
            ...(this.form.get('calendarFullLeaves')?.value ?? []),
          ];
        }
      });
  }

  formatCalendar(date: Date) {
    this.dateRange = getDateRange(date);
    const weeks = getWeeksInAMonth(
      this.dateRange[0].getMonth() + 1,
      this.dateRange[0].getFullYear()
    );

    const weekends: number[] = [];
    const fullDays: number[] = [];

    for (let i = 0; i < weeks?.length; i++) {
      for (let j = 0; j < weeks[i]?.length; j++) {
        if ([0, 6].includes(weeks[i][j]?.getDay())) {
          weekends.push(weeks[i][j]?.getDate());
        } else {
          fullDays.push(weeks[i][j]?.getDate());
        }
      }
      this.activities.push(this.formBuilder.control(''));
    }

    this.form.controls['weekends'].patchValue(weekends);
    this.form.controls['fullDays'].patchValue(fullDays);
  }

  formatForm() {
    const selectedDates = Array.from(
      new Set([
        ...this.disabledDates.holidays,
        ...this.disabledDates.fullLeaves,
        ...this.disabledDates.halfLeaves,
      ])
    ).map((date) => new Date(date).getDate());

    const fullDays = this.form.controls['fullDays'].value?.length
      ? this.form.controls['fullDays'].value?.filter(
          (date: number) => !selectedDates.includes(date)
        )
      : [];
    this.form.controls['fullDays'].patchValue(fullDays);

    this.form.controls['holidays'].patchValue(
      this.form.controls['calendarHolidays'].value?.length
        ? this.form.controls['calendarHolidays'].value.map((date: Date) =>
            date.getDate()
          )
        : []
    );
    this.form.controls['fullLeaves'].patchValue(
      this.form.controls['calendarFullLeaves'].value?.length
        ? this.form.controls['calendarFullLeaves'].value.map((date: Date) =>
            date.getDate()
          )
        : []
    );
    this.form.controls['halfLeaves'].patchValue(
      this.form.controls['calendarHalfLeaves'].value?.length
        ? this.form.controls['calendarHalfLeaves'].value.map((date: Date) =>
            date.getDate()
          )
        : []
    );

    this.form.controls['dateRange'].patchValue(this.dateRange);
  }

  clear() {
    this.loading = false;
    this.dateRange = [];
    this.disabledDates = {
      holidays: [],
      fullLeaves: [],
      halfLeaves: [],
    };
    this.form.reset();
    this.activities.clear();
  }

  generate() {
    this.formatForm();
    this.excelService.generateExcel(this.form.getRawValue());
  }
}
