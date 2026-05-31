import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute, RouterModule } from '@angular/router';
import { ApiService, ToastService } from '../../../core/services';

@Component({
  selector: 'app-create-prescription',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './create-prescription.component.html',
  styleUrls: ['./create-prescription.component.css']
})
export class CreatePrescriptionComponent {
  private apiService = inject(ApiService);
  private toastService = inject(ToastService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  appointmentId = signal<number | null>(null);
  isLoading = signal(false);

  // Mock appointment data
  appointment = signal({
    id: 3,
    patientName: 'Mike Johnson',
    date: '2026-05-21',
    reason: 'Fever and headache'
  });

  prescriptionData = {
    diagnosis: '',
    medicine: ''
  };

  constructor() {
    const id = this.route.snapshot.paramMap.get('appointmentId');
    if (id) {
      this.appointmentId.set(parseInt(id));
    }
  }

  onSubmit(): void {
    if (!this.prescriptionData.diagnosis.trim()) {
      this.toastService.warning('Please enter a diagnosis');
      return;
    }
    if (!this.prescriptionData.medicine.trim()) {
      this.toastService.warning('Please enter prescribed medicines');
      return;
    }

    const appointmentId = this.appointmentId();
    if (!appointmentId) {
      this.toastService.error('Invalid appointment');
      return;
    }

    this.isLoading.set(true);

    this.apiService.createPrescription(appointmentId, {
      diagnosis: this.prescriptionData.diagnosis,
      medicine: this.prescriptionData.medicine
    }).subscribe({
      next: () => {
        this.isLoading.set(false);
        this.toastService.success('Prescription created successfully!');
        this.router.navigate(['/doctor/prescriptions']);
      },
      error: () => {
        this.isLoading.set(false);
      }
    });
  }

  formatDate(dateStr: string): string {
    return new Date(dateStr).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }
}
