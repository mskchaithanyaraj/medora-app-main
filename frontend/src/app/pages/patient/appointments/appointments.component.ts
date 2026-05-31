import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ApiService, ToastService } from '../../../core/services';
import { Appointment, BookingStatus, Prescription } from '../../../core/models';

@Component({
  selector: 'app-patient-appointments',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './appointments.component.html',
  styleUrls: ['./appointments.component.css']
})
export class PatientAppointmentsComponent implements OnInit {
  private apiService = inject(ApiService);
  private toastService = inject(ToastService);

  appointments = signal<Appointment[]>([]);
  isLoading = signal(true);
  selectedFilter = signal<BookingStatus | 'ALL'>('ALL');
  prescriptionMap = new Map<number, number>();
  searchQuery = signal('');

  filters: { value: BookingStatus | 'ALL'; label: string }[] = [
    { value: 'ALL', label: 'All' },
    { value: 'BOOKED', label: 'Booked' },
    { value: 'WAITING_LIST', label: 'Waiting List' },
    { value: 'COMPLETED', label: 'Completed' },
    { value: 'CANCELLED', label: 'Cancelled' }
  ];

  ngOnInit(): void {
    this.loadAppointments();
  }

  loadAppointments(): void {
    this.isLoading.set(true);
    this.apiService.getPatientAppointments().subscribe({
      next: (data) => {
        this.appointments.set(data);
        this.loadPrescriptions();
      },
      error: () => {
        this.isLoading.set(false);
      }
    });
  }

  private loadPrescriptions(): void {
    this.apiService.getPatientPrescriptions().subscribe({
      next: (prescriptions) => {
        prescriptions.forEach(p => {
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

  get filteredAppointments(): Appointment[] {
    const filter = this.selectedFilter();
    const query = this.searchQuery().toLowerCase();
    let result = this.appointments();
    if (filter !== 'ALL') {
      result = result.filter(a => a.bookingStatus === filter);
    }
    if (query) {
      result = result.filter(a =>
        a.doctor?.name?.toLowerCase().includes(query) ||
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

  cancelAppointment(appointment: Appointment): void {
    if (appointment.bookingStatus !== 'BOOKED') {
      this.toastService.warning('Only booked appointments can be cancelled');
      return;
    }

    if (confirm('Are you sure you want to cancel this appointment?')) {
      this.apiService.cancelAppointment(appointment.id).subscribe({
        next: (updated) => {
          this.appointments.update(list => 
            list.map(a => a.id === updated.id ? updated : a)
          );
          this.toastService.success('Appointment cancelled successfully');
        },
        error: (err) => {
          this.toastService.error(err.error?.message || 'Failed to cancel appointment');
        }
      });
    }
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
