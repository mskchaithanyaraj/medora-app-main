import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService, ToastService } from '../../../core/services';
import { Patient } from '../../../core/models';

@Component({
  selector: 'app-patient-profile',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class PatientProfileComponent implements OnInit {
  private apiService = inject(ApiService);
  private toastService = inject(ToastService);

  profile = signal<Patient | null>(null);
  isLoading = signal(true);
  isEditing = signal(false);
  isSaving = signal(false);
  showPasswordForm = signal(false);

  editData = { name: '', age: 0, gender: '', phone: '', location: '' };
  passwordData = { oldPassword: '', newPassword: '', confirmPassword: '' };

  ngOnInit(): void {
    this.loadProfile();
  }

  loadProfile(): void {
    this.isLoading.set(true);
    this.apiService.getPatientProfile().subscribe({
      next: (data) => {
        this.profile.set(data);
        this.isLoading.set(false);
      },
      error: () => {
        this.isLoading.set(false);
      }
    });
  }

  startEditing(): void {
    const p = this.profile();
    if (p) {
      this.editData = { name: p.name, age: p.age, gender: p.gender, phone: p.phone || '', location: p.location || '' };
    }
    this.isEditing.set(true);
  }

  cancelEditing(): void {
    this.isEditing.set(false);
  }

  saveProfile(): void {
    this.isSaving.set(true);
    this.apiService.updatePatientProfile({
      id: this.profile()?.id,
      name: this.editData.name,
      age: this.editData.age,
      gender: this.editData.gender,
      phone: this.editData.phone,
      location: this.editData.location
    }).subscribe({
      next: (updated) => {
        this.profile.set(updated);
        this.isEditing.set(false);
        this.isSaving.set(false);
        this.toastService.success('Profile updated successfully!');
      },
      error: () => {
        this.isSaving.set(false);
        this.toastService.error('Failed to update profile');
      }
    });
  }

  togglePasswordForm(): void {
    this.showPasswordForm.set(!this.showPasswordForm());
    this.passwordData = { oldPassword: '', newPassword: '', confirmPassword: '' };
  }

  changePassword(): void {
    if (this.passwordData.newPassword !== this.passwordData.confirmPassword) {
      this.toastService.error('New passwords do not match');
      return;
    }
    if (!this.passwordData.oldPassword || !this.passwordData.newPassword) {
      this.toastService.error('Please fill all password fields');
      return;
    }
    this.apiService.changePatientPassword({
      oldPassword: this.passwordData.oldPassword,
      newPassword: this.passwordData.newPassword
    }).subscribe({
      next: (res) => {
        this.toastService.success(res);
        this.showPasswordForm.set(false);
        this.passwordData = { oldPassword: '', newPassword: '', confirmPassword: '' };
      },
      error: (err) => {
        this.toastService.error(err.error || 'Failed to change password');
      }
    });
  }

  formatDate(dateStr: string | undefined): string {
    if (!dateStr) return 'N/A';
    return new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }
}
