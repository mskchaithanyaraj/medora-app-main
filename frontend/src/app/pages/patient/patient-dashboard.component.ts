import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { UserService, AuthService, ToastService } from '../../core/services';

@Component({
  selector: 'app-patient-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './patient-dashboard.component.html',
  styleUrls: ['./patient-dashboard.component.css']
})
export class PatientDashboardComponent implements OnInit {
  private userService = inject(UserService);
  private authService = inject(AuthService);
  private toastService = inject(ToastService);
  private router = inject(Router);

  username = this.userService.username;
  isSidebarOpen = signal(true);
  isDarkMode = signal(false);

  menuItems = [
    { path: '/patient/appointments', label: 'My Appointments', icon: 'calendar' },
    { path: '/patient/book', label: 'Book Appointment', icon: 'plus' },
    { path: '/patient/prescriptions', label: 'My Prescriptions', icon: 'prescription' },
    { path: '/patient/queries', label: 'Queries', icon: 'chat' },
    { path: '/patient/fraud-reports', label: 'Fraud Reports', icon: 'alert' },
    { path: '/patient/profile', label: 'My Profile', icon: 'user' }
  ];

  ngOnInit(): void {
    // Check for saved theme preference
    if (typeof window !== 'undefined') {
      const savedTheme = localStorage.getItem('medora_theme');
      if (savedTheme === 'dark') {
        this.isDarkMode.set(true);
        document.documentElement.setAttribute('data-theme', 'dark');
      }
    }
  }

  toggleSidebar(): void {
    this.isSidebarOpen.update(v => !v);
  }

  toggleTheme(): void {
    this.isDarkMode.update(v => !v);
    const theme = this.isDarkMode() ? 'dark' : 'light';
    document.documentElement.setAttribute('data-theme', theme);
    if (typeof window !== 'undefined') {
      localStorage.setItem('medora_theme', theme);
    }
  }

  logout(): void {
    this.authService.logout().subscribe({
      next: () => {
        this.toastService.success('Logged out successfully');
        this.router.navigate(['/']);
      },
      error: () => {
        // Even if API fails, logout locally
        this.authService.logoutLocally();
        this.router.navigate(['/']);
      }
    });
  }
}
