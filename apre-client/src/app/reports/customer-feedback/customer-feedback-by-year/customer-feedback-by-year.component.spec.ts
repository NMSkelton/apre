import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { CustomerFeedbackByYearComponent } from './customer-feedback-by-year.component';
import { environment } from '../../../../environments/environment';

describe('CustomerFeedbackByYearComponent', () => {
  let component: CustomerFeedbackByYearComponent;
  let fixture: ComponentFixture<CustomerFeedbackByYearComponent>;
  let httpMock: HttpTestingController;

  const mockYears = [{ year: 2022 }, { year: 2023 }, { year: 2024 }];
  const mockFeedbackData = [
    {
      channels: ['Email', 'Phone', 'Chat'],
      ratingAvg: [4.2, 3.9, 4.7]
    }
  ];

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HttpClientTestingModule, CustomerFeedbackByYearComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CustomerFeedbackByYearComponent);
    component = fixture.componentInstance;
    httpMock = TestBed.inject(HttpTestingController);

    const yearsReq = httpMock.expectOne(`${environment.apiBaseUrl}/reports/customer-feedback/distinct-years`);
    yearsReq.flush(mockYears);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should populate the years dropdown from the distinct-years API on init', () => {
    expect(component.years).toEqual(mockYears);
    expect(component.years.length).toBe(3);
  });

  it('should fetch feedback data and populate channels and ratingAvg on valid form submit', () => {

    component.yearForm.controls['year'].setValue(2023 as any);
    component.onSubmit();

    const dataReq = httpMock.expectOne(
      `${environment.apiBaseUrl}/reports/customer-feedback/customer-feedback-by-year?year=2023`
    );
    expect(dataReq.request.method).toBe('GET');
    dataReq.flush(mockFeedbackData);

    expect(component.channels).toEqual(['Email', 'Phone', 'Chat']);
    expect(component.ratingAvg).toEqual([4.2, 3.9, 4.7]);
    expect(component.errorMessage).toBe('');
  });

  it('should set an error message when the form is submitted without a year selected', () => {

    component.yearForm.controls['year'].setValue(null);
    component.onSubmit();

    httpMock.expectNone(`${environment.apiBaseUrl}/reports/customer-feedback/customer-feedback-by-year`);
    expect(component.errorMessage).toBe('Please select a year');
  });

  it('should set an error message when the API returns no data for the selected year', () => {
    component.yearForm.controls['year'].setValue(2022 as any);
    component.onSubmit();

    const dataReq = httpMock.expectOne(
      `${environment.apiBaseUrl}/reports/customer-feedback/customer-feedback-by-year?year=2022`
    );
    dataReq.flush([]);

    expect(component.errorMessage).toBe('No data found for 2022');
    expect(component.channels).toEqual([]);
  });
});