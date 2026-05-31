import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../../core/services/api.service';
import { ToastService } from '../../../core/services/toast.service';
import { Doctor } from '../../../core/models/user.model';

@Component({
  selector: 'app-hospital-doctors',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './doctors.component.html',
  styleUrl: './doctors.component.css'
})
export class HospitalDoctorsComponent implements OnInit {
  private apiService = inject(ApiService);
  private toastService = inject(ToastService);

  doctors = signal<Doctor[]>([]);
  loading = signal(false);
  selectedStatus = signal<string>('ALL');
  selectedDoctor = signal<Doctor | null>(null);
  showModal = signal(false);
  rejectionReason = '';
  showReasonInput = false;
  pendingAction = '';
  searchQuery = signal('');

  statusOptions = ['ALL', 'APPROVED', 'REJECTED', 'SUSPENDED', 'FRAUD'];

  filteredDoctors = computed(() => {
    const status = this.selectedStatus();
    const query = this.searchQuery().toLowerCase().trim();
    let allDoctors = this.doctors();
    if (status === 'ALL') {
      allDoctors = allDoctors.filter(d => d.authStatus !== 'PENDING');
    } else {
      allDoctors = allDoctors.filter(d => d.authStatus === status);
    }
    if (query) {
      allDoctors = allDoctors.filter(d =>
        d.name.toLowerCase().includes(query) ||
        (d.qualification && d.qualification.toLowerCase().includes(query))
      );
    }
    return allDoctors;
  });

  onSearch(event: Event): void {
    this.searchQuery.set((event.target as HTMLInputElement).value);
  }

  ngOnInit(): void {
    this.loadDoctors();
  }

  loadDoctors(): void {
    this.loading.set(true);
    this.apiService.getHospitalDoctors().subscribe({
      next: (doctors: Doctor[]) => {
        this.doctors.set(doctors);
        this.loading.set(false);
      },
      error: (err: Error) => {
        this.toastService.error('Failed to load doctors');
        this.loading.set(false);
        console.error(err);
      }
    });
  }

  filterByStatus(status: string): void {
    this.selectedStatus.set(status);
  }

  viewDetails(doctor: Doctor): void {
    this.selectedDoctor.set(doctor);
    this.showModal.set(true);
    this.rejectionReason = '';
  }

  closeModal(): void {
    this.showModal.set(false);
    this.selectedDoctor.set(null);
    this.rejectionReason = '';
    this.showReasonInput = false;
    this.pendingAction = '';
  }

  requestReason(action: string): void {
    this.pendingAction = action;
    this.showReasonInput = true;
  }

  confirmAction(doctor: Doctor): void {
    if (!this.rejectionReason.trim()) {
      this.toastService.warning('Please provide a reason');
      return;
    }
    switch (this.pendingAction) {
      case 'reject': this.rejectDoctor(doctor); break;
      case 'suspend': this.suspendDoctor(doctor); break;
      case 'fraud': this.markDoctorFraud(doctor); break;
    }
  }

  approveDoctor(doctor: Doctor): void {
    if (!doctor.id) return;
    
    this.apiService.approveDoctor(doctor.id).subscribe({
      next: () => {
        this.toastService.success(`Dr. ${doctor.name} has been approved`);
        this.loadDoctors();
        this.closeModal();
      },
      error: (err: Error) => {
        this.toastService.error('Failed to approve doctor');
        console.error(err);
      }
    });
  }

  rejectDoctor(doctor: Doctor): void {
    if (!doctor.id) return;
    
    this.apiService.rejectDoctor(doctor.id, { rejectionReason: this.rejectionReason }).subscribe({
      next: () => {
        this.toastService.success(`Dr. ${doctor.name} has been rejected`);
        this.loadDoctors();
        this.closeModal();
      },
      error: (err: Error) => {
        this.toastService.error('Failed to reject doctor');
        console.error(err);
      }
    });
  }

  suspendDoctor(doctor: Doctor): void {
    if (!doctor.id) return;
    
    this.apiService.suspendDoctor(doctor.id, { rejectionReason: this.rejectionReason }).subscribe({
      next: () => {
        this.toastService.success(`Dr. ${doctor.name} has been suspended`);
        this.loadDoctors();
        this.closeModal();
      },
      error: (err: Error) => {
        this.toastService.error('Failed to suspend doctor');
        console.error(err);
      }
    });
  }

  markDoctorFraud(doctor: Doctor): void {
    if (!doctor.id) return;
    
    this.apiService.markDoctorFraud(doctor.id, { rejectionReason: this.rejectionReason }).subscribe({
      next: () => {
        this.toastService.success(`Dr. ${doctor.name} has been flagged as fraud`);
        this.loadDoctors();
        this.closeModal();
      },
      error: (err: Error) => {
        this.toastService.error('Failed to flag doctor');
        console.error(err);
      }
    });
  }

  getStatusClass(status: string): string {
    switch (status) {
      case 'APPROVED': return 'status-approved';
      case 'PENDING': return 'status-pending';
      case 'REJECTED': return 'status-rejected';
      case 'SUSPENDED': return 'status-suspended';
      case 'FRAUD': return 'status-fraud';
      default: return '';
    }
  }
}
