import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService, ToastService } from '../../../core/services';
import { Patient } from '../../../core/models';

@Component({
  selector: 'app-admin-patients',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './patients.component.html',
  styleUrls: ['./patients.component.css']
})
export class AdminPatientsComponent implements OnInit {
  private apiService = inject(ApiService);
  private toastService = inject(ToastService);

  patients = signal<Patient[]>([]);
  isLoading = signal(true);
  selectedPatient = signal<Patient | null>(null);
  searchQuery = signal('');

  filteredPatients = computed(() => {
    const query = this.searchQuery().toLowerCase();
    if (!query) return this.patients();
    return this.patients().filter(p => p.name?.toLowerCase().includes(query) || p.gender?.toLowerCase().includes(query));
  });

  onSearch(event: Event): void {
    this.searchQuery.set((event.target as HTMLInputElement).value);
  }

  ngOnInit(): void {
    this.loadPatients();
  }

  loadPatients(): void {
    this.isLoading.set(true);
    this.apiService.getAllPatients().subscribe({
      next: (data) => {
        this.patients.set(data);
        this.isLoading.set(false);
      },
      error: () => {
        this.isLoading.set(false);
      }
    });
  }

  viewPatient(patient: Patient): void {
    this.selectedPatient.set(patient);
  }

  closeModal(): void {
    this.selectedPatient.set(null);
  }

  formatDate(dateStr: string | undefined): string {
    if (!dateStr) return 'N/A';
    return new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }
}
