import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService, ToastService } from '../../../core/services';
import { FraudReport } from '../../../core/models';

@Component({
  selector: 'app-admin-fraud-reports',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="fraud-page">
      <div class="page-header">
        <h2>Fraud Reports Management</h2>
        <div class="search-bar">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
          <input type="text" placeholder="Search by doctor name..." [value]="searchQuery()" (input)="onSearch($event)" class="search-input">
        </div>
      </div>

      <div class="filters">
        <button class="filter-btn" [class.active]="filter() === 'ALL'" (click)="filter.set('ALL')">All</button>
        <button class="filter-btn" [class.active]="filter() === 'OPEN'" (click)="filter.set('OPEN')">Open</button>
        <button class="filter-btn" [class.active]="filter() === 'REVIEWED'" (click)="filter.set('REVIEWED')">Reviewed</button>
        <button class="filter-btn" [class.active]="filter() === 'RESOLVED'" (click)="filter.set('RESOLVED')">Resolved</button>
      </div>

      @if (isLoading()) {
        <div class="loading-state"><div class="spinner"></div><p>Loading...</p></div>
      } @else if (filteredReports().length === 0) {
        <div class="empty-state"><p>No reports found.</p></div>
      } @else {
        <div class="reports-list">
          @for (report of filteredReports(); track report.id) {
            <div class="report-card" (click)="selectReport(report)">
              <div class="report-header">
                <div>
                  <span class="patient-name">{{ report.patient.name }}</span>
                  <span class="arrow">→</span>
                  <span class="doctor-name">Dr. {{ report.doctor.name }}</span>
                </div>
                <span class="status-badge" [class]="'status-' + report.reportStatus.toLowerCase()">{{ report.reportStatus }}</span>
              </div>
              <p class="report-desc">{{ report.reason }}</p>
              <div class="report-footer">
                <span class="report-date">{{ report.createdAt | date:'medium' }}</span>
                <div class="actions">
                  @if (report.reportStatus === 'OPEN') {
                    <button class="btn btn-sm btn-outline" (click)="reviewReport(report.id); $event.stopPropagation()">Mark Reviewed</button>
                  }
                  @if (report.reportStatus !== 'RESOLVED') {
                    <button class="btn btn-sm btn-primary" (click)="resolveReport(report.id); $event.stopPropagation()">Resolve</button>
                  }
                </div>
              </div>
            </div>
          }
        </div>
      }
    </div>

    <!-- Detail Modal -->
    @if (selectedReport(); as report) {
      <div class="modal-overlay" (click)="selectedReport.set(null)">
        <div class="modal-content" (click)="$event.stopPropagation()">
          <div class="modal-header">
            <h2>Fraud Report Details</h2>
            <button class="close-btn" (click)="selectedReport.set(null)">✕</button>
          </div>
          <div class="modal-body">
            <div class="report-status-row">
              <span class="status-badge large" [class]="'status-' + report.reportStatus.toLowerCase()">{{ report.reportStatus }}</span>
              <span class="report-date">Reported: {{ report.createdAt | date:'medium' }}</span>
            </div>

            <div class="section">
              <h4 class="section-title">Complaint</h4>
              <p class="complaint-text">{{ report.reason }}</p>
            </div>

            <div class="details-row">
              <div class="person-card">
                <div class="person-avatar patient-bg">{{ report.patient.name.charAt(0) || 'P' }}</div>
                <h4>Patient</h4>
                <p class="person-name">{{ report.patient.name }}</p>
                @if (report.patient.phone) { <p class="person-detail">📞 {{ report.patient.phone }}</p> }
                @if (report.patient.location) { <p class="person-detail"> {{ report.patient.location }}</p> }
                @if (report.patient.age) { <p class="person-detail">{{ report.patient.age }} yrs, {{ report.patient.gender }}</p> }
              </div>
              <div class="person-card">
                <div class="person-avatar doctor-bg">{{ report.doctor.name.charAt(0) || 'D' }}</div>
                <h4>Doctor</h4>
                <p class="person-name">Dr. {{ report.doctor.name }}</p>
                @if (report.doctor.qualification) { <p class="person-detail">🎓 {{ report.doctor.qualification }}</p> }
                @if (report.doctor.experience) { <p class="person-detail">⏱️ {{ report.doctor.experience }} yrs exp</p> }
                @if (report.doctor.location) { <p class="person-detail"> {{ report.doctor.location }}</p> }
                @if (report.doctor.hospital) { <p class="person-detail">🏥 {{ report.doctor.hospital.name }}</p> }
              </div>
            </div>
          </div>

          <div class="modal-footer">
            @if (report.reportStatus === 'OPEN') {
              <button class="btn btn-review" (click)="reviewReport(report.id)">Mark Reviewed</button>
            }
            @if (report.reportStatus !== 'RESOLVED') {
              <button class="btn btn-resolve" (click)="resolveReport(report.id)">Resolve</button>
            }
          </div>
        </div>
      </div>
    }
  `,
  styles: [`
    .fraud-page { padding: 0; }
    .page-header { display: flex; align-items: center; justify-content: space-between; gap: 1rem; margin-bottom: 1rem; }
    .page-header h2 { font-size: 1.5rem; font-weight: 600; margin: 0; }
    .search-bar { display: flex; align-items: center; gap: 0.5rem; padding: 0.5rem 0.75rem; background: var(--bg-primary); border: 1px solid var(--border-color); border-radius: 8px; width: 45%; flex-shrink: 0; }
    .search-bar svg { color: var(--text-muted); flex-shrink: 0; }
    .search-input { flex: 1; border: none; background: transparent; outline: none; font-size: 0.875rem; color: var(--text-primary); }
    .search-input::placeholder { color: var(--text-muted); }
    .filters { display: flex; gap: 0.5rem; margin-bottom: 1.5rem; }
    .filter-btn { padding: 0.375rem 0.75rem; border: 1px solid var(--border-color); border-radius: 6px; background: var(--surface-secondary); color: var(--text-secondary); cursor: pointer; font-size: 0.8125rem; transition: all 0.2s; }
    .filter-btn:hover { background: var(--surface-hover); color: var(--text-primary); }
    .filter-btn.active { background: #1a1a1a; color: #ffffff; border-color: #1a1a1a; }
    .reports-list { display: flex; flex-direction: column; gap: 1rem; }
    .report-card { background: var(--surface-secondary); border: 1px solid var(--border-color); border-radius: 12px; padding: 1.25rem; cursor: pointer; transition: transform 0.2s, box-shadow 0.2s; }
    .report-card:hover { transform: translateY(-2px); box-shadow: 0 4px 12px rgba(0,0,0,0.08); }
    .report-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.5rem; }
    .patient-name, .doctor-name { font-weight: 600; font-size: 0.875rem; }
    .arrow { margin: 0 0.5rem; color: var(--text-secondary); }
    .status-badge { font-size: 0.75rem; padding: 0.25rem 0.5rem; border-radius: 4px; font-weight: 500; }
    .status-badge.large { font-size: 0.8125rem; padding: 0.375rem 0.75rem; }
    .status-open { background: #fff3e0; color: #e65100; }
    .status-reviewed { background: #e3f2fd; color: #1565c0; }
    .status-resolved { background: #e8f5e9; color: #2e7d32; }
    .report-desc { margin: 0 0 0.75rem; font-size: 0.9375rem; color: var(--text-primary); }
    .report-footer { display: flex; justify-content: space-between; align-items: center; }
    .report-date { font-size: 0.75rem; color: var(--text-secondary); }
    .actions { display: flex; gap: 0.5rem; }
    .btn { padding: 0.5rem 1rem; border: none; border-radius: 6px; font-size: 0.8125rem; font-weight: 500; cursor: pointer; }
    .btn-sm { padding: 0.375rem 0.75rem; }
    .btn-primary { background: #1a1a1a; color: #ffffff; }
    .btn-outline { background: transparent; border: 1px solid var(--border-color); color: var(--text-primary); }
    .loading-state { text-align: center; padding: 2rem; }
    .spinner { width: 32px; height: 32px; border: 3px solid var(--border-color); border-top-color: var(--text-primary); border-radius: 50%; animation: spin 1s linear infinite; margin: 0 auto 0.5rem; }
    @keyframes spin { to { transform: rotate(360deg); } }
    .empty-state { text-align: center; padding: 2rem; color: var(--text-secondary); }

    /* Modal */
    .modal-overlay { position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; z-index: 1000; padding: 1rem; }
    .modal-content { background: var(--bg-primary); border: 1px solid var(--border-color); border-radius: 12px; width: 100%; max-width: 560px; max-height: 90vh; overflow-y: auto; box-shadow: 0 20px 60px rgba(0,0,0,0.3); }
    .modal-header { display: flex; justify-content: space-between; align-items: center; padding: 1.25rem; border-bottom: 1px solid var(--border-color); }
    .modal-header h2 { margin: 0; font-size: 1.25rem; font-weight: 600; color: var(--text-primary); }
    .close-btn { background: none; border: none; font-size: 1.25rem; cursor: pointer; color: var(--text-secondary); padding: 0.25rem; }
    .close-btn:hover { color: var(--text-primary); }
    .modal-body { padding: 1.25rem; }
    .report-status-row { display: flex; align-items: center; gap: 1rem; margin-bottom: 1.25rem; }
    .section { margin-bottom: 1.25rem; }
    .section-title { font-size: 0.875rem; font-weight: 600; color: var(--text-secondary); margin: 0 0 0.5rem; }
    .complaint-text { background: var(--bg-secondary); border: 1px solid var(--border-color); border-radius: 8px; padding: 0.875rem; margin: 0; font-size: 0.9375rem; color: var(--text-primary); line-height: 1.5; }
    .details-row { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }
    .person-card { background: var(--bg-secondary); border: 1px solid var(--border-color); border-radius: 10px; padding: 1rem; text-align: center; }
    .person-avatar { width: 48px; height: 48px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 1.25rem; font-weight: 600; color: white; margin: 0 auto 0.5rem; }
    .patient-bg { background: linear-gradient(135deg, #f59e0b, #d97706); }
    .doctor-bg { background: linear-gradient(135deg, #6366f1, #8b5cf6); }
    .person-card h4 { font-size: 0.75rem; color: var(--text-muted); margin: 0 0 0.25rem; text-transform: uppercase; letter-spacing: 0.5px; }
    .person-name { font-size: 0.9375rem; font-weight: 600; color: var(--text-primary); margin: 0 0 0.5rem; }
    .person-detail { font-size: 0.8125rem; color: var(--text-secondary); margin: 0.25rem 0; }
    .modal-footer { padding: 1rem 1.25rem; border-top: 1px solid var(--border-color); display: flex; gap: 0.75rem; justify-content: flex-end; background: var(--bg-secondary); border-radius: 0 0 12px 12px; }
    .btn-review { background: #1565c0; color: white; }
    .btn-review:hover { background: #0d47a1; }
    .btn-resolve { background: #2e7d32; color: white; }
    .btn-resolve:hover { background: #1b5e20; }
  `]
})
export class AdminFraudReportsComponent implements OnInit {
  private apiService = inject(ApiService);
  private toastService = inject(ToastService);

  reports = signal<FraudReport[]>([]);
  filter = signal<string>('ALL');
  isLoading = signal(true);
  selectedReport = signal<FraudReport | null>(null);
  searchQuery = signal('');

  filteredReports = computed(() => {
    const f = this.filter();
    const query = this.searchQuery().toLowerCase();
    let result = this.reports();
    if (f !== 'ALL') {
      result = result.filter(r => r.reportStatus === f);
    }
    if (query) {
      result = result.filter(r => r.doctor?.name?.toLowerCase().includes(query));
    }
    return result;
  });

  onSearch(event: Event): void {
    this.searchQuery.set((event.target as HTMLInputElement).value);
  }

  ngOnInit(): void {
    this.loadReports();
  }

  loadReports(): void {
    this.isLoading.set(true);
    this.apiService.getAllFraudReports().subscribe({
      next: (data: any) => {
        this.reports.set(data);
        this.isLoading.set(false);
      },
      error: () => this.isLoading.set(false)
    });
  }

  selectReport(report: FraudReport): void {
    this.selectedReport.set(report);
  }

  reviewReport(id: number): void {
    this.apiService.reviewFraudReport(id).subscribe({
      next: () => { this.toastService.success('Report marked as reviewed'); this.selectedReport.set(null); this.loadReports(); },
      error: () => this.toastService.error('Failed to update report')
    });
  }

  resolveReport(id: number): void {
    this.apiService.resolveFraudReport(id).subscribe({
      next: () => { this.toastService.success('Report resolved'); this.selectedReport.set(null); this.loadReports(); },
      error: () => this.toastService.error('Failed to resolve report')
    });
  }
}
