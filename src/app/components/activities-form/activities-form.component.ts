import { NgFor } from '@angular/common';
import { Component, Input } from '@angular/core';
import {
  FormArray,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
} from '@angular/forms';

import { InputTextareaModule } from 'primeng/inputtextarea';

@Component({
  selector: 'app-activities-form',
  templateUrl: './activities-form.component.html',
  styleUrls: ['./activities-form.component.scss'],
  standalone: true,
  imports: [FormsModule, ReactiveFormsModule, NgFor, InputTextareaModule],
})
export class ActivitiesFormComponent {
  @Input() form!: FormGroup;
  @Input() activities!: FormArray;
}
