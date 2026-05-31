import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { ApiService, ToastService } from '../../../core/services';
import { Doctor, Slot, SlotType, SlotStatus } from '../../../core/models';

@Component({
  selector: 'app-book-appointment',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './book-appointment.component.html',
  styleUrls: ['./book-appointment.component.css']
})
export class BookAppointmentComponent implements OnInit {
  private apiService = inject(ApiService);
  private toastService = inject(ToastService);
  private router = inject(Router);

  isLoading = signal(false);
  doctors = signal<Doctor[]>([]);
  loadingDoctors = signal(true);
  searchQuery = signal('');
  selectedSlot = signal<Slot | null>(null);
  loadingSlots = signal(false);

  slotTypes: { value: SlotType; label: string; timeRange: string }[] = [
    { value: 'MORNING', label: 'Morning', timeRange: '9:00 AM - 11:00 AM' },
    { value: 'PRE_NOON', label: 'Pre-Noon', timeRange: '11:00 AM - 1:00 PM' },
    { value: 'AFTER_NOON', label: 'Afternoon', timeRange: '2:00 PM - 4:00 PM' },
    { value: 'EVENING', label: 'Evening', timeRange: '4:00 PM - 6:00 PM' },
    { value: 'NIGHT', label: 'Night', timeRange: '6:00 PM - 8:00 PM' }
  ];

  bookingData = {
    doctorId: null as number | null,
    date: '',
    slotType: '' as string,
    problem: ''
  };

  ngOnInit(): void {
    this.loadDoctors();
  }

  loadDoctors(): void {
    this.loadingDoctors.set(true);
    this.apiService.getPatientDoctors().subscribe({
      next: (doctors) => {
        this.doctors.set(doctors.filter(d => d.authStatus === 'APPROVED'));
        this.loadingDoctors.set(false);
      },
      error: () => {
        this.toastService.error('Failed to load doctors');
        this.loadingDoctors.set(false);
      }
    });
  }

  get filteredDoctors(): Doctor[] {
    const query = this.searchQuery().toLowerCase();
    if (!query) return this.doctors();
    return this.doctors().filter(d =>
      d.name.toLowerCase().includes(query) ||
      d.qualification.toLowerCase().includes(query)
    );
  }

  get minDate(): string {
    const today = new Date();
    return today.toISOString().split('T')[0];
  }

  get maxDate(): string {
    const maxDate = new Date();
    maxDate.setDate(maxDate.getDate() + 30);
    return maxDate.toISOString().split('T')[0];
  }

  selectDoctor(doctor: Doctor): void {
    this.bookingData.doctorId = doctor.id;
    this.bookingData.slotType = '';
    this.selectedSlot.set(null);
    if (this.bookingData.date) {
      this.fetchSlots();
    }
  }

  onDateChange(): void {
    this.bookingData.slotType = '';
    this.selectedSlot.set(null);
    if (this.bookingData.doctorId && this.bookingData.date) {
      this.fetchSlots();
    }
  }

  fetchSlots(): void {
    if (!this.bookingData.doctorId || !this.bookingData.date) return;
    this.loadingSlots.set(true);
    this.apiService.getDoctorSlots(this.bookingData.doctorId, this.bookingData.date).subscribe({
      next: (slot) => {
        this.selectedSlot.set(slot);
        this.loadingSlots.set(false);
      },
      error: () => {
        // No slots record means doctor hasn't provided slots yet - all available
        this.selectedSlot.set(null);
        this.loadingSlots.set(false);
      }
    });
  }

  getSlotStatus(slotType: SlotType): SlotStatus {
    const slot = this.selectedSlot();
    if (!slot) return 'AVAILABLE';
    switch (slotType) {
      case 'MORNING': return slot.morning || 'AVAILABLE';
      case 'PRE_NOON': return slot.preNoon || 'AVAILABLE';
      case 'AFTER_NOON': return slot.afterNoon || 'AVAILABLE';
      case 'EVENING': return slot.evening || 'AVAILABLE';
      case 'NIGHT': return slot.night || 'AVAILABLE';
      default: return 'AVAILABLE';
    }
  }

  isSlotBooked(slotType: SlotType): boolean {
    return this.getSlotStatus(slotType) === 'BOOKED';
  }

  selectSlot(slotType: SlotType): void {
    if (this.isSlotBooked(slotType)) return;
    this.bookingData.slotType = slotType;
  }

  onSubmit(): void {
    if (!this.bookingData.doctorId) {
      this.toastService.warning('Please select a doctor');
      return;
    }
    if (!this.bookingData.date) {
      this.toastService.warning('Please select a date');
      return;
    }
    if (!this.bookingData.slotType) {
      this.toastService.warning('Please select a time slot');
      return;
    }
    if (!this.bookingData.problem.trim()) {
      this.toastService.warning('Please enter reason for visit');
      return;
    }

    this.isLoading.set(true);

    this.apiService.bookAppointment(this.bookingData.doctorId, {
      appointmentDate: this.bookingData.date,
      slotType: this.bookingData.slotType as SlotType,
      problem: this.bookingData.problem
    }).subscribe({
      next: (appointment) => {
        this.isLoading.set(false);
        if (appointment.bookingStatus === 'WAITING_LIST') {
          this.toastService.warning('Slot was just booked. You have been added to the waiting list.');
        } else {
          this.toastService.success('Appointment booked successfully!');
        }
        this.router.navigate(['/patient/appointments']);
      },
      error: (err) => {
        this.isLoading.set(false);
        this.toastService.error(err.error?.message || 'Failed to book appointment');
      }
    });
  }
}
