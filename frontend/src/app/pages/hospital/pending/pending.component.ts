import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../../core/services/api.service';
import { ToastService } from '../../../core/services/toast.service';
import { Doctor } from '../../../core/models/user.model';

@Component({
  selector: 'app-pending-approvals',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './pending.component.html',
  styleUrl: './pending.component.css'
})
export class PendingApprovalsComponent implements OnInit {
  private apiService = inject(ApiService);
  private toastService = inject(ToastService);

  pendingDoctors = signal<Doctor[]>([]);
  loading = signal(false);
  rejectingDoctorId: number | null = null;
  rejectionReason = '';
  searchQuery = signal('');

  get filteredPendingDoctors(): Doctor[] {
    const query = this.searchQuery().toLowerCase().trim();
    if (!query) return this.pendingDoctors();
    return this.pendingDoctors().filter(d =>
      d.name.toLowerCase().includes(query) ||
      (d.qualification && d.qualification.toLowerCase().includes(query))
    );
  }

  onSearch(event: Event): void {
    this.searchQuery.set((event.target as HTMLInputElement).value);
  }

  ngOnInit(): void {
    this.loadPendingDoctors();
  }

  loadPendingDoctors(): void {
    this.loading.set(true);
    this.apiService.getHospitalDoctorsByStatus('PENDING').subscribe({
      next: (doctors: Doctor[]) => {
        this.pendingDoctors.set(doctors);
        this.loading.set(false);
      },
      error: (err: Error) => {
        this.toastService.error('Failed to load pending approvals');
        this.loading.set(false);
        console.error(err);
      }
    });
  }

  approveDoctor(doctor: Doctor): void {
    if (!doctor.id) return;
    
    this.apiService.approveDoctor(doctor.id).subscribe({
      next: () => {
        this.toastService.success(`Dr. ${doctor.name} has been approved`);
        this.loadPendingDoctors();
      },
      error: (err: Error) => {
        this.toastService.error('Failed to approve doctor');
        console.error(err);
      }
    });
  }

  startReject(doctor: Doctor): void {
    this.rejectingDoctorId = doctor.id;
    this.rejectionReason = '';
  }

  cancelReject(): void {
    this.rejectingDoctorId = null;
    this.rejectionReason = '';
  }

  confirmReject(doctor: Doctor): void {
    if (!doctor.id) return;
    if (!this.rejectionReason.trim()) {
      this.toastService.warning('Please provide a rejection reason');
      return;
    }
    
    this.apiService.rejectDoctor(doctor.id, { rejectionReason: this.rejectionReason }).subscribe({
      next: () => {
        this.toastService.success(`Dr. ${doctor.name} has been rejected`);
        this.rejectingDoctorId = null;
        this.rejectionReason = '';
        this.loadPendingDoctors();
      },
      error: (err: Error) => {
        this.toastService.error('Failed to reject doctor');
        console.error(err);
      }
    });
  }
}
