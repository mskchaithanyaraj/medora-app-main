import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService, ToastService } from '../../../core/services';
import { Prescription } from '../../../core/models';

@Component({
  selector: 'app-patient-history',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './patient-history.component.html',
  styleUrls: ['./patient-history.component.css']
})
export class PatientHistoryComponent {
  private apiService = inject(ApiService);
  private toastService = inject(ToastService);

  searchPatientId = '';
  prescriptions = signal<Prescription[]>([]);
  isLoading = signal(false);
  hasSearched = signal(false);

  searchPatientHistory(): void {
    if (!this.searchPatientId.trim()) {
      this.toastService.warning('Please enter a patient ID');
      return;
    }

    const patientId = parseInt(this.searchPatientId);
    if (isNaN(patientId)) {
      this.toastService.warning('Please enter a valid patient ID');
      return;
    }

    this.isLoading.set(true);
    this.hasSearched.set(true);

    this.apiService.getPatientPrescriptionsByDoctor(patientId).subscribe({
      next: (data) => {
        this.prescriptions.set(data);
        this.isLoading.set(false);
        if (data.length === 0) {
          this.toastService.info('No prescriptions found for this patient');
        }
      },
      error: () => {
        this.isLoading.set(false);
        this.prescriptions.set([]);
      }
    });
  }

  formatDate(dateStr: string): string {
    return new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }
}
