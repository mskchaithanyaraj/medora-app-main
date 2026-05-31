import { Component, output, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService, AuthService, ToastService } from '../../core/services';
import { RegistrationRequest, UserRole } from '../../core/models';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent {
  closeModal = output<void>();
  switchToLogin = output<void>();

  private apiService = inject(ApiService);
  private authService = inject(AuthService);
  private toastService = inject(ToastService);

  isLoading = signal(false);
  showPasswordMismatch = signal(false);
  hospitals = signal<string[]>([]);

  loadHospitals(): void {
    if (this.hospitals().length === 0) {
      this.apiService.getHospitalNames().subscribe({
        next: (names) => this.hospitals.set(names),
        error: () => this.toastService.error('Failed to load hospitals')
      });
    }
  }

  registerData = {
    role: '' as UserRole | '',
    fullName: '',
    username: '',
    password: '',
    confirmPassword: '',
    agreeToTerms: false,
    // Patient specific
    age: null as number | null,
    gender: '',
    phone: '',
    location: '',
    // Doctor specific
    hospitalName: '',
    licenceNumber: '',
    qualification: '',
    experience: null as number | null,
    // Hospital specific
    address: '',
    contact: ''
  };

  onSubmit(): void {
    // Validate passwords match
    if (this.registerData.password !== this.registerData.confirmPassword) {
      this.showPasswordMismatch.set(true);
      return;
    }

    if (!this.registerData.agreeToTerms) {
      this.toastService.warning('Please agree to the Terms of Service');
      return;
    }
    
    this.showPasswordMismatch.set(false);
    this.isLoading.set(true);

    const request = this.buildRegistrationRequest();

    this.authService.register(request).subscribe({
      next: () => {
        this.isLoading.set(false);
        this.toastService.success('Registration successful! Please login.');
        this.switchToLogin.emit();
      },
      error: (err) => {
        this.isLoading.set(false);
        if (err.error?.message) {
          this.toastService.error(err.error.message);
        }
      }
    });
  }

  private buildRegistrationRequest(): RegistrationRequest {
    const base: RegistrationRequest = {
      username: this.registerData.username,
      password: this.registerData.password,
      roles: [this.registerData.role as UserRole]
    };

    switch (this.registerData.role) {
      case 'PATIENT':
        return {
          ...base,
          patientName: this.registerData.fullName,
          patientAge: this.registerData.age || undefined,
          patientGender: this.registerData.gender || undefined,
          patientPhone: this.registerData.phone || undefined,
          patientLocation: this.registerData.location || undefined
        };
      case 'DOCTOR':
        return {
          ...base,
          doctorName: this.registerData.fullName,
          hospitalName: this.registerData.hospitalName || undefined,
          licenceNumber: this.registerData.licenceNumber || undefined,
          qualification: this.registerData.qualification || undefined,
          experience: this.registerData.experience || undefined,
          doctorLocation: this.registerData.location || undefined
        };
      case 'HOSPITAL':
        return {
          ...base,
          hospitalName: this.registerData.fullName,
          hospitalAddress: this.registerData.address || undefined,
          hospitalContact: this.registerData.contact || undefined
        };
      default:
        return base;
    }
  }

  onClose(): void {
    this.closeModal.emit();
  }

  onSwitchToLogin(): void {
    this.switchToLogin.emit();
  }

  onPasswordChange(): void {
    if (this.showPasswordMismatch()) {
      this.showPasswordMismatch.set(false);
    }
  }
}
