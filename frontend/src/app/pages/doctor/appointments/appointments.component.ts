import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { forkJoin } from 'rxjs';
import { Appointment, BookingStatus, Prescription } from '../../../core/models';
import { ApiService, ToastService } from '../../../core/services';

@Component({
  selector: 'app-doctor-appointments',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './appointments.component.html',
  styleUrls: ['./appointments.component.css']
})
export class DoctorAppointmentsComponent implements OnInit {
  private apiService = inject(ApiService);
  private toastService = inject(ToastService);

  appointments = signal<Appointment[]>([]);
  isLoading = signal(true);
  selectedFilter = signal<BookingStatus | 'ALL'>('ALL');
  // Map of appointmentId -> true (has prescription)
  prescriptionMap = new Map<number, number>();
  searchQuery = signal('');

  filters: { value: BookingStatus | 'ALL'; label: string }[] = [
    { value: 'ALL', label: 'All' },
    { value: 'BOOKED', label: 'Booked' },
    { value: 'COMPLETED', label: 'Completed' },
    { value: 'CANCELLED', label: 'Cancelled' }
  ];

  ngOnInit(): void {
    this.loadAppointments();
  }

  loadAppointments(): void {
    this.isLoading.set(true);
    this.apiService.getDoctorAppointments().subscribe({
      next: (data) => {
        this.appointments.set(data);
        this.loadPrescriptionMap(data);
      },
      error: () => {
        this.toastService.error('Failed to load appointments');
        this.isLoading.set(false);
      }
    });
  }

  private loadPrescriptionMap(appointments: Appointment[]): void {
    const uniquePatientIds = [...new Set(appointments.map(a => a.patient.id))];
    if (uniquePatientIds.length === 0) {
      this.isLoading.set(false);
      return;
    }
    const requests = uniquePatientIds.map(id => this.apiService.getPatientPrescriptionsByDoctor(id));
    forkJoin(requests).subscribe({
      next: (results) => {
        results.flat().forEach(p => {
          this.prescriptionMap.set(p.appointment.id, p.id);
        });
        this.isLoading.set(false);
      },
      error: () => {
        this.isLoading.set(false);
      }
    });
  }

  hasPrescription(appointmentId: number): boolean {
    return this.prescriptionMap.has(appointmentId);
  }

  getPrescriptionPatientId(appointment: Appointment): number {
    return appointment.patient.id;
  }

  get filteredAppointments(): Appointment[] {
    const filter = this.selectedFilter();
    const query = this.searchQuery().toLowerCase();
    let result = this.appointments();
    if (filter !== 'ALL') {
      result = result.filter(a => a.bookingStatus === filter);
    }
    if (query) {
      result = result.filter(a =>
        a.patient?.name?.toLowerCase().includes(query) ||
        a.appointmentDate?.toLowerCase().includes(query)
      );
    }
    return result;
  }

  onSearch(event: Event): void {
    this.searchQuery.set((event.target as HTMLInputElement).value);
  }

  setFilter(filter: BookingStatus | 'ALL'): void {
    this.selectedFilter.set(filter);
  }

  getStatusClass(status: BookingStatus): string {
    switch (status) {
      case 'BOOKED': return 'badge-info';
      case 'WAITING_LIST': return 'badge-warning';
      case 'COMPLETED': return 'badge-success';
      case 'CANCELLED': return 'badge-error';
      default: return 'badge-primary';
    }
  }

  formatDate(dateStr: string): string {
    return new Date(dateStr).toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }

  getSlotLabel(slotType: string): string {
    switch (slotType) {
      case 'MORNING': return 'Morning (9-11 AM)';
      case 'PRE_NOON': return 'Pre-Noon (11 AM-1 PM)';
      case 'AFTER_NOON': return 'Afternoon (2-4 PM)';
      case 'EVENING': return 'Evening (4-6 PM)';
      case 'NIGHT': return 'Night (6-8 PM)';
      default: return slotType;
    }
  }
}
