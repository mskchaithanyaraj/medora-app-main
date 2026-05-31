import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { ApiService } from '../../../core/services';
import { Prescription } from '../../../core/models';

@Component({
  selector: 'app-patient-prescriptions',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './prescriptions.component.html',
  styleUrls: ['./prescriptions.component.css']
})
export class PatientPrescriptionsComponent implements OnInit {
  private apiService = inject(ApiService);
  private route = inject(ActivatedRoute);

  prescriptions = signal<Prescription[]>([]);
  isLoading = signal(true);
  selectedPrescription = signal<Prescription | null>(null);
  searchQuery = signal('');

  filteredPrescriptions = computed(() => {
    const query = this.searchQuery().toLowerCase();
    if (!query) return this.prescriptions();
    return this.prescriptions().filter(p =>
      p.appointment?.doctor?.name?.toLowerCase().includes(query) ||
      p.diagnosis?.toLowerCase().includes(query)
    );
  });

  onSearch(event: Event): void {
    this.searchQuery.set((event.target as HTMLInputElement).value);
  }

  ngOnInit(): void {
    this.loadPrescriptions();
  }

  loadPrescriptions(): void {
    this.isLoading.set(true);
    this.apiService.getPatientPrescriptions().subscribe({
      next: (data) => {
        this.prescriptions.set(data);
        this.isLoading.set(false);
        const pid = this.route.snapshot.queryParams['prescriptionId'];
        if (pid) {
          const target = data.find(p => p.id === +pid);
          if (target) this.selectedPrescription.set(target);
        }
      },
      error: () => {
        this.isLoading.set(false);
      }
    });
  }

  viewPrescription(prescription: Prescription): void {
    this.selectedPrescription.set(prescription);
  }

  closePrescriptionModal(): void {
    this.selectedPrescription.set(null);
  }

  formatDate(dateStr: string): string {
    return new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  downloadPrescriptionPdf(): void {
    const p = this.selectedPrescription();
    if (!p) return;

    const content = `
      <html>
      <head>
        <title>Prescription - Dr. ${p.appointment.doctor.name}</title>
        <style>
          body { font-family: 'Segoe UI', Arial, sans-serif; padding: 40px; color: #1a1a1a; }
          .header { text-align: center; border-bottom: 2px solid #6366f1; padding-bottom: 20px; margin-bottom: 30px; }
          .header h1 { color: #6366f1; margin: 0 0 5px; font-size: 24px; }
          .header p { margin: 0; color: #666; font-size: 14px; }
          .meta { display: flex; justify-content: space-between; margin-bottom: 30px; padding: 15px; background: #f8f9fa; border-radius: 8px; }
          .meta-item { text-align: center; }
          .meta-label { display: block; font-size: 12px; color: #666; text-transform: uppercase; letter-spacing: 0.5px; }
          .meta-value { display: block; font-size: 16px; font-weight: 600; margin-top: 4px; }
          .section { margin-bottom: 25px; }
          .section h3 { font-size: 14px; color: #6366f1; text-transform: uppercase; letter-spacing: 0.5px; margin: 0 0 10px; border-bottom: 1px solid #e5e7eb; padding-bottom: 8px; }
          .section p { margin: 0; font-size: 15px; line-height: 1.6; white-space: pre-wrap; }
          .footer { margin-top: 40px; padding-top: 20px; border-top: 1px solid #e5e7eb; text-align: center; font-size: 12px; color: #999; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>Medora Healthcare</h1>
          <p>Medical Prescription</p>
        </div>
        <div class="meta">
          <div class="meta-item"><span class="meta-label">Doctor</span><span class="meta-value">Dr. ${p.appointment.doctor.name}</span></div>
          <div class="meta-item"><span class="meta-label">Patient</span><span class="meta-value">${p.appointment.patient.name}</span></div>
          <div class="meta-item"><span class="meta-label">Date</span><span class="meta-value">${this.formatDate(p.appointment.appointmentDate)}</span></div>
        </div>
        <div class="section"><h3>Diagnosis</h3><p>${p.diagnosis}</p></div>
        <div class="section"><h3>Prescribed Medicine</h3><p>${p.medicine}</p></div>
        <div class="footer">Generated from Medora Healthcare Platform</div>
      </body>
      </html>
    `;

    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(content);
      printWindow.document.close();
      setTimeout(() => {
        printWindow.print();
      }, 300);
    }
  }
}
