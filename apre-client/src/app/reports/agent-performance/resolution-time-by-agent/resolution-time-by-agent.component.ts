import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ChartComponent } from '../../../shared/chart/chart.component';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-resolution-time-by-agent',
  standalone: true,
  imports: [CommonModule, ChartComponent],
  template: `
    <div>
      <h1>Agent Performance By Resolution Time</h1>

      <br />
      <div *ngIf="showChart" class="chart-container">
        <div class="card chart-card">
          <app-chart
            [type]="'bar'"
            [label]="'Average Resolution Time (minutes)'"
            [data]="resolutionTimeData"
            [labels]="agents">
          </app-chart>
        </div>
      </div>
    </div>
  `,
  styles: `
    .chart-container {
      width: 50%;
      margin: 0 auto;
    }

    .chart-card {
      width: 100%;
      margin: 20px 0;
    }
  `
})
export class ResolutionTimeByAgentComponent {
  resolutionTimeData: number[] = []; // Initially empty
  agents: string[] = []; // Initially empty
  showChart: boolean = false; // Initially hidden

  constructor(private http: HttpClient) {
    this.fetchResolutionTimeData();
  }

  fetchResolutionTimeData() {
    console.log('Fetching agent performance by resolution time');

    this.http.get(`${environment.apiBaseUrl}/reports/agent-performance/resolution-time`).subscribe({
      next: (data: any) => {
        this.agents = data[0].agents;
        this.resolutionTimeData = data[0].resolutionTimes;
        console.log(data[0]);
        console.log('Agents: ', data[0].agents);
        console.log('Resolution times: ', data[0].resolutionTimes);
      },
      error: (error: any) => {
        console.error('Error fetching agent performance by resolution time data:', error);
      },
      complete: () => {
        this.showChart = true; // Show chart after fetching data
      }
    });
  }
}