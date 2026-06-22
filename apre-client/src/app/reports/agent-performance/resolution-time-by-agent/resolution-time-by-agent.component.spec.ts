import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { ResolutionTimeByAgentComponent } from './resolution-time-by-agent.component';
import { environment } from '../../../../environments/environment';

describe('ResolutionTimeByAgentComponent', () => {
  let component: ResolutionTimeByAgentComponent;
  let fixture: ComponentFixture<ResolutionTimeByAgentComponent>;
  let httpMock: HttpTestingController;

  const mockResolutionData = [
    {
      agents: ['Agent A', 'Agent B'],
      resolutionTimes: [12.5, 9.75]
    }
  ];

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HttpClientTestingModule, ResolutionTimeByAgentComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ResolutionTimeByAgentComponent);
    component = fixture.componentInstance;
    httpMock = TestBed.inject(HttpTestingController);

    // fetchResolutionTimeData() is called from the constructor, so the
    // request is already in-flight before any test body runs. Flush it
    // here so each test starts from a clean, resolved state.
    const req = httpMock.expectOne(`${environment.apiBaseUrl}/reports/agent-performance/resolution-time`);
    req.flush(mockResolutionData);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should populate agents and resolutionTimeData from the API response', () => {
    expect(component.agents).toEqual(['Agent A', 'Agent B']);
    expect(component.resolutionTimeData).toEqual([12.5, 9.75]);
    expect(component.showChart).toBeTrue();
  });

  it('should render the chart once data has loaded', () => {
    fixture.detectChanges();

    const compiled = fixture.nativeElement;
    const chartEl = compiled.querySelector('app-chart');
    expect(chartEl).toBeTruthy();
  });
});