/**
 * File: sales-by-customer-salesperson.component.ts
 * Description: Displays total sales and transaction counts grouped by
 *               customer and salesperson using the shared TableComponent.
 */
import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { environment } from '../../../../environments/environment';
import { TableComponent } from '../../../shared/table/table.component';


@Component({
  selector: 'app-sales-by-customer-salesperson',
  standalone: true,
  imports: [TableComponent],
  template: `
    <h1>Sales by Customer and Salesperson</h1>
    <div class="customer-salesperson-container">
      <!-- Shown only if the API call fails -->
      @if (errorMessage) {
        <p class="message message--error">{{ errorMessage }}</p>
      }

      <!-- Shown only once sales data has been successfully loaded -->
      @if (salesData.length > 0) {
        <div class="card chart-card">
          <app-table
            [title]="'Sales by Customer and Salesperson'"
            [data]="salesData"
            [headers]="['Customer', 'Salesperson', 'Total Sales', 'Transactions']"
            [sortableColumns]="['Customer', 'Salesperson', 'Total Sales', 'Transactions']"
            [headerBackground]="'primary'"
          >
          </app-table>
        </div>
      }
    </div>
  `,
  styles: `
    .customer-salesperson-container {
      display: flex;
      flex-direction: column;
      align-items: center;
    }

    .chart-card {
      width: 80%;
      margin: 20px 0;
      padding: 10px;
    }

    app-table {
      padding: 50px;
    }
  `
})
export class SalesByCustomerSalespersonComponent implements OnInit {
  // Rows passed to app-table; each row is augmented with display-friendly keys (Customer, Salesperson, Total Sales, Transactions) for the headers
  salesData: any[] = [];

  // Populated and shown in the template if the HTTP request fails
  errorMessage: string = '';

  constructor(private http: HttpClient) { }

  // Fetch sales grouped by customer and salesperson when the component loads
  ngOnInit(): void {
    this.http.get(`${environment.apiBaseUrl}/reports/sales/by-customer-salesperson`).subscribe({
      next: (data: any) => {
        // Map raw API fields (customer, salesperson, totalSales, transactionCount) onto the column names used by app-table, while keeping the original fields via the spread
        this.salesData = data.map((row: any) => ({
          ...row,
          'Customer': row.customer,
          'Salesperson': row.salesperson,
          'Total Sales': row.totalSales,
          'Transactions': row.transactionCount
        }));
      },
      error: (err) => {
        // Log the technical error and show a friendly message in the UI
        console.error('Error fetching sales data by customer and salesperson:', err);
        this.errorMessage = 'Unable to load sales data. Please try again later.';
      }
    });
  }
}