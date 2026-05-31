# MEDORA — FRONTEND INTERVIEW PREPARATION HANDBOOK (Part 1)

---

# 1. FRONTEND ARCHITECTURE

## 1.1 Overall Architecture

Medora's frontend is an **Angular 21 Standalone Component** application using:
- **Angular Signals** for reactive state management (not NgRx/Redux)
- **Functional Guards & Interceptors** (modern Angular pattern, no class-based)
- **Lazy Loading** via `loadComponent()` for all dashboard pages
- **Server-Side Rendering (SSR)** via `@angular/ssr`
- **PrimeNG 21** for UI components + **Tailwind CSS 4** for styling
- **Lucide Icons** for iconography

**Interview Answer:**
> "Our Angular 21 frontend follows a modular standalone component architecture. We use Angular Signals for state management instead of traditional RxJS BehaviorSubjects for simpler, synchronous reactivity. All route modules are lazy-loaded using `loadComponent()` for optimal bundle splitting. Authentication state is managed via a centralized `UserService` using signals, with JWT tokens stored in localStorage. We have a functional HTTP interceptor that automatically attaches Bearer tokens and handles 401 errors globally."

## 1.2 Folder Structure

```
frontend/src/
├── app/
│   ├── app.ts                          # Root component
│   ├── app.html                        # Root template (router-outlet + toast)
│   ├── app.css                         # Root styles
│   ├── app.config.ts                   # App configuration (providers)
│   ├── app.routes.ts                   # All route definitions
│   ├── app.routes.server.ts            # SSR route config
│   ├── app.config.server.ts            # SSR app config
│   │
│   ├── components/                     # Shared/Reusable components
│   │   ├── login/                      # Login modal component
│   │   ├── register/                   # Registration modal component
│   │   └── toast/                      # Toast notification component
│   │
│   ├── core/                           # Core module (singleton services)
│   │   ├── guards/
│   │   │   └── auth.guard.ts           # authGuard, roleGuard, guestGuard
│   │   ├── interceptors/
│   │   │   └── auth.interceptor.ts     # JWT token interceptor
│   │   ├── models/
│   │   │   └── user.model.ts           # All TypeScript interfaces
│   │   └── services/
│   │       ├── api.service.ts          # ALL API calls (346 lines)
│   │       ├── auth.service.ts         # Login/Register/Logout
│   │       ├── user.service.ts         # User state management (Signals)
│   │       └── toast.service.ts        # Toast notification service
│   │
│   ├── pages/                          # Feature pages (lazy-loaded)
│   │   ├── home/                       # Landing page
│   │   ├── admin/                      # Admin dashboard + children
│   │   │   ├── admin-dashboard.component.ts
│   │   │   ├── hospitals/              # Hospital management
│   │   │   ├── pending/                # Pending approvals
│   │   │   ├── doctors/                # Doctor management
│   │   │   ├── patients/               # Patient management
│   │   │   ├── queries/                # Query management
│   │   │   └── fraud-reports/          # Fraud report management
│   │   ├── doctor/                     # Doctor dashboard + children
│   │   │   ├── doctor-dashboard.component.ts
│   │   │   ├── appointments/           # View appointments
│   │   │   ├── prescriptions/          # View prescriptions
│   │   │   ├── create-prescription/    # Create prescription
│   │   │   ├── patient-history/        # Patient history
│   │   │   ├── profile/                # Doctor profile
│   │   │   └── queries/                # Queries
│   │   ├── hospital/                   # Hospital dashboard + children
│   │   │   ├── hospital-dashboard.component.ts
│   │   │   ├── doctors/                # Manage doctors
│   │   │   ├── pending/                # Pending doctor approvals
│   │   │   ├── profile/                # Hospital profile
│   │   │   └── queries/                # Queries
│   │   └── patient/                    # Patient dashboard + children
│   │       ├── patient-dashboard.component.ts
│   │       ├── appointments/           # View appointments
│   │       ├── book-appointment/       # Book new appointment
│   │       ├── prescriptions/          # View prescriptions
│   │       ├── fraud-reports/          # Submit fraud reports
│   │       ├── profile/                # Patient profile
│   │       └── queries/                # Submit queries
│   │
│   └── shared/                         # Shared layout components
│       ├── dashboard-layout/           # Reusable dashboard layout
│       └── staff-queries/              # Shared queries component
│
├── environments/
│   ├── environment.ts                  # Dev config (apiUrl: http://localhost:8000/api)
│   └── environment.prod.ts             # Production config
│
├── styles.css                          # Global styles (19KB)
├── main.ts                             # Browser bootstrap
├── main.server.ts                      # Server bootstrap
├── server.ts                           # Express SSR server
└── index.html                          # HTML entry point
```

## 1.3 Routing Structure

```
Path                                    Component                    Guard
/                                       HomeComponent                none
/patient                                PatientDashboardComponent    authGuard + roleGuard(['PATIENT'])
  /patient/appointments                 PatientAppointmentsComponent (child, lazy)
  /patient/book                         BookAppointmentComponent     (child, lazy)
  /patient/prescriptions                PatientPrescriptionsComponent(child, lazy)
  /patient/profile                      PatientProfileComponent      (child, lazy)
  /patient/queries                      PatientQueriesComponent      (child, lazy)
  /patient/fraud-reports                PatientFraudReportsComponent (child, lazy)
/doctor                                 DoctorDashboardComponent     authGuard + roleGuard(['DOCTOR'])
  /doctor/appointments                  DoctorAppointmentsComponent  (child, lazy)
  /doctor/prescriptions                 DoctorPrescriptionsComponent (child, lazy)
  /doctor/prescriptions/create/:id      CreatePrescriptionComponent  (child, lazy)
  /doctor/patients                      PatientHistoryComponent      (child, lazy)
  /doctor/profile                       DoctorProfileComponent       (child, lazy)
  /doctor/queries                       DoctorQueriesComponent       (child, lazy)
/hospital                               HospitalDashboardComponent   authGuard + roleGuard(['HOSPITAL'])
  /hospital/doctors                     HospitalDoctorsComponent     (child, lazy)
  /hospital/pending                     PendingApprovalsComponent    (child, lazy)
  /hospital/profile                     HospitalProfileComponent     (child, lazy)
  /hospital/queries                     HospitalQueriesComponent     (child, lazy)
/admin                                  AdminDashboardComponent      authGuard + roleGuard(['ADMIN'])
  /admin/hospitals                      AdminHospitalsComponent      (child, lazy)
  /admin/pending                        AdminPendingComponent        (child, lazy)
  /admin/doctors                        AdminDoctorsComponent        (child, lazy)
  /admin/patients                       AdminPatientsComponent       (child, lazy)
  /admin/queries                        AdminQueriesComponent        (child, lazy)
  /admin/fraud-reports                  AdminFraudReportsComponent   (child, lazy)
/**                                     Redirect to /                (wildcard)
```

**Key Pattern:** Each role has a parent dashboard component with child routes. The parent loads `DashboardLayoutComponent` (sidebar + header) and renders children via `<router-outlet>`.

## 1.4 Data Flow Architecture

```
User Action (click/form submit)
       ↓
Component (calls service method)
       ↓
ApiService (HttpClient.get/post/patch/delete)
       ↓
AuthInterceptor (attaches Bearer token)
       ↓
HTTP Request → Spring Boot Backend
       ↓
Response arrives
       ↓
Component updates Signal
       ↓
Template re-renders (Signal-based reactivity)
```

## 1.5 Authentication Flow

```
LOGIN FLOW:
User enters credentials → LoginComponent.onSubmit()
  → AuthService.login(credentials)
    → POST /api/login
    → Response: { token, username, roles, expiresIn }
    → tap() operator: Creates CurrentUser object
    → UserService.setUser(currentUser)
      → Saves to Signal + localStorage (key: 'medora_user')
    → Router.navigate(getDashboardRoute())

ROUTE PROTECTION:
User navigates to /patient/*
  → authGuard checks UserService.isLoggedIn()
    → Reads signal → checks expiresAt > Date.now()
  → roleGuard(['PATIENT']) checks UserService.roles()
    → Verifies user has PATIENT role
  → If both pass → allow navigation
  → If fail → toast warning + redirect to /

TOKEN ATTACHMENT:
Any HTTP request triggers authInterceptor
  → Reads token from UserService.token() signal
  → Skips public endpoints (/login, /register, /api/hospitals)
  → Clones request with Authorization: Bearer <token>
  → On 401 error → AuthService.logoutLocally() → redirect to /

LOGOUT FLOW:
User clicks logout → DashboardLayout.logout()
  → AuthService.logout()
    → POST /api/logout (with token)
    → tap(): UserService.clearUser()
      → Sets signal to null + removes localStorage
    → Router.navigate(['/'])
```

---

# 2. FRONTEND FILE EXPLORATION ROADMAP

If interviewer says "Show me frontend code", follow this order:

### Step 1: `app.config.ts`
**Purpose:** Application bootstrap configuration  
**Show:** `provideRouter(routes)`, `provideHttpClient(withFetch(), withInterceptors([authInterceptor]))`, `provideClientHydration(withEventReplay())`  
**Interview:** "This is where we register all providers. We use functional interceptors instead of class-based — a modern Angular 21 pattern. `withFetch()` uses the Fetch API instead of XMLHttpRequest for better SSR compatibility."

### Step 2: `app.routes.ts`
**Purpose:** All application routes with lazy loading and guards  
**Show:** `loadComponent()`, `canActivate: [authGuard, roleGuard(['PATIENT'])]`  
**Interview:** "All routes are lazy-loaded using `loadComponent()` with dynamic imports. Each role-specific route is protected by both `authGuard` (checks login) and `roleGuard` (checks role). Children routes use `redirectTo` for default sub-page."

### Step 3: `core/models/user.model.ts`
**Purpose:** All TypeScript interfaces and type definitions (231 lines)  
**Show:** `UserRole`, `AuthStatus`, `BookingStatus`, `SlotType`, `CurrentUser`, `LoginRequest`, `LoginResponse`, `RegistrationRequest`, `Patient`, `Doctor`, `Hospital`, `Appointment`, `Prescription`, `Query`, `Reply`, `Review`, `FraudReport`  
**Interview:** "We define strong TypeScript types for all domain entities. Using union types like `type UserRole = 'ADMIN' | 'HOSPITAL' | 'DOCTOR' | 'PATIENT'` for compile-time safety."

### Step 4: `core/services/user.service.ts`
**Purpose:** Centralized user state management using Angular Signals  
**Show:** `signal<CurrentUser | null>`, `computed(() => ...)`, `localStorage` persistence  
**Interview:** "This is the single source of truth for authentication state. We use Angular Signals instead of BehaviorSubjects — they're synchronous, simpler, and integrate natively with Angular's change detection. The `computed` signals (`isLoggedIn`, `isPatient`, etc.) automatically derive state."

### Step 5: `core/services/auth.service.ts`
**Purpose:** Authentication operations (login, register, logout)  
**Show:** `login()` with `tap()` operator, `logoutLocally()` for expired tokens  
**Interview:** "Login calls POST /api/login, then uses the RxJS `tap()` operator to side-effect store the token. We have both server-side logout (API call) and local-only logout (for expired tokens)."

### Step 6: `core/interceptors/auth.interceptor.ts`
**Purpose:** HTTP interceptor that attaches JWT tokens  
**Show:** Functional interceptor, public endpoint skip logic, 401 handling  
**Interview:** "This functional interceptor runs before every HTTP request. It reads the token from UserService signal, skips auth endpoints, clones the request with the Authorization header, and globally handles 401 errors by force-logging out."

### Step 7: `core/guards/auth.guard.ts`
**Purpose:** Three guards — `authGuard`, `roleGuard`, `guestGuard`  
**Show:** `CanActivateFn` functional guards, role checking  
**Interview:** "We use functional guards (Angular 14+ pattern). `roleGuard` is a higher-order function that returns a `CanActivateFn` — this lets us parameterize which roles are allowed."

### Step 8: `core/services/api.service.ts`
**Purpose:** ALL API calls centralized in one service (346 lines)  
**Show:** Patient APIs, Doctor APIs, Hospital APIs, Admin APIs  
**Interview:** "All HTTP calls are centralized here for maintainability. Each method is strongly typed with generics like `http.get<Patient[]>()`. We use environment variables for the API URL."

### Step 9: `components/login/login.component.ts`
**Purpose:** Login modal with form handling  
**Show:** `output()` for event emission, `signal()` for loading state, `FormsModule`  
**Interview:** "Uses Angular's new `output()` function instead of `@Output()` decorator. Loading state uses a signal. Template-driven forms with FormsModule."

### Step 10: `components/register/register.component.ts`
**Purpose:** Multi-role registration form  
**Show:** `buildRegistrationRequest()` role-based request building, hospital name loading  
**Interview:** "Registration supports Patient, Doctor, and Hospital roles. The `buildRegistrationRequest()` method dynamically builds the payload based on selected role using spread operator."

### Step 11: `pages/home/home.component.ts`
**Purpose:** Landing page with login/register modals  
**Show:** Feature cards, testimonials, modal toggling  
**Interview:** "The landing page uses signal-based modal state. Login and Register components communicate via `output()` events."

### Step 12: `shared/dashboard-layout/dashboard-layout.component.ts`
**Purpose:** Reusable dashboard shell (sidebar + header + content)  
**Show:** `input()` for menu items, theme toggling, logout  
**Interview:** "This is a reusable layout using Angular's `input()` function. All four dashboards (Patient, Doctor, Hospital, Admin) share this layout, passing different menu items."

### Step 13: `pages/patient/book-appointment/book-appointment.component.ts`
**Purpose:** Multi-step appointment booking flow  
**Show:** Doctor selection, date picker, slot availability check, booking submission  
**Interview:** "This is the most complex component. It fetches approved doctors, checks slot availability via API for a selected date, shows available/booked time slots, and submits the booking. It handles WAITING_LIST status too."

### Step 14: Dashboard components (patient, doctor, hospital, admin)
**Purpose:** Role-specific dashboard wrappers  
**Show:** Menu items configuration, DashboardLayoutComponent usage  
**Interview:** "Each dashboard defines its menu items and delegates rendering to the shared DashboardLayoutComponent. Doctor/Hospital/Admin use inline templates while Patient has a full template file with its own sidebar implementation."

---

# 3. COMPLETE API INTEGRATION ANALYSIS

## 3.1 Authentication APIs

### POST /api/register
- **Angular Service:** `AuthService.register()`
- **Component:** `RegisterComponent`
- **Route:** `/` (Home page modal)
- **Request:** `RegistrationRequest` (username, password, roles, role-specific fields)
- **Response:** `RegistrationResponse` (message, userId, username, roles)
- **Auth:** ❌ Not required
- **Flow:** Register button → RegisterComponent.onSubmit() → buildRegistrationRequest() → AuthService.register() → HttpClient.post → Interceptor (skips auth endpoint) → Backend → Response → Toast success → Switch to login modal

### POST /api/login
- **Angular Service:** `AuthService.login()`
- **Component:** `LoginComponent`
- **Route:** `/` (Home page modal)
- **Request:** `LoginRequest` { username, password }
- **Response:** `LoginResponse` { token, username, roles, expiresIn }
- **Auth:** ❌ Not required
- **Flow:** Login button → LoginComponent.onSubmit() → AuthService.login() → HttpClient.post → tap(store token in UserService + localStorage) → Router.navigate(getDashboardRoute()) → Dashboard loads

### POST /api/logout
- **Angular Service:** `AuthService.logout()`
- **Component:** `DashboardLayoutComponent` / `PatientDashboardComponent`
- **Route:** Any dashboard
- **Auth:** ✅ Required (Bearer token)
- **Flow:** Logout button → AuthService.logout() → HttpClient.post → tap(UserService.clearUser()) → Router.navigate(['/'])

### GET /api/hospitals (Public)
- **Angular Service:** `ApiService.getHospitalNames()`
- **Component:** `RegisterComponent`
- **Purpose:** Load hospital names for doctor registration dropdown
- **Auth:** ❌ Not required

## 3.2 Patient APIs

### GET /api/patient/profile
- **Service Method:** `ApiService.getPatientProfile()`
- **Component:** `PatientProfileComponent`
- **Route:** `/patient/profile`
- **Response:** `Patient` object
- **Auth:** ✅ PATIENT role

### PUT /api/patient/profile
- **Service Method:** `ApiService.updatePatientProfile(data)`
- **Component:** `PatientProfileComponent`
- **Auth:** ✅ PATIENT role

### PATCH /api/patient/password
- **Service Method:** `ApiService.changePatientPassword(data)`
- **Component:** `PatientProfileComponent`
- **Request:** `{ oldPassword, newPassword }`
- **Response:** text string
- **Auth:** ✅ PATIENT role

### GET /api/patient/doctors
- **Service Method:** `ApiService.getPatientDoctors()`
- **Component:** `BookAppointmentComponent`
- **Route:** `/patient/book`
- **Response:** `Doctor[]` (only APPROVED doctors shown)
- **Auth:** ✅ PATIENT role

### GET /api/patient/doctors/{doctorId}/slots/{date}
- **Service Method:** `ApiService.getDoctorSlots(doctorId, date)`
- **Component:** `BookAppointmentComponent`
- **Response:** `Slot` (morning, preNoon, afterNoon, evening, night statuses)
- **Auth:** ✅ PATIENT role

### GET /api/patient/appointments
- **Service Method:** `ApiService.getPatientAppointments()`
- **Component:** `PatientAppointmentsComponent`
- **Route:** `/patient/appointments`
- **Response:** `Appointment[]`
- **Auth:** ✅ PATIENT role

### POST /api/patient/doctors/{doctorId}/appointments
- **Service Method:** `ApiService.bookAppointment(doctorId, data)`
- **Component:** `BookAppointmentComponent`
- **Request:** `AppointmentRequest` { appointmentDate, slotType, problem }
- **Response:** `Appointment`
- **Auth:** ✅ PATIENT role

### PATCH /api/patient/appointments/{appointmentId}
- **Service Method:** `ApiService.cancelAppointment(appointmentId)`
- **Component:** `PatientAppointmentsComponent`
- **Response:** Updated `Appointment` with CANCELLED status
- **Auth:** ✅ PATIENT role

### GET /api/patient/prescriptions
- **Service Method:** `ApiService.getPatientPrescriptions()`
- **Component:** `PatientPrescriptionsComponent`
- **Route:** `/patient/prescriptions`
- **Auth:** ✅ PATIENT role

### POST /api/patient/doctors/{doctorId}/fraud-reports
- **Service Method:** `ApiService.postFraudReport(doctorId, data)`
- **Component:** `PatientFraudReportsComponent`
- **Auth:** ✅ PATIENT role

### POST /api/patient/queries
- **Service Method:** `ApiService.postQuery(data)`
- **Component:** `PatientQueriesComponent`
- **Auth:** ✅ PATIENT role

## 3.3 Doctor APIs

### GET /api/doctor/profile
- **Service Method:** `ApiService.getDoctorProfile()`
- **Component:** `DoctorProfileComponent`
- **Auth:** ✅ DOCTOR role

### PUT /api/doctor/profile
- **Service Method:** `ApiService.updateDoctorProfile(data)`
- **Component:** `DoctorProfileComponent`
- **Auth:** ✅ DOCTOR role

### GET /api/doctor/appointments
- **Service Method:** `ApiService.getDoctorAppointments()`
- **Component:** `DoctorAppointmentsComponent`
- **Auth:** ✅ DOCTOR role

### GET /api/doctor/appointments/booked | completed | cancelled
- **Service Method:** `ApiService.getDoctorBookedAppointments()` etc.
- **Component:** `DoctorAppointmentsComponent` (filter tabs)
- **Auth:** ✅ DOCTOR role

### POST /api/doctor/appointments/{appointmentId}/prescriptions
- **Service Method:** `ApiService.createPrescription(appointmentId, data)`
- **Component:** `CreatePrescriptionComponent`
- **Route:** `/doctor/prescriptions/create/:appointmentId`
- **Request:** `PrescriptionRequest` { diagnosis, medicine }
- **Auth:** ✅ DOCTOR role

### GET /api/doctor/prescriptions/patients/{patientId}
- **Service Method:** `ApiService.getPatientPrescriptionsByDoctor(patientId)`
- **Component:** `PatientHistoryComponent`
- **Auth:** ✅ DOCTOR role

## 3.4 Hospital APIs

### GET /api/hospital/doctors
- **Service Method:** `ApiService.getHospitalDoctors()`
- **Component:** `HospitalDoctorsComponent`
- **Auth:** ✅ HOSPITAL role

### GET /api/hospital/doctors/pending
- **Service Method:** `ApiService.getHospitalDoctorsByStatus('PENDING')`
- **Component:** `PendingApprovalsComponent`
- **Auth:** ✅ HOSPITAL role

### PATCH /api/hospital/doctors/{doctorId}/approve
- **Service Method:** `ApiService.approveDoctor(doctorId)`
- **Component:** `PendingApprovalsComponent`
- **Auth:** ✅ HOSPITAL role

### PATCH /api/hospital/doctors/{doctorId}/reject
- **Service Method:** `ApiService.rejectDoctor(doctorId, data)`
- **Component:** `PendingApprovalsComponent`
- **Request:** `{ rejectionReason: string }`
- **Auth:** ✅ HOSPITAL role

## 3.5 Admin APIs

### GET /api/admin/hospitals
- **Service Method:** `ApiService.getAllHospitals()`
- **Component:** `AdminHospitalsComponent`
- **Auth:** ✅ ADMIN role

### PATCH /api/admin/hospitals/{id}/approve | reject | suspend | fraud
- **Service Methods:** `approveHospital()`, `rejectHospital()`, `suspendHospital()`, `flagHospitalAsFraud()`
- **Component:** `AdminHospitalsComponent`
- **Auth:** ✅ ADMIN role

### GET /api/admin/patients
- **Service Method:** `ApiService.getAllPatients()`
- **Component:** `AdminPatientsComponent`
- **Auth:** ✅ ADMIN role

### GET /api/admin/doctors
- **Service Method:** `ApiService.getAllDoctors()`
- **Component:** `AdminDoctorsComponent`
- **Auth:** ✅ ADMIN role

### GET /api/admin/fraud-reports
- **Service Method:** `ApiService.getAllFraudReports()`
- **Component:** `AdminFraudReportsComponent`
- **Auth:** ✅ ADMIN role

### PATCH /api/admin/fraud-reports/{id}/review | resolve
- **Service Methods:** `reviewFraudReport()`, `resolveFraudReport()`
- **Component:** `AdminFraudReportsComponent`
- **Auth:** ✅ ADMIN role
