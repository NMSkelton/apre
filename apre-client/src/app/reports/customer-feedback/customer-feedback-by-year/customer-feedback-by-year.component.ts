import { ChangeDetectorRef, Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ChartComponent } from '../../../shared/chart/chart.component';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';

@Component({
  selector: 'app-customer-feedback-by-year',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, ChartComponent],
  template: `
    <h1>Customer Feedback by Year</h1>
    <div class="region-container">
      <form class="form" [formGroup]="yearForm" (ngSubmit)="onSubmit()">

        @if (errorMessage) {
          <div class="message message--error">{{ errorMessage }}</div>
        }

    <!-- Year dropdown is populated from the distinct-years API on init, so the options always reflect what's actually in the database -->
        <div class="form__group">
          <label class="label" for="year">Year</label>
          <select class="select" formControlName="year" id="year" name="year">
            @for (year of years; track year) {
              <option [value]="year.year">{{ year.year }}</option>
            }
          </select>
        </div>

        <div class="form__actions">
          <button class="button button--primary" type="submit">Submit</button>
        </div>
      </form>

    <!-- Chart only appears once the API returns data for the selected year -->
      @if (channels.length && ratingAvg.length) {
        <div class="card chart-card">
          <app-chart
            [type]="'bar'"
            [label]="'Average Rating by Channel'"
            [data]="ratingAvg"
            [labels]="channels">
          </app-chart>
        </div>
      }
    </div>
  `,
  styles: `
    .region-container {
      display: flex;
      flex-direction: column;
      align-items: center;
    }

    .form, .chart-card {
      width: 50%;
      margin: 20px 0;
    }
  `
})
export class CustomerFeedbackByYearComponent {
  channels: string[] = []; // Channel names returned from the API
  ratingAvg: number[] = []; // Average ratings aligned to the array
  years: any[] = []; // Available years fetched from /distinct-years on init
  errorMessage: string = '';

  // Reactive form with a single required year control
  yearForm = this.fb.group({
    year: [null, Validators.required]
  });

  constructor(private http: HttpClient, private fb: FormBuilder, private cdr: ChangeDetectorRef) {
    // Load the available years as soon as the component is created so the dropdown is ready before the user interacts with anything
    this.loadYears();
  }

  // Calls the distinct-years endpoint to get the list of years that actually exist in the customerFeedback collection, then stores them for the template
  loadYears() {
    this.http.get(`${environment.apiBaseUrl}/reports/customer-feedback/distinct-years`).subscribe({
      next: (data: any) => {
        this.years = data;
        console.log('Available years: ', this.years);
      },
      error: (err) => {
        console.error('Error fetching distinct years:', err);
        this.errorMessage = 'Unable to load available years. Please try again later.';
      }
    });
  }

  onSubmit() {
    if (this.yearForm.invalid) {
      this.errorMessage = 'Please select a year';
      return;
    }

    const year = this.yearForm.controls['year'].value;

    this.http.get(`${environment.apiBaseUrl}/reports/customer-feedback/customer-feedback-by-year?year=${year}`).subscribe({
      next: (data: any) => {
        // Empty response means the year exists in the dropdown but has no feedback records - shows error instead of a blank chart
        if (data.length === 0) {
          console.error('No data found for year', year);
          this.errorMessage = `No data found for ${year}`;
          return;
        }

        // Unpack the parallel arrays from the single-element response and clear any previous error so the chart renders cleanly
        this.channels = data[0].channels;
        this.ratingAvg = data[0].ratingAvg;

        console.log(`Channels: ${this.channels}\nRating Avg: ${this.ratingAvg}`);

        this.cdr.markForCheck();
        this.cdr.detectChanges();

        this.errorMessage = '';
      },
      error: (err) => {
        console.error('Error fetching customer feedback by year:', err);
      }
    });
  }
}