import { Component, inject, OnInit, signal, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { UserService, AuthService, ToastService } from '../../core/services';

export interface MenuItem {
  path: string;
  label: string;
  icon: string;
}

@Component({
  selector: 'app-dashboard-layout',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './dashboard-layout.component.html',
  styleUrls: ['./dashboard-layout.component.css']
})
export class DashboardLayoutComponent implements OnInit {
  private userService = inject(UserService);
  private authService = inject(AuthService);
  private toastService = inject(ToastService);
  private router = inject(Router);

  // Inputs
  pageTitle = input<string>('Dashboard');
  menuItems = input<MenuItem[]>([]);

  username = this.userService.username;
  role = this.userService.getPrimaryRole();
  isSidebarOpen = signal(true);
  isDarkMode = signal(false);

  ngOnInit(): void {
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
        this.authService.logoutLocally();
        this.router.navigate(['/']);
      }
    });
  }

  getRoleLabel(): string {
    switch (this.role) {
      case 'PATIENT': return 'Patient';
      case 'DOCTOR': return 'Doctor';
      case 'HOSPITAL': return 'Hospital';
      case 'ADMIN': return 'Administrator';
      default: return 'User';
    }
  }
}
