import { Routes } from '@angular/router';
import { HomeComponent } from './pages/home/home.component';
import { authGuard, roleGuard } from './core/guards';

export const routes: Routes = [
  { path: '', component: HomeComponent },
  
  // Patient Routes
  {
    path: 'patient',
    loadComponent: () => import('./pages/patient/patient-dashboard.component').then(m => m.PatientDashboardComponent),
    canActivate: [authGuard, roleGuard(['PATIENT'])],
    children: [
      { path: '', redirectTo: 'appointments', pathMatch: 'full' },
      {
        path: 'appointments',
        loadComponent: () => import('./pages/patient/appointments/appointments.component').then(m => m.PatientAppointmentsComponent)
      },
      {
        path: 'book',
        loadComponent: () => import('./pages/patient/book-appointment/book-appointment.component').then(m => m.BookAppointmentComponent)
      },
      {
        path: 'prescriptions',
        loadComponent: () => import('./pages/patient/prescriptions/prescriptions.component').then(m => m.PatientPrescriptionsComponent)
      },
      {
        path: 'profile',
        loadComponent: () => import('./pages/patient/profile/profile.component').then(m => m.PatientProfileComponent)
      },
      {
        path: 'queries',
        loadComponent: () => import('./pages/patient/queries/queries.component').then(m => m.PatientQueriesComponent)
      },
      {
        path: 'fraud-reports',
        loadComponent: () => import('./pages/patient/fraud-reports/fraud-reports.component').then(m => m.PatientFraudReportsComponent)
      }
    ]
  },

  // Doctor Routes
  {
    path: 'doctor',
    loadComponent: () => import('./pages/doctor/doctor-dashboard.component').then(m => m.DoctorDashboardComponent),
    canActivate: [authGuard, roleGuard(['DOCTOR'])],
    children: [
      { path: '', redirectTo: 'appointments', pathMatch: 'full' },
      {
        path: 'appointments',
        loadComponent: () => import('./pages/doctor/appointments/appointments.component').then(m => m.DoctorAppointmentsComponent)
      },
      {
        path: 'prescriptions',
        loadComponent: () => import('./pages/doctor/prescriptions/prescriptions.component').then(m => m.DoctorPrescriptionsComponent)
      },
      {
        path: 'prescriptions/create/:appointmentId',
        loadComponent: () => import('./pages/doctor/create-prescription/create-prescription.component').then(m => m.CreatePrescriptionComponent)
      },
      {
        path: 'patients',
        loadComponent: () => import('./pages/doctor/patient-history/patient-history.component').then(m => m.PatientHistoryComponent)
      },
      {
        path: 'profile',
        loadComponent: () => import('./pages/doctor/profile/profile.component').then(m => m.DoctorProfileComponent)
      },
      {
        path: 'queries',
        loadComponent: () => import('./pages/doctor/queries/queries.component').then(m => m.DoctorQueriesComponent)
      }
    ]
  },

  // Hospital Routes
  {
    path: 'hospital',
    loadComponent: () => import('./pages/hospital/hospital-dashboard.component').then(m => m.HospitalDashboardComponent),
    canActivate: [authGuard, roleGuard(['HOSPITAL'])],
    children: [
      { path: '', redirectTo: 'doctors', pathMatch: 'full' },
      {
        path: 'doctors',
        loadComponent: () => import('./pages/hospital/doctors/doctors.component').then(m => m.HospitalDoctorsComponent)
      },
      {
        path: 'pending',
        loadComponent: () => import('./pages/hospital/pending/pending.component').then(m => m.PendingApprovalsComponent)
      },
      {
        path: 'profile',
        loadComponent: () => import('./pages/hospital/profile/profile.component').then(m => m.HospitalProfileComponent)
      },
      {
        path: 'queries',
        loadComponent: () => import('./pages/hospital/queries/queries.component').then(m => m.HospitalQueriesComponent)
      }
    ]
  },

  // Admin Routes
  {
    path: 'admin',
    loadComponent: () => import('./pages/admin/admin-dashboard.component').then(m => m.AdminDashboardComponent),
    canActivate: [authGuard, roleGuard(['ADMIN'])],
    children: [
      { path: '', redirectTo: 'hospitals', pathMatch: 'full' },
      {
        path: 'hospitals',
        loadComponent: () => import('./pages/admin/hospitals/hospitals.component').then(m => m.AdminHospitalsComponent)
      },
      {
        path: 'pending',
        loadComponent: () => import('./pages/admin/pending/pending.component').then(m => m.AdminPendingComponent)
      },
      {
        path: 'doctors',
        loadComponent: () => import('./pages/admin/doctors/doctors.component').then(m => m.AdminDoctorsComponent)
      },
      {
        path: 'patients',
        loadComponent: () => import('./pages/admin/patients/patients.component').then(m => m.AdminPatientsComponent)
      },
      {
        path: 'queries',
        loadComponent: () => import('./pages/admin/queries/queries.component').then(m => m.AdminQueriesComponent)
      },
      {
        path: 'fraud-reports',
        loadComponent: () => import('./pages/admin/fraud-reports/fraud-reports.component').then(m => m.AdminFraudReportsComponent)
      }
    ]
  },

  { path: '**', redirectTo: '' }
];
