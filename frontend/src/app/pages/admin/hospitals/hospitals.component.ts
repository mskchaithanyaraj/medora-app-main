import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../../core/services/api.service';
import { ToastService } from '../../../core/services/toast.service';
import { Hospital } from '../../../core/models/user.model';

@Component({
  selector: 'app-admin-hospitals',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './hospitals.component.html',
  styleUrl: './hospitals.component.css'
})
export class AdminHospitalsComponent implements OnInit {
  private apiService = inject(ApiService);
  private toastService = inject(ToastService);

  hospitals = signal<Hospital[]>([]);
  loading = signal(false);
  selectedStatus = signal<string>('ALL');
  selectedHospital = signal<Hospital | null>(null);
  showModal = signal(false);
  rejectionReason = '';
  showReasonInput = false;
  pendingAction = '';
  searchQuery = signal('');

  statusOptions = ['ALL', 'APPROVED', 'REJECTED', 'SUSPENDED', 'FRAUD'];

  filteredHospitals = computed(() => {
    const status = this.selectedStatus();
    const query = this.searchQuery().toLowerCase();
    let result = this.hospitals();
    if (status === 'ALL') {
      result = result.filter(h => h.authStatus !== 'PENDING');
    } else {
      result = result.filter(h => h.authStatus === status);
    }
    if (query) {
      result = result.filter(h => h.name.toLowerCase().includes(query));
    }
    return result;
  });

  onSearch(event: Event): void {
    this.searchQuery.set((event.target as HTMLInputElement).value);
  }

  ngOnInit(): void {
    this.loadHospitals();
  }

  loadHospitals(): void {
    this.loading.set(true);
    this.apiService.getAllHospitals().subscribe({
      next: (hospitals: Hospital[]) => {
        this.hospitals.set(hospitals);
        this.loading.set(false);
      },
      error: (err: Error) => {
        this.toastService.error('Failed to load hospitals');
        this.loading.set(false);
        console.error(err);
      }
    });
  }

  filterByStatus(status: string): void {
    this.selectedStatus.set(status);
  }

  viewDetails(hospital: Hospital): void {
    this.selectedHospital.set(hospital);
    this.showModal.set(true);
  }

  closeModal(): void {
    this.showModal.set(false);
    this.selectedHospital.set(null);
    this.rejectionReason = '';
    this.showReasonInput = false;
    this.pendingAction = '';
  }

  requestReason(action: string): void {
    this.pendingAction = action;
    this.showReasonInput = true;
  }

  confirmAction(hospital: Hospital): void {
    if (!this.rejectionReason.trim()) {
      this.toastService.warning('Please provide a reason');
      return;
    }
    switch (this.pendingAction) {
      case 'reject': this.rejectHospital(hospital); break;
      case 'suspend': this.suspendHospital(hospital); break;
      case 'fraud': this.flagAsFraud(hospital); break;
    }
  }

  approveHospital(hospital: Hospital): void {
    if (!hospital.id) return;
    
    this.apiService.approveHospital(hospital.id).subscribe({
      next: () => {
        this.toastService.success(`${hospital.name} has been approved`);
        this.loadHospitals();
        this.closeModal();
      },
      error: (err: Error) => {
        this.toastService.error('Failed to approve hospital');
        console.error(err);
      }
    });
  }

  rejectHospital(hospital: Hospital): void {
    if (!hospital.id) return;
    
    this.apiService.rejectHospital(hospital.id, { rejectionReason: this.rejectionReason }).subscribe({
      next: () => {
        this.toastService.success(`${hospital.name} has been rejected`);
        this.loadHospitals();
        this.closeModal();
      },
      error: (err: Error) => {
        this.toastService.error('Failed to reject hospital');
        console.error(err);
      }
    });
  }

  suspendHospital(hospital: Hospital): void {
    if (!hospital.id) return;
    
    this.apiService.suspendHospital(hospital.id, { rejectionReason: this.rejectionReason }).subscribe({
      next: () => {
        this.toastService.success(`${hospital.name} has been suspended`);
        this.loadHospitals();
        this.closeModal();
      },
      error: (err: Error) => {
        this.toastService.error('Failed to suspend hospital');
        console.error(err);
      }
    });
  }

  flagAsFraud(hospital: Hospital): void {
    if (!hospital.id) return;
    
    this.apiService.flagHospitalAsFraud(hospital.id, { rejectionReason: this.rejectionReason }).subscribe({
      next: () => {
        this.toastService.success(`${hospital.name} has been flagged as fraud`);
        this.loadHospitals();
        this.closeModal();
      },
      error: (err: Error) => {
        this.toastService.error('Failed to flag hospital');
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
