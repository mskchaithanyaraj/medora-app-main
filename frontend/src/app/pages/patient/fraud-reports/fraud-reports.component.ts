import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService, ToastService } from '../../../core/services';
import { FraudReport, Doctor } from '../../../core/models';

@Component({
  selector: 'app-patient-fraud-reports',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="fraud-page">
      <div class="page-header">
        <div>
          <h2>Fraud Reports</h2>
          <p class="subtitle">Report fraudulent activities by doctors</p>
        </div>
        <div class="header-right">
          <div class="search-bar">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
            <input type="text" placeholder="Search by doctor name..." [value]="searchQuery()" (input)="onSearch($event)" class="search-input">
          </div>
          <button class="btn-report" (click)="showForm = !showForm">
          @if (showForm) {
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            Cancel
          } @else {
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            Report Fraud
          }
        </button>
        </div>
      </div>

      @if (showForm) {
        <div class="form-card">
          <div class="form-card-header">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
            <h3>Submit a Fraud Report</h3>
          </div>
          <div class="form-group">
            <label>Select Doctor</label>
            <select [(ngModel)]="selectedDoctorId" class="form-input">
              <option [ngValue]="null">-- Select Doctor --</option>
              @for (doc of doctors(); track doc.id) {
                <option [ngValue]="doc.id">Dr. {{ doc.name }} - {{ doc.qualification }}</option>
              }
            </select>
          </div>
          <div class="form-group">
            <label>Description</label>
            <textarea [(ngModel)]="description" class="form-input" rows="4" placeholder="Describe the fraudulent activity in detail..."></textarea>
          </div>
          <button class="btn-submit" (click)="submitReport()" [disabled]="!selectedDoctorId || !description.trim()">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
            Submit Report
          </button>
        </div>
      }

      @if (isLoading()) {
        <div class="loading-state"><div class="spinner"></div><p>Loading reports...</p></div>
      } @else if (reports().length === 0) {
        <div class="empty-state">
          <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
          <h3>No Reports Yet</h3>
          <p>You haven't submitted any fraud reports.</p>
        </div>
      } @else {
        <div class="reports-list">
          @for (report of filteredReports(); track report.id) {
            <div class="report-card">
              <div class="report-card-left">
                <div class="report-avatar">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
                </div>
              </div>
              <div class="report-card-body">
                <div class="report-header">
                  <span class="doctor-name">Dr. {{ report.doctor.name }}</span>
                  <span class="status-badge" [class]="'status-' + report.reportStatus.toLowerCase()">{{ report.reportStatus }}</span>
                </div>
                <p class="report-desc">{{ report.reason }}</p>
                <span class="report-date">{{ report.createdAt | date:'MMM d, y · h:mm a' }}</span>
              </div>
            </div>
          }
        </div>
      }
    </div>
  `,
  styles: [`
    .fraud-page { padding: 0; }
    .page-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 1.5rem; }
    .page-header h2 { font-size: 1.5rem; font-weight: 600; margin: 0 0 0.25rem; color: var(--text-primary); }
    .subtitle { font-size: 0.875rem; color: var(--text-secondary); margin: 0; }
    .header-right { display: flex; align-items: center; gap: 0.75rem; }
    .search-bar { display: flex; align-items: center; gap: 0.5rem; padding: 0.5rem 0.75rem; background: var(--bg-primary); border: 1px solid var(--border-color); border-radius: 8px; width: 220px; }
    .search-bar svg { color: var(--text-muted); flex-shrink: 0; }
    .search-input { flex: 1; border: none; background: transparent; outline: none; font-size: 0.875rem; color: var(--text-primary); }
    .search-input::placeholder { color: var(--text-muted); }
    
    .btn-report { display: flex; align-items: center; gap: 0.5rem; padding: 0.625rem 1.25rem; border: none; border-radius: 8px; font-size: 0.875rem; font-weight: 600; cursor: pointer; background: #dc2626; color: white; transition: all 0.2s; }
    .btn-report:hover { background: #b91c1c; transform: translateY(-1px); }
    
    .form-card { background: var(--bg-primary); border: 1px solid var(--border-color); border-radius: 12px; padding: 1.5rem; margin-bottom: 1.5rem; box-shadow: 0 2px 8px rgba(0,0,0,0.04); }
    .form-card-header { display: flex; align-items: center; gap: 0.75rem; margin-bottom: 1.25rem; color: #dc2626; }
    .form-card-header h3 { margin: 0; font-size: 1.125rem; color: var(--text-primary); }
    .form-group { margin-bottom: 1rem; }
    .form-group label { display: block; font-size: 0.8125rem; font-weight: 600; margin-bottom: 0.375rem; color: var(--text-primary); }
    .form-input { width: 100%; padding: 0.625rem 0.875rem; border: 1px solid var(--border-color); border-radius: 8px; background: var(--bg-secondary); color: var(--text-primary); font-size: 0.875rem; font-family: inherit; transition: border-color 0.2s; }
    .form-input:focus { outline: none; border-color: #dc2626; }
    textarea.form-input { resize: vertical; }
    
    .btn-submit { display: flex; align-items: center; gap: 0.5rem; padding: 0.625rem 1.25rem; border: none; border-radius: 8px; font-size: 0.875rem; font-weight: 600; cursor: pointer; background: #dc2626; color: white; transition: all 0.2s; }
    .btn-submit:hover { background: #b91c1c; }
    .btn-submit:disabled { opacity: 0.5; cursor: not-allowed; }
    
    .reports-list { display: flex; flex-direction: column; gap: 0.75rem; }
    .report-card { display: flex; gap: 1rem; background: var(--bg-primary); border: 1px solid var(--border-color); border-radius: 12px; padding: 1.25rem; transition: box-shadow 0.2s; }
    .report-card:hover { box-shadow: 0 2px 12px rgba(0,0,0,0.06); }
    .report-card-left { flex-shrink: 0; }
    .report-avatar { width: 40px; height: 40px; background: #fef2f2; border-radius: 10px; display: flex; align-items: center; justify-content: center; color: #dc2626; }
    .report-card-body { flex: 1; min-width: 0; }
    .report-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.5rem; }
    .doctor-name { font-weight: 600; font-size: 0.9375rem; color: var(--text-primary); }
    .status-badge { font-size: 0.6875rem; padding: 0.25rem 0.625rem; border-radius: 100px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.3px; }
    .status-open { background: #fff7ed; color: #c2410c; }
    .status-reviewed { background: #eff6ff; color: #1d4ed8; }
    .status-resolved { background: #f0fdf4; color: #15803d; }
    .report-desc { margin: 0 0 0.5rem; font-size: 0.875rem; color: var(--text-secondary); line-height: 1.5; }
    .report-date { font-size: 0.75rem; color: var(--text-muted); }
    
    .loading-state { text-align: center; padding: 3rem; }
    .spinner { width: 32px; height: 32px; border: 3px solid var(--border-color); border-top-color: #dc2626; border-radius: 50%; animation: spin 1s linear infinite; margin: 0 auto 0.75rem; }
    @keyframes spin { to { transform: rotate(360deg); } }
    .empty-state { text-align: center; padding: 3rem; color: var(--text-secondary); background: var(--bg-secondary); border-radius: 12px; border: 1px solid var(--border-color); }
    .empty-state svg { margin-bottom: 1rem; opacity: 0.5; }
    .empty-state h3 { margin: 0 0 0.5rem; color: var(--text-primary); }
    .empty-state p { margin: 0; }
  `]
})
export class PatientFraudReportsComponent implements OnInit {
  private apiService = inject(ApiService);
  private toastService = inject(ToastService);

  reports = signal<FraudReport[]>([]);
  doctors = signal<Doctor[]>([]);
  isLoading = signal(true);
  showForm = false;
  selectedDoctorId: number | null = null;
  description = '';
  searchQuery = signal('');

  filteredReports = computed(() => {
    const query = this.searchQuery().toLowerCase();
    if (!query) return this.reports();
    return this.reports().filter(r => r.doctor?.name?.toLowerCase().includes(query));
  });

  onSearch(event: Event): void {
    this.searchQuery.set((event.target as HTMLInputElement).value);
  }

  ngOnInit(): void {
    this.loadReports();
    this.apiService.getPatientDoctors().subscribe({ next: (d: any) => this.doctors.set(d) });
  }

  loadReports(): void {
    this.isLoading.set(true);
    this.apiService.getPatientFraudReports().subscribe({
      next: (data: any) => { this.reports.set(data); this.isLoading.set(false); },
      error: () => this.isLoading.set(false)
    });
  }

  submitReport(): void {
    if (!this.selectedDoctorId || !this.description.trim()) return;
    this.apiService.postFraudReport(this.selectedDoctorId, { reason: this.description } as any).subscribe({
      next: () => {
        this.toastService.success('Fraud report submitted');
        this.showForm = false;
        this.description = '';
        this.selectedDoctorId = null;
        this.loadReports();
      },
      error: (err: any) => this.toastService.error(err.error?.message || 'Failed to submit report')
    });
  }
}
