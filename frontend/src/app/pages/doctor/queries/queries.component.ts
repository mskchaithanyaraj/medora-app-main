import { Component } from '@angular/core';
import { StaffQueriesComponent } from '../../../shared/staff-queries/staff-queries.component';

@Component({
  selector: 'app-doctor-queries',
  standalone: true,
  imports: [StaffQueriesComponent],
  template: `<app-staff-queries role="doctor" />`
})
export class DoctorQueriesComponent {}
