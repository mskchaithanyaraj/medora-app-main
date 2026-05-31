import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, ActivatedRoute } from '@angular/router';
import { ApiService, ToastService } from '../../../core/services';
import { Prescription, PrescriptionRequest } from '../../../core/models';

@Component({
  selector: 'app-doctor-prescriptions',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './prescriptions.component.html',
  styleUrls: ['./prescriptions.component.css']
})
export class DoctorPrescriptionsComponent implements OnInit {
  private apiService = inject(ApiService);
  private toastService = inject(ToastService);
  private route = inject(ActivatedRoute);

  prescriptions = signal<Prescription[]>([]);
  patients = signal<{ id: number; name: string }[]>([]);
  isLoading = signal(false);
  selectedPrescription = signal<Prescription | null>(null);
  selectedPatientId = signal<number | null>(null);
  selectedPatientName = signal<string>('');
  patientSearchQuery = signal('');
  prescriptionSearchQuery = signal('');

  filteredPatients = computed(() => {
    const query = this.patientSearchQuery().toLowerCase();
    if (!query) return this.patients();
    return this.patients().filter(p => p.name.toLowerCase().includes(query));
  });

  filteredPrescriptions = computed(() => {
    const query = this.prescriptionSearchQuery().toLowerCase();
    if (!query) return this.prescriptions();
    return this.prescriptions().filter(p => p.diagnosis?.toLowerCase().includes(query));
  });

  onPatientSearch(event: Event): void {
    this.patientSearchQuery.set((event.target as HTMLInputElement).value);
  }

  onPrescriptionSearch(event: Event): void {
    this.prescriptionSearchQuery.set((event.target as HTMLInputElement).value);
  }

  // Edit state
  isEditing = signal(false);
  editDiagnosis = '';
  editMedicine = '';
  currentDoctorId = signal<number | null>(null);

  ngOnInit(): void {
    this.apiService.getDoctorProfile().subscribe({
      next: (doc) => this.currentDoctorId.set(doc.id)
    });
    this.route.queryParams.subscribe(params => {
      if (params['patientId']) {
        const patientId = +params['patientId'];
        const prescriptionId = params['prescriptionId'] ? +params['prescriptionId'] : null;
        this.loadPrescriptionsForPatient(patientId, prescriptionId);
      } else {
        this.loadPatientsFromAppointments();
      }
    });
  }

  loadPatientsFromAppointments(): void {
    this.isLoading.set(true);
    this.apiService.getDoctorAppointments().subscribe({
      next: (appointments) => {
        const uniquePatients = new Map<number, string>();
        appointments.forEach(a => {
          if (!uniquePatients.has(a.patient.id)) {
            uniquePatients.set(a.patient.id, a.patient.name);
          }
        });
        this.patients.set(Array.from(uniquePatients, ([id, name]) => ({ id, name })));
        this.isLoading.set(false);
      },
      error: () => {
        this.toastService.error('Failed to load patients');
        this.isLoading.set(false);
      }
    });
  }

  loadPrescriptionsForPatient(patientId: number, prescriptionId?: number | null): void {
    this.isLoading.set(true);
    this.selectedPatientId.set(patientId);
    this.apiService.getPatientPrescriptionsByDoctor(patientId).subscribe({
      next: (data) => {
        this.prescriptions.set(data);
        if (data.length > 0) {
          this.selectedPatientName.set(data[0].appointment.patient.name);
        }
        if (prescriptionId) {
          const target = data.find(p => p.id === prescriptionId);
          if (target) this.selectedPrescription.set(target);
        }
        this.isLoading.set(false);
      },
      error: () => {
        this.toastService.error('Failed to load prescriptions');
        this.isLoading.set(false);
      }
    });
  }

  selectPatient(patient: { id: number; name: string }): void {
    this.selectedPatientName.set(patient.name);
    this.loadPrescriptionsForPatient(patient.id);
  }

  backToPatients(): void {
    this.selectedPatientId.set(null);
    this.prescriptions.set([]);
    this.selectedPatientName.set('');
    this.loadPatientsFromAppointments();
  }

  viewPrescription(prescription: Prescription): void {
    this.selectedPrescription.set(prescription);
    this.isEditing.set(false);
  }

  closePrescriptionModal(): void {
    this.selectedPrescription.set(null);
    this.isEditing.set(false);
  }

  startEditing(): void {
    const p = this.selectedPrescription();
    if (p && this.canEdit(p)) {
      this.editDiagnosis = p.diagnosis;
      this.editMedicine = p.medicine;
      this.isEditing.set(true);
    }
  }

  canEdit(prescription: Prescription): boolean {
    return prescription.appointment.doctor.id === this.currentDoctorId();
  }

  cancelEditing(): void {
    this.isEditing.set(false);
  }

  saveEdit(): void {
    const p = this.selectedPrescription();
    if (!p) return;

    const data: PrescriptionRequest = {
      diagnosis: this.editDiagnosis,
      medicine: this.editMedicine
    };

    this.apiService.updatePrescription(p.id, data).subscribe({
      next: (updated) => {
        this.toastService.success('Prescription updated successfully');
        const list = this.prescriptions().map(pr => pr.id === updated.id ? updated : pr);
        this.prescriptions.set(list);
        this.selectedPrescription.set(updated);
        this.isEditing.set(false);
      },
      error: () => {
        this.toastService.error('Failed to update prescription');
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
