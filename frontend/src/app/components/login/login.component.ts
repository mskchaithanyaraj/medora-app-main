import { Component, output, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService, UserService, ToastService } from '../../core/services';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  closeModal = output<void>();
  switchToRegister = output<void>();

  private authService = inject(AuthService);
  private userService = inject(UserService);
  private toastService = inject(ToastService);
  private router = inject(Router);

  isLoading = signal(false);

  loginData = {
    username: '',
    password: '',
    rememberMe: false
  };

  onSubmit(): void {
    if (!this.loginData.username || !this.loginData.password) {
      this.toastService.warning('Please enter username and password');
      return;
    }

    this.isLoading.set(true);
    
    this.authService.login({
      username: this.loginData.username,
      password: this.loginData.password
    }).subscribe({
      next: () => {
        this.isLoading.set(false);
        this.toastService.success('Login successful!');
        this.closeModal.emit();
        // Navigate to dashboard based on role
        this.router.navigate([this.userService.getDashboardRoute()]);
      },
      error: (err) => {
        this.isLoading.set(false);
        const errorMessage = err.error?.message || err.error || 'Invalid username or password';
        this.toastService.error(typeof errorMessage === 'string' ? errorMessage : 'Login failed');
      }
    });
  }

  onClose(): void {
    this.closeModal.emit();
  }

  onSwitchToRegister(): void {
    this.switchToRegister.emit();
  }
}
