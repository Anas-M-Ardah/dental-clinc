import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subject, takeUntil, forkJoin } from 'rxjs';
import { ApiService } from '../../core/services/api.service';

@Component({
  selector: 'app-reports',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="page-header">
      <h2>Reports & Analytics</h2>
      <div class="date-filters">
        <input type="date" class="form-control" [(ngModel)]="startDate">
        <span>to</span>
        <input type="date" class="form-control" [(ngModel)]="endDate">
        <button class="btn btn-primary" (click)="loadAll()">Apply</button>
      </div>
    </div>

    <!-- Tab Nav -->
    <div class="tab-nav">
      <button *ngFor="let tab of tabs" class="tab-btn" [class.active]="activeTab === tab.key" (click)="activeTab = tab.key">
        {{ tab.label }}
      </button>
    </div>

    <!-- Revenue Tab -->
    <div *ngIf="activeTab === 'revenue'" class="tab-content">
      <div class="stats-row">
        <div class="stat-card">
          <div class="stat-label">Total Revenue</div>
          <div class="stat-value">JOD {{ revenue?.totalRevenue | number:'1.2-2' }}</div>
        </div>
        <div class="stat-card">
          <div class="stat-label">Avg Invoice</div>
          <div class="stat-value">JOD {{ revenue?.averageInvoiceAmount | number:'1.2-2' }}</div>
        </div>
        <div class="stat-card">
          <div class="stat-label">Invoices Paid</div>
          <div class="stat-value">{{ revenue?.totalInvoicesPaid }}</div>
        </div>
      </div>

      <!-- Revenue Chart -->
      <div class="card chart-card" *ngIf="revenue?.byPeriod?.length">
        <div class="card-header">
          <h3>Revenue Trend</h3>
          <button class="btn btn-sm btn-outline-secondary" (click)="exportCsv('revenue')">Export CSV</button>
        </div>
        <div class="chart-container">
          <svg [attr.viewBox]="'0 0 ' + chartWidth + ' ' + chartHeight" class="chart-svg">
            <!-- Grid lines -->
            <line *ngFor="let y of [0,1,2,3,4]" [attr.x1]="chartPadding" [attr.x2]="chartWidth - 20"
              [attr.y1]="chartPadding + y * (chartInnerHeight/4)" [attr.y2]="chartPadding + y * (chartInnerHeight/4)"
              stroke="#e5e7eb" stroke-width="1"/>
            <!-- Bars -->
            <g *ngFor="let item of revenue.byPeriod; let i = index">
              <rect [attr.x]="getBarX(i, revenue.byPeriod.length)" [attr.y]="getBarY(item.revenue, revenueMax)"
                [attr.width]="getBarWidth(revenue.byPeriod.length)" [attr.height]="getBarHeight(item.revenue, revenueMax)"
                fill="var(--primary)" rx="3" class="chart-bar"/>
              <text [attr.x]="getBarX(i, revenue.byPeriod.length) + getBarWidth(revenue.byPeriod.length)/2"
                [attr.y]="chartHeight - 5" text-anchor="middle" class="chart-label">{{ item.period.substring(5) }}</text>
              <text [attr.x]="getBarX(i, revenue.byPeriod.length) + getBarWidth(revenue.byPeriod.length)/2"
                [attr.y]="getBarY(item.revenue, revenueMax) - 5" text-anchor="middle" class="chart-value">
                {{ item.revenue | number:'1.0-0' }}
              </text>
            </g>
          </svg>
        </div>
      </div>

      <!-- Revenue by Doctor & Treatment -->
      <div class="grid-2">
        <div class="card" *ngIf="revenue?.byDoctor?.length">
          <div class="card-header"><h3>By Doctor</h3></div>
          <div class="card-body">
            <div *ngFor="let d of revenue.byDoctor" class="breakdown-row">
              <span class="breakdown-name">{{ d.name }}</span>
              <div class="breakdown-bar-wrap">
                <div class="breakdown-bar" [style.width.%]="(d.revenue / revenue.totalRevenue * 100)"></div>
              </div>
              <span class="breakdown-value">JOD {{ d.revenue | number:'1.0-0' }}</span>
            </div>
          </div>
        </div>
        <div class="card" *ngIf="revenue?.byTreatment?.length">
          <div class="card-header"><h3>By Treatment</h3></div>
          <div class="card-body">
            <div *ngFor="let t of revenue.byTreatment" class="breakdown-row">
              <span class="breakdown-name">{{ t.name }}</span>
              <div class="breakdown-bar-wrap">
                <div class="breakdown-bar bg-success" [style.width.%]="(t.revenue / revenue.totalRevenue * 100)"></div>
              </div>
              <span class="breakdown-value">JOD {{ t.revenue | number:'1.0-0' }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Patients Tab -->
    <div *ngIf="activeTab === 'patients'" class="tab-content">
      <div class="stats-row">
        <div class="stat-card"><div class="stat-label">Total</div><div class="stat-value">{{ patients?.totalPatients }}</div></div>
        <div class="stat-card"><div class="stat-label">New This Month</div><div class="stat-value">{{ patients?.newPatientsThisMonth }}</div></div>
        <div class="stat-card"><div class="stat-label">Active (6mo)</div><div class="stat-value">{{ patients?.activePatients }}</div></div>
        <div class="stat-card"><div class="stat-label">Male</div><div class="stat-value">{{ patients?.maleCount }}</div></div>
        <div class="stat-card"><div class="stat-label">Female</div><div class="stat-value">{{ patients?.femaleCount }}</div></div>
      </div>
      <div class="grid-2">
        <div class="card" *ngIf="patients?.ageBrackets?.length">
          <div class="card-header"><h3>Age Distribution</h3></div>
          <div class="card-body">
            <div *ngFor="let b of patients.ageBrackets" class="breakdown-row">
              <span class="breakdown-name">{{ b.bracket }}</span>
              <div class="breakdown-bar-wrap">
                <div class="breakdown-bar bg-info" [style.width.%]="(b.count / patients.totalPatients * 100)"></div>
              </div>
              <span class="breakdown-value">{{ b.count }}</span>
            </div>
          </div>
        </div>
        <div class="card" *ngIf="patients?.monthlyNewPatients?.length">
          <div class="card-header"><h3>New Patients Trend</h3></div>
          <div class="chart-container">
            <svg [attr.viewBox]="'0 0 ' + chartWidth + ' ' + chartHeight" class="chart-svg">
              <line *ngFor="let y of [0,1,2,3,4]" [attr.x1]="chartPadding" [attr.x2]="chartWidth - 20"
                [attr.y1]="chartPadding + y * (chartInnerHeight/4)" [attr.y2]="chartPadding + y * (chartInnerHeight/4)"
                stroke="#e5e7eb" stroke-width="1"/>
              <g *ngFor="let item of patients.monthlyNewPatients; let i = index">
                <rect [attr.x]="getBarX(i, patients.monthlyNewPatients.length)" [attr.y]="getBarY(item.count, newPatientsMax)"
                  [attr.width]="getBarWidth(patients.monthlyNewPatients.length)" [attr.height]="getBarHeight(item.count, newPatientsMax)"
                  fill="var(--info, #3b82f6)" rx="3" class="chart-bar"/>
                <text [attr.x]="getBarX(i, patients.monthlyNewPatients.length) + getBarWidth(patients.monthlyNewPatients.length)/2"
                  [attr.y]="chartHeight - 5" text-anchor="middle" class="chart-label">{{ item.month.substring(5) }}</text>
              </g>
            </svg>
          </div>
        </div>
      </div>
    </div>

    <!-- Appointments Tab -->
    <div *ngIf="activeTab === 'appointments'" class="tab-content">
      <div class="stats-row">
        <div class="stat-card"><div class="stat-label">Total</div><div class="stat-value">{{ appts?.totalAppointments }}</div></div>
        <div class="stat-card stat-success"><div class="stat-label">Completion Rate</div><div class="stat-value">{{ appts?.completionRate }}%</div></div>
        <div class="stat-card stat-danger"><div class="stat-label">Cancellation Rate</div><div class="stat-value">{{ appts?.cancellationRate }}%</div></div>
        <div class="stat-card stat-warning"><div class="stat-label">No-Show Rate</div><div class="stat-value">{{ appts?.noShowRate }}%</div></div>
      </div>

      <div class="card chart-card" *ngIf="appts?.monthlyTrend?.length">
        <div class="card-header">
          <h3>Monthly Appointments</h3>
          <button class="btn btn-sm btn-outline-secondary" (click)="exportCsv('appointments')">Export CSV</button>
        </div>
        <div class="chart-container">
          <svg [attr.viewBox]="'0 0 ' + chartWidth + ' ' + chartHeight" class="chart-svg">
            <line *ngFor="let y of [0,1,2,3,4]" [attr.x1]="chartPadding" [attr.x2]="chartWidth - 20"
              [attr.y1]="chartPadding + y * (chartInnerHeight/4)" [attr.y2]="chartPadding + y * (chartInnerHeight/4)"
              stroke="#e5e7eb" stroke-width="1"/>
            <g *ngFor="let item of appts.monthlyTrend; let i = index">
              <rect [attr.x]="getBarX(i, appts.monthlyTrend.length)"
                [attr.y]="getBarY(item.total, apptMax)"
                [attr.width]="getBarWidth(appts.monthlyTrend.length)"
                [attr.height]="getBarHeight(item.total, apptMax)"
                fill="var(--primary)" rx="3" opacity="0.3" class="chart-bar"/>
              <rect [attr.x]="getBarX(i, appts.monthlyTrend.length)"
                [attr.y]="getBarY(item.completed, apptMax)"
                [attr.width]="getBarWidth(appts.monthlyTrend.length)"
                [attr.height]="getBarHeight(item.completed, apptMax)"
                fill="var(--success, #22c55e)" rx="3" class="chart-bar"/>
              <text [attr.x]="getBarX(i, appts.monthlyTrend.length) + getBarWidth(appts.monthlyTrend.length)/2"
                [attr.y]="chartHeight - 5" text-anchor="middle" class="chart-label">{{ item.month.substring(5) }}</text>
            </g>
          </svg>
        </div>
        <div class="chart-legend">
          <span class="legend-item"><span class="legend-dot" style="background:var(--primary);opacity:0.3"></span> Total</span>
          <span class="legend-item"><span class="legend-dot" style="background:var(--success, #22c55e)"></span> Completed</span>
        </div>
      </div>

      <div class="card" *ngIf="appts?.byStatus?.length">
        <div class="card-header"><h3>By Status</h3></div>
        <div class="card-body">
          <div *ngFor="let s of appts.byStatus" class="breakdown-row">
            <span class="breakdown-name">{{ s.status }}</span>
            <div class="breakdown-bar-wrap">
              <div class="breakdown-bar" [style.width.%]="(s.count / appts.totalAppointments * 100)"
                [style.background]="getStatusColor(s.status)"></div>
            </div>
            <span class="breakdown-value">{{ s.count }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Doctors Tab -->
    <div *ngIf="activeTab === 'doctors'" class="tab-content">
      <div class="card">
        <div class="card-header">
          <h3>Doctor Performance</h3>
          <button class="btn btn-sm btn-outline-secondary" (click)="exportCsv('doctors')">Export CSV</button>
        </div>
        <div class="card-body" style="padding:0">
          <table class="table mb-0" *ngIf="doctorPerf?.length">
            <thead>
              <tr>
                <th>Doctor</th>
                <th>Specialization</th>
                <th>Completed</th>
                <th>Cancelled</th>
                <th>No Shows</th>
                <th>Revenue</th>
                <th>Completion %</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let d of doctorPerf">
                <td><strong>{{ d.doctorName }}</strong></td>
                <td>{{ d.specialization }}</td>
                <td>{{ d.appointmentsCompleted }}</td>
                <td>{{ d.appointmentsCancelled }}</td>
                <td>{{ d.noShows }}</td>
                <td class="amount-cell">JOD {{ d.revenue | number:'1.2-2' }}</td>
                <td>
                  <div class="completion-bar-wrap">
                    <div class="completion-bar" [style.width.%]="d.completionRate"
                      [style.background]="d.completionRate >= 80 ? 'var(--success,#22c55e)' : d.completionRate >= 50 ? 'var(--warning,#f59e0b)' : 'var(--danger,#ef4444)'"></div>
                    <span>{{ d.completionRate }}%</span>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- Treatments Tab -->
    <div *ngIf="activeTab === 'treatments'" class="tab-content">
      <div class="card">
        <div class="card-header">
          <h3>Treatment Popularity</h3>
          <button class="btn btn-sm btn-outline-secondary" (click)="exportCsv('treatments')">Export CSV</button>
        </div>
        <div class="card-body" style="padding:0">
          <table class="table mb-0" *ngIf="treatmentPop?.length">
            <thead>
              <tr>
                <th>Treatment</th>
                <th>Appointments</th>
                <th>Billed Qty</th>
                <th>Revenue</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let t of treatmentPop">
                <td><strong>{{ t.treatmentName }}</strong></td>
                <td>{{ t.appointmentCount }}</td>
                <td>{{ t.invoiceItemCount }}</td>
                <td class="amount-cell">JOD {{ t.totalRevenue | number:'1.2-2' }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- Monthly Summary Tab -->
    <div *ngIf="activeTab === 'summary'" class="tab-content">
      <div class="card">
        <div class="card-header">
          <h3>Monthly Summary</h3>
          <button class="btn btn-sm btn-outline-secondary" (click)="api.exportCsv('monthly-summary')">Export CSV</button>
        </div>
        <div class="card-body" style="padding:0">
          <div class="table-responsive">
            <table class="table mb-0" *ngIf="monthlySummary?.length">
              <thead>
                <tr>
                  <th>Month</th>
                  <th>New Patients</th>
                  <th>Appointments</th>
                  <th>Completed</th>
                  <th>Cancelled</th>
                  <th>Revenue</th>
                  <th>Invoices</th>
                </tr>
              </thead>
              <tbody>
                <tr *ngFor="let m of monthlySummary">
                  <td><strong>{{ m.month }}</strong></td>
                  <td>{{ m.newPatients }}</td>
                  <td>{{ m.totalAppointments }}</td>
                  <td>{{ m.completedAppointments }}</td>
                  <td>{{ m.cancelledAppointments }}</td>
                  <td class="amount-cell">JOD {{ m.revenue | number:'1.2-2' }}</td>
                  <td>{{ m.invoicesPaid }} / {{ m.invoicesCreated }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .page-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 24px; flex-wrap: wrap; gap: 12px; }
    .page-header h2 { margin: 0; font-size: 1.5rem; font-weight: 800; letter-spacing: -0.03em; }
    .date-filters { display: flex; align-items: center; gap: 8px; }
    .date-filters .form-control { width: 150px; }
    .date-filters span { color: var(--gray-400); font-size: 0.85rem; }

    .tab-nav { display: flex; gap: 4px; margin-bottom: 24px; background: #fff; padding: 4px; border-radius: var(--radius-lg); border: 1px solid var(--border-color); }
    .tab-btn {
      padding: 8px 16px; border: none; background: transparent; border-radius: var(--radius-md);
      font-size: 0.85rem; font-weight: 600; color: var(--gray-500); cursor: pointer; transition: all 0.2s;
    }
    .tab-btn.active { background: var(--primary); color: #fff; }
    .tab-btn:hover:not(.active) { background: var(--gray-50); }

    .tab-content { animation: fadeIn 0.2s ease; }
    @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }

    .stats-row { display: grid; grid-template-columns: repeat(auto-fit, minmax(160px, 1fr)); gap: 16px; margin-bottom: 24px; }
    .stat-card {
      background: #fff; border: 1px solid var(--border-color); border-radius: var(--radius-lg);
      padding: 20px; box-shadow: var(--shadow-xs);
    }
    .stat-label { font-size: 0.72rem; font-weight: 600; text-transform: uppercase; letter-spacing: 0.8px; color: var(--gray-400); margin-bottom: 4px; }
    .stat-value { font-size: 1.5rem; font-weight: 800; color: var(--gray-900); }
    .stat-success .stat-value { color: var(--success, #22c55e); }
    .stat-danger .stat-value { color: var(--danger, #ef4444); }
    .stat-warning .stat-value { color: var(--warning, #f59e0b); }

    .grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-top: 20px; }
    @media (max-width: 768px) { .grid-2 { grid-template-columns: 1fr; } }

    .card { background: #fff; border: 1px solid var(--border-color); border-radius: var(--radius-lg); box-shadow: var(--shadow-xs); overflow: hidden; margin-bottom: 20px; }
    .card-header { display: flex; align-items: center; justify-content: space-between; padding: 16px 20px; border-bottom: 1px solid var(--border-color); }
    .card-header h3 { margin: 0; font-size: 0.95rem; font-weight: 700; }
    .card-body { padding: 20px; }

    .chart-card { margin-bottom: 24px; }
    .chart-container { padding: 20px; }
    .chart-svg { width: 100%; height: auto; }
    .chart-bar { transition: opacity 0.2s; }
    .chart-bar:hover { opacity: 0.8; }
    .chart-label { font-size: 10px; fill: var(--gray-400); }
    .chart-value { font-size: 9px; fill: var(--gray-600); font-weight: 600; }
    .chart-legend { display: flex; gap: 16px; padding: 0 20px 16px; }
    .legend-item { display: flex; align-items: center; gap: 6px; font-size: 0.78rem; color: var(--gray-500); }
    .legend-dot { width: 12px; height: 12px; border-radius: 3px; display: inline-block; }

    .breakdown-row { display: flex; align-items: center; gap: 12px; padding: 8px 0; }
    .breakdown-name { width: 120px; font-size: 0.82rem; font-weight: 600; color: var(--gray-700); flex-shrink: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
    .breakdown-bar-wrap { flex: 1; height: 8px; background: var(--gray-100); border-radius: 4px; overflow: hidden; }
    .breakdown-bar { height: 100%; background: var(--primary); border-radius: 4px; transition: width 0.5s ease; min-width: 2px; }
    .breakdown-bar.bg-success { background: var(--success, #22c55e); }
    .breakdown-bar.bg-info { background: var(--info, #3b82f6); }
    .breakdown-value { font-size: 0.82rem; font-weight: 700; color: var(--gray-900); min-width: 80px; text-align: right; }

    .amount-cell { font-weight: 700; font-variant-numeric: tabular-nums; }
    .table-responsive { overflow-x: auto; }

    .completion-bar-wrap { display: flex; align-items: center; gap: 8px; }
    .completion-bar-wrap span { font-size: 0.8rem; font-weight: 600; min-width: 40px; }
    .completion-bar { height: 6px; border-radius: 3px; }
  `]
})
export class ReportsComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  tabs = [
    { key: 'revenue', label: 'Revenue' },
    { key: 'patients', label: 'Patients' },
    { key: 'appointments', label: 'Appointments' },
    { key: 'doctors', label: 'Doctors' },
    { key: 'treatments', label: 'Treatments' },
    { key: 'summary', label: 'Monthly Summary' }
  ];
  activeTab = 'revenue';

  startDate = '';
  endDate = '';

  revenue: any = null;
  patients: any = null;
  appts: any = null;
  doctorPerf: any[] = [];
  treatmentPop: any[] = [];
  monthlySummary: any[] = [];

  // Chart dimensions
  chartWidth = 600;
  chartHeight = 250;
  chartPadding = 30;
  chartInnerHeight = 190;

  revenueMax = 1;
  newPatientsMax = 1;
  apptMax = 1;

  constructor(public api: ApiService) {}

  ngOnInit() {
    const now = new Date();
    this.endDate = now.toISOString().substring(0, 10);
    this.startDate = new Date(now.getFullYear(), now.getMonth() - 11, 1).toISOString().substring(0, 10);
    this.loadAll();
  }

  ngOnDestroy() { this.destroy$.next(); this.destroy$.complete(); }

  loadAll() {
    forkJoin({
      revenue: this.api.getRevenueReport(this.startDate, this.endDate),
      patients: this.api.getPatientStats(),
      appts: this.api.getAppointmentAnalytics(this.startDate, this.endDate),
      doctors: this.api.getDoctorPerformance(this.startDate, this.endDate),
      treatments: this.api.getTreatmentPopularity(this.startDate, this.endDate),
      summary: this.api.getMonthlySummary(12)
    }).pipe(takeUntil(this.destroy$)).subscribe({
      next: data => {
        this.revenue = data.revenue;
        this.patients = data.patients;
        this.appts = data.appts;
        this.doctorPerf = data.doctors;
        this.treatmentPop = data.treatments;
        this.monthlySummary = data.summary;

        this.revenueMax = Math.max(...(this.revenue?.byPeriod?.map((p: any) => p.revenue) || [1]), 1);
        this.newPatientsMax = Math.max(...(this.patients?.monthlyNewPatients?.map((p: any) => p.count) || [1]), 1);
        this.apptMax = Math.max(...(this.appts?.monthlyTrend?.map((m: any) => m.total) || [1]), 1);
      }
    });
  }

  // Chart helpers
  getBarX(index: number, total: number): number {
    const availableWidth = this.chartWidth - this.chartPadding - 20;
    const barGroupWidth = availableWidth / total;
    return this.chartPadding + index * barGroupWidth + barGroupWidth * 0.1;
  }

  getBarWidth(total: number): number {
    const availableWidth = this.chartWidth - this.chartPadding - 20;
    return (availableWidth / total) * 0.8;
  }

  getBarY(value: number, max: number): number {
    return this.chartPadding + this.chartInnerHeight * (1 - value / max);
  }

  getBarHeight(value: number, max: number): number {
    return this.chartInnerHeight * (value / max);
  }

  getStatusColor(status: string): string {
    const colors: Record<string, string> = {
      'Pending': '#f59e0b', 'Confirmed': '#3b82f6', 'InProgress': '#8b5cf6',
      'Completed': '#22c55e', 'Cancelled': '#ef4444', 'NoShow': '#6b7280'
    };
    return colors[status] || '#94a3b8';
  }

  exportCsv(type: string) {
    this.api.exportCsv(type, this.startDate, this.endDate);
  }
}
