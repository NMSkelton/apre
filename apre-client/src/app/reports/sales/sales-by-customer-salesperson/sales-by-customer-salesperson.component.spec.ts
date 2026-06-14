import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { SalesByCustomerSalespersonComponent } from './sales-by-customer-salesperson.component';
import { environment } from '../../../../environments/environment';

describe('SalesByCustomerSalespersonComponent', () => {
  let component: SalesByCustomerSalespersonComponent;
  let fixture: ComponentFixture<SalesByCustomerSalespersonComponent>;
  let httpMock: HttpTestingController;

  const mockSalesData = [
    { customer: 'Acme Corp', salesperson: 'John Doe', totalSales: 2500, transactionCount: 3 },
    { customer: 'Acme Corp', salesperson: 'Jane Smith', totalSales: 1200, transactionCount: 1 },
    { customer: 'Globex Inc', salesperson: 'John Doe', totalSales: 800, transactionCount: 2 }
  ];

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HttpClientTestingModule, SalesByCustomerSalespersonComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SalesByCustomerSalespersonComponent);
    component = fixture.componentInstance;
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should create', () => {
    fixture.detectChanges();
    const req = httpMock.expectOne(`${environment.apiBaseUrl}/reports/sales/by-customer-salesperson`);
    req.flush([]);

    expect(component).toBeTruthy();
  });

  it('should display the title "Sales by Customer and Salesperson"', () => {
    fixture.detectChanges();
    const req = httpMock.expectOne(`${environment.apiBaseUrl}/reports/sales/by-customer-salesperson`);
    req.flush([]);

    const compiled = fixture.nativeElement;
    const titleElement = compiled.querySelector('h1');
    expect(titleElement).toBeTruthy();
    expect(titleElement.textContent).toContain('Sales by Customer and Salesperson');
  });

  it('should fetch sales data on init and map it for the table', () => {
    fixture.detectChanges();

    const req = httpMock.expectOne(`${environment.apiBaseUrl}/reports/sales/by-customer-salesperson`);
    expect(req.request.method).toBe('GET');
    req.flush(mockSalesData);

    expect(component.salesData.length).toBe(3);
    expect(component.salesData[0]['Customer']).toBe('Acme Corp');
    expect(component.salesData[0]['Salesperson']).toBe('John Doe');
    expect(component.salesData[0]['Total Sales']).toBe(2500);
    expect(component.salesData[0]['Transactions']).toBe(3);
  });

  it('should render the table when sales data is returned', () => {
    fixture.detectChanges();

    const req = httpMock.expectOne(`${environment.apiBaseUrl}/reports/sales/by-customer-salesperson`);
    req.flush(mockSalesData);
    fixture.detectChanges();

    const compiled = fixture.nativeElement;
    const table = compiled.querySelector('app-table');
    expect(table).toBeTruthy();
  });

  it('should display an error message when the request fails', () => {
    fixture.detectChanges();

    const req = httpMock.expectOne(`${environment.apiBaseUrl}/reports/sales/by-customer-salesperson`);
    req.flush('Server error', { status: 500, statusText: 'Internal Server Error' });
    fixture.detectChanges();

    expect(component.errorMessage).toBe('Unable to load sales data. Please try again later.');

    const compiled = fixture.nativeElement;
    const errorEl = compiled.querySelector('.message--error');
    expect(errorEl).toBeTruthy();
    expect(errorEl.textContent).toContain('Unable to load sales data');
  });
});