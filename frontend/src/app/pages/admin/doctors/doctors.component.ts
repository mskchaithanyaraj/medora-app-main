import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../../core/services/api.service';
import { ToastService } from '../../../core/services/toast.service';
import { Doctor } from '../../../core/models/user.model';

@Component({
  selector: 'app-admin-doctors',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './doctors.component.html',
  styleUrl: './doctors.component.css'
})
export class AdminDoctorsComponent implements OnInit {
  private apiService = inject(ApiService);
  private toastService = inject(ToastService);

  doctors = signal<Doctor[]>([]);
  loading = signal(false);
  selectedDoctor = signal<Doctor | null>(null);
  showModal = signal(false);
  selectedStatus = signal('ALL');
  searchQuery = signal('');
  statusOptions = ['ALL', 'PENDING', 'APPROVED', 'SUSPENDED', 'REJECTED', 'FRAUD'];

  filteredDoctors = computed(() => {
    const status = this.selectedStatus();
    const query = this.searchQuery().toLowerCase();
    let result = this.doctors();
    if (status !== 'ALL') {
      result = result.filter(d => d.authStatus === status);
    }
    if (query) {
      result = result.filter(d => d.name.toLowerCase().includes(query) || d.qualification?.toLowerCase().includes(query) || d.hospital?.name?.toLowerCase().includes(query));
    }
    return result;
  });

  onSearch(event: Event): void {
    this.searchQuery.set((event.target as HTMLInputElement).value);
  }

  filterByStatus(status: string): void {
    this.selectedStatus.set(status);
  }

  ngOnInit(): void {
    this.loadDoctors();
  }

  loadDoctors(): void {
    this.loading.set(true);
    this.apiService.getAllDoctors().subscribe({
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

  viewDetails(doctor: Doctor): void {
    this.selectedDoctor.set(doctor);
    this.showModal.set(true);
  }

  closeModal(): void {
    this.showModal.set(false);
    this.selectedDoctor.set(null);
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
