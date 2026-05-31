import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { DashboardLayoutComponent, MenuItem } from '../../shared/dashboard-layout/dashboard-layout.component';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [RouterOutlet, DashboardLayoutComponent],
  template: `
    <app-dashboard-layout [pageTitle]="'Admin Dashboard'" [menuItems]="menuItems">
      <router-outlet></router-outlet>
    </app-dashboard-layout>
  `
})
export class AdminDashboardComponent {
  menuItems: MenuItem[] = [
    { path: '/admin/hospitals', label: 'Hospitals', icon: 'hospital' },
    { path: '/admin/pending', label: 'Pending Approvals', icon: 'history' },
    { path: '/admin/doctors', label: 'Doctors', icon: 'stethoscope' },
    { path: '/admin/patients', label: 'Patients', icon: 'users' },
    { path: '/admin/queries', label: 'Queries', icon: 'chat' },
    { path: '/admin/fraud-reports', label: 'Fraud Reports', icon: 'alert' }
  ];
}
