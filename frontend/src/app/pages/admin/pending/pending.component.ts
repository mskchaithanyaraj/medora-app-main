import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../../core/services/api.service';
import { ToastService } from '../../../core/services/toast.service';
import { Hospital } from '../../../core/models/user.model';

@Component({
  selector: 'app-admin-pending',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './pending.component.html',
  styleUrl: './pending.component.css'
})
export class AdminPendingComponent implements OnInit {
  private apiService = inject(ApiService);
  private toastService = inject(ToastService);

  pendingHospitals = signal<Hospital[]>([]);
  loading = signal(false);
  rejectingHospitalId: number | null = null;
  rejectionReason = '';
  searchQuery = signal('');

  filteredPendingHospitals = computed(() => {
    const query = this.searchQuery().toLowerCase();
    if (!query) return this.pendingHospitals();
    return this.pendingHospitals().filter(h => h.name.toLowerCase().includes(query));
  });

  onSearch(event: Event): void {
    this.searchQuery.set((event.target as HTMLInputElement).value);
  }

  ngOnInit(): void {
    this.loadPendingHospitals();
  }

  loadPendingHospitals(): void {
    this.loading.set(true);
    this.apiService.getAllHospitals().subscribe({
      next: (hospitals: Hospital[]) => {
        const pending = hospitals.filter(h => h.authStatus === 'PENDING');
        this.pendingHospitals.set(pending);
        this.loading.set(false);
      },
      error: (err: Error) => {
        this.toastService.error('Failed to load pending hospitals');
        this.loading.set(false);
        console.error(err);
      }
    });
  }

  approveHospital(hospital: Hospital): void {
    if (!hospital.id) return;
    
    this.apiService.approveHospital(hospital.id).subscribe({
      next: () => {
        this.toastService.success(`${hospital.name} has been approved`);
        this.loadPendingHospitals();
      },
      error: (err: Error) => {
        this.toastService.error('Failed to approve hospital');
        console.error(err);
      }
    });
  }

  startReject(hospital: Hospital): void {
    this.rejectingHospitalId = hospital.id;
    this.rejectionReason = '';
  }

  cancelReject(): void {
    this.rejectingHospitalId = null;
    this.rejectionReason = '';
  }

  confirmReject(hospital: Hospital): void {
    if (!hospital.id) return;
    if (!this.rejectionReason.trim()) {
      this.toastService.warning('Please provide a rejection reason');
      return;
    }
    
    this.apiService.rejectHospital(hospital.id, { rejectionReason: this.rejectionReason }).subscribe({
      next: () => {
        this.toastService.success(`${hospital.name} has been rejected`);
        this.rejectingHospitalId = null;
        this.rejectionReason = '';
        this.loadPendingHospitals();
      },
      error: (err: Error) => {
        this.toastService.error('Failed to reject hospital');
        console.error(err);
      }
    });
  }
}
