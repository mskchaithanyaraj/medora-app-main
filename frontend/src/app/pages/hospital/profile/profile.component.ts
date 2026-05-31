import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService, ToastService } from '../../../core/services';
import { Hospital } from '../../../core/models';

@Component({
  selector: 'app-hospital-profile',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.css'
})
export class HospitalProfileComponent implements OnInit {
  private apiService = inject(ApiService);
  private toastService = inject(ToastService);

  profile = signal<Hospital | null>(null);
  isLoading = signal(true);
  isEditing = signal(false);
  isSaving = signal(false);
  showPasswordForm = signal(false);

  editData = { name: '', address: '', contact: '' };
  passwordData = { oldPassword: '', newPassword: '', confirmPassword: '' };

  ngOnInit(): void {
    this.loadProfile();
  }

  loadProfile(): void {
    this.isLoading.set(true);
    this.apiService.getHospitalProfile().subscribe({
      next: (hospital) => {
        this.profile.set(hospital);
        this.isLoading.set(false);
      },
      error: () => {
        this.toastService.error('Failed to load profile');
        this.isLoading.set(false);
      }
    });
  }

  startEditing(): void {
    const p = this.profile();
    if (p) {
      this.editData = { name: p.name, address: p.address || '', contact: p.contact || '' };
    }
    this.isEditing.set(true);
  }

  cancelEditing(): void {
    this.isEditing.set(false);
  }

  saveProfile(): void {
    this.isSaving.set(true);
    this.apiService.updateHospitalProfile({
      id: this.profile()?.id,
      name: this.editData.name,
      address: this.editData.address,
      contact: this.editData.contact
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
    this.apiService.changeHospitalPassword({
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

  getStatusClass(status: string): string {
    switch (status) {
      case 'APPROVED': return 'badge-success';
      case 'PENDING': return 'badge-warning';
      case 'REJECTED': return 'badge-error';
      case 'SUSPENDED': return 'badge-error';
      case 'FRAUD': return 'badge-error';
      default: return 'badge-primary';
    }
  }
}
