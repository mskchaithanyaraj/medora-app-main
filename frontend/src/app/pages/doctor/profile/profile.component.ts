import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService, ToastService, UserService } from '../../../core/services';
import { Doctor } from '../../../core/models';

@Component({
  selector: 'app-doctor-profile',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class DoctorProfileComponent implements OnInit {
  private apiService = inject(ApiService);
  private toastService = inject(ToastService);
  private userService = inject(UserService);

  profile = signal<Doctor | null>(null);
  isLoading = signal(true);
  isEditing = signal(false);
  isSaving = signal(false);
  showPasswordForm = signal(false);

  editData = { name: '', qualification: '', experience: 0, location: '' };
  passwordData = { oldPassword: '', newPassword: '', confirmPassword: '' };

  ngOnInit(): void {
    this.loadProfile();
  }

  loadProfile(): void {
    this.isLoading.set(true);
    this.apiService.getDoctorProfile().subscribe({
      next: (data) => {
        this.profile.set(data);
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
      this.editData = {
        name: p.name,
        qualification: p.qualification,
        experience: p.experience,
        location: p.location
      };
    }
    this.isEditing.set(true);
  }

  cancelEditing(): void {
    this.isEditing.set(false);
  }

  saveProfile(): void {
    this.isSaving.set(true);
    this.apiService.updateDoctorProfile({
      id: this.profile()?.id,
      name: this.editData.name,
      qualification: this.editData.qualification,
      experience: this.editData.experience,
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
    this.apiService.changeDoctorPassword({
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
      default: return 'badge-primary';
    }
  }
}
