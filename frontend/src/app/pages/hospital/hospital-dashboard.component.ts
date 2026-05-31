import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { DashboardLayoutComponent, MenuItem } from '../../shared/dashboard-layout/dashboard-layout.component';

@Component({
  selector: 'app-hospital-dashboard',
  standalone: true,
  imports: [DashboardLayoutComponent, RouterOutlet],
  template: `
    <app-dashboard-layout [menuItems]="menuItems" dashboardTitle="Hospital Dashboard">
      <router-outlet />
    </app-dashboard-layout>
  `
})
export class HospitalDashboardComponent {
  menuItems: MenuItem[] = [
    { path: '/hospital/doctors', label: 'Doctors', icon: 'stethoscope' },
    { path: '/hospital/pending', label: 'Pending Approvals', icon: 'pending' },
    { path: '/hospital/queries', label: 'Queries', icon: 'chat' },
    { path: '/hospital/profile', label: 'Profile', icon: 'user' }
  ];
}
