# Medora Frontend - Development Documentation

## Overview
Medora is a healthcare appointment booking application built with Angular 21. This document tracks the development progress, packages used, and architectural decisions.

---

## Tech Stack

| Technology | Version | Purpose |
|------------|---------|---------|
| Angular | 21.2.11 | Frontend framework |
| TypeScript | 5.8 | Type-safe JavaScript |
| PrimeNG | 21.0.4 | UI component library (calendar, dropdowns) |
| date-fns | Latest | Date manipulation utilities |
| @primeuix/themes | Latest | PrimeNG theming |

---

## Project Structure

```
frontend/src/app/
├── core/                       # Core module (services, guards, interceptors)
│   ├── guards/
│   │   └── auth.guard.ts       # Route guards (authGuard, roleGuard, guestGuard)
│   ├── interceptors/
│   │   └── auth.interceptor.ts # HTTP interceptor for JWT & error handling
│   ├── models/
│   │   └── user.model.ts       # TypeScript interfaces
│   └── services/
│       ├── api.service.ts      # All API endpoints
│       ├── auth.service.ts     # Authentication (login, register, logout)
│       ├── toast.service.ts    # Toast notifications
│       └── user.service.ts     # User state management
├── shared/                     # Shared/reusable components
│   └── dashboard-layout/       # Reusable dashboard layout component
├── components/                 # Modal components
│   ├── login/                  # Login modal
│   ├── register/               # Registration modal
│   └── toast/                  # Toast notification component
├── pages/                      # Page components
│   ├── home/                   # Landing page
│   ├── patient/                # Patient dashboard & features
│   │   ├── appointments/       # View appointments
│   │   ├── book-appointment/   # Book new appointment
│   │   ├── prescriptions/      # View prescriptions
│   │   └── profile/            # Patient profile
│   ├── doctor/                 # Doctor dashboard & features
│   │   ├── appointments/       # View patient appointments
│   │   ├── prescriptions/      # View prescriptions
│   │   ├── create-prescription/# Create new prescription
│   │   ├── patient-history/    # Search patient history
│   │   └── profile/            # Doctor profile (editable)
│   └── coming-soon/            # Placeholder for unimplemented features
└── environments/               # Environment configuration
    ├── environment.ts          # Development config
    └── environment.prod.ts     # Production config
```

---

## Environment Configuration

All API URLs are centralized in environment files:

**Development** (`src/environments/environment.ts`):
```typescript
export const environment = {
  production: false,
  apiUrl: 'http://localhost:8080/api',
  appName: 'Medora',
  tokenExpiryBuffer: 60000
};
```

**Production** (`src/environments/environment.prod.ts`):
```typescript
export const environment = {
  production: true,
  apiUrl: 'https://api.medora.com/api',
  appName: 'Medora',
  tokenExpiryBuffer: 60000
};
```

To change the API URL, update it once in the environment file and it will be used everywhere.

---

## Phase 1: Core Infrastructure ✅

### Completed Tasks
1. **Core Services**
   - `UserService`: User state management with Angular signals, localStorage persistence
   - `AuthService`: Login, register, logout API integration
   - `ApiService`: All 28 backend API endpoints organized by role
   - `ToastService`: Toast notification system

2. **Auth Guards & Interceptors**
   - `authGuard`: Protects routes requiring authentication
   - `roleGuard`: Role-based access control (PATIENT, DOCTOR, HOSPITAL, ADMIN)
   - `guestGuard`: Redirects logged-in users from public pages
   - `authInterceptor`: Adds JWT token to requests, handles errors

3. **Shared Components**
   - `ToastComponent`: Displays success/error/warning/info notifications
   - `LoginComponent`: Login modal with API integration
   - `RegisterComponent`: Registration with role-specific fields

### Packages Installed
```bash
npm install primeng @primeuix/themes date-fns
```

---

## Phase 2: Patient Features ✅

### Completed Tasks
1. **Patient Dashboard**
   - Sidebar navigation with theme toggle
   - Responsive layout with collapsible sidebar
   - Role-based routing

2. **View Appointments**
   - List all appointments with status badges
   - Filter by status (PENDING, CONFIRMED, COMPLETED, CANCELLED)
   - Cancel appointment functionality
   - API: `GET /api/patient/appointments`

3. **Book Appointment**
   - Doctor selection (mock data - API coming soon)
   - Date picker with min/max constraints
   - Time slot selection
   - API: `POST /api/patient/doctors/{doctorId}/appointments`

4. **View Prescriptions**
   - List prescriptions with diagnosis preview
   - Modal view for full prescription details
   - API: `GET /api/patient/prescriptions`

5. **Patient Profile**
   - View profile information
   - API: `GET /api/patient/profile`
   - Edit profile - Coming Soon

---

## Phase 3: Doctor Features ✅

### Completed Tasks
1. **Doctor Dashboard**
   - Reusable dashboard layout component
   - Sidebar with: Appointments, Prescriptions, Patient History, Profile
   - Theme toggle and logout functionality

2. **View Appointments**
   - List all patient appointments (mock data - API coming soon)
   - Filter by status
   - "Write Prescription" button for completed appointments

3. **Prescriptions Management**
   - View all written prescriptions
   - Create new prescription for appointments
   - API: `POST /api/doctors/prescriptions/appointment/{appointmentId}`

4. **Patient History Search**
   - Search by patient ID
   - View all prescriptions for a patient
   - API: `GET /api/doctors/prescriptions/patient/{patientId}`

5. **Doctor Profile**
   - View profile information
   - Edit qualification, experience, location
   - API: `PATCH /api/doctors/profile`

### Shared Components Created
- `DashboardLayoutComponent`: Reusable sidebar dashboard layout with menu items input

---

## API Integration

### Available APIs (28 endpoints)
All APIs are documented in `backend/app/API_IMPLEMENTATION.md`

### Services Usage
```typescript
// Import services
import { AuthService, ApiService, ToastService, UserService } from './core/services';

// Inject in component
private apiService = inject(ApiService);
private toastService = inject(ToastService);

// Use API
this.apiService.getPatientAppointments().subscribe({
  next: (appointments) => { /* handle data */ },
  error: () => { /* error handled by interceptor */ }
});
```

---

## Theming

### CSS Variables
Theme uses CSS custom properties defined in `src/styles.css`:

```css
:root {
  --bg-primary: #ffffff;
  --bg-secondary: #f5f5f5;
  --text-primary: #1a1a1a;
  --color-dark: #1a1a1a;
  /* ... more variables */
}

[data-theme="dark"] {
  --bg-primary: #121212;
  --bg-secondary: #1e1e1e;
  --text-primary: #f5f5f5;
  /* ... more variables */
}
```

### Theme Toggle
Users can toggle between light and dark modes. Preference is saved in localStorage.

---

## Coming Soon Features
- Hospital Dashboard
- Admin Dashboard
- Doctor Search & Filter
- Reviews & Ratings
- Fraud Reporting
- Password Reset
- Medical History

---

## Development Commands

```bash
# Install dependencies
npm install

# Start development server
ng serve

# Build for production
ng build --configuration=production

# Run tests
ng test
```

---

## Last Updated
May 20, 2026

## Author
Medora Development Team
