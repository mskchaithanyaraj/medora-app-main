import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { DashboardLayoutComponent, MenuItem } from '../../shared/dashboard-layout/dashboard-layout.component';

@Component({
  selector: 'app-doctor-dashboard',
  standalone: true,
  imports: [RouterOutlet, DashboardLayoutComponent],
  template: `
    <app-dashboard-layout [pageTitle]="'Doctor Dashboard'" [menuItems]="menuItems">
      <router-outlet></router-outlet>
    </app-dashboard-layout>
  `
})
export class DoctorDashboardComponent {
  menuItems: MenuItem[] = [
    { path: '/doctor/appointments', label: 'My Appointments', icon: 'calendar' },
    { path: '/doctor/prescriptions', label: 'Prescriptions', icon: 'prescription' },
    { path: '/doctor/queries', label: 'Queries', icon: 'chat' },
    { path: '/doctor/profile', label: 'My Profile', icon: 'user' }
  ];
}
