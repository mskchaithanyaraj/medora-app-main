# MEDORA — FRONTEND INTERVIEW PREPARATION HANDBOOK (Part 2)

---

# 4. ANGULAR CONCEPTS MASTER GUIDE

## 4.1 Standalone Components

**Definition:** Components that declare their own dependencies via `imports` array instead of belonging to an NgModule.

**Internal Working:** Angular compiler resolves dependencies at the component level. No need for `NgModule` declarations.

**Why Used:** Angular 21 default. Simpler, tree-shakable, no module boilerplate.

**Project Usage:** EVERY component in Medora is standalone:
```typescript
@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login.component.html'
})
```

**Interview Answer:** "All our components are standalone — the Angular 21 default. Each component declares its own imports. This eliminates NgModule complexity and enables better tree-shaking since unused components aren't bundled."

---

## 4.2 Angular Signals

**Definition:** Reactive primitives that notify consumers when their value changes. Introduced in Angular 16, mature in Angular 21.

**Internal Working:** Unlike RxJS Observables, Signals are synchronous and pull-based. Angular's change detection reads signal values directly.

**Why Used:** Simpler than BehaviorSubject, no subscribe/unsubscribe, automatic template updates.

**Project Usage (UserService):**
```typescript
private currentUserSignal = signal<CurrentUser | null>(this.loadFromStorage());
readonly isLoggedIn = computed(() => {
  const user = this.currentUserSignal();
  if (!user) return false;
  return user.expiresAt > Date.now();
});
readonly isPatient = computed(() => this.hasRole('PATIENT'));
```

**Project Usage (ToastService):**
```typescript
private toastsSignal = signal<Toast[]>([]);
readonly toasts = this.toastsSignal.asReadonly();
// Update: this.toastsSignal.update(toasts => [...toasts, toast]);
```

**Project Usage (Components):**
```typescript
isLoading = signal(false);
doctors = signal<Doctor[]>([]);
selectedFilter = signal<BookingStatus | 'ALL'>('ALL');
```

**Interview Answer:** "We use Angular Signals extensively for state management. In `UserService`, the current user is a signal. Computed signals like `isLoggedIn`, `isPatient`, `isDoctor` automatically derive from it. In components, we use `signal()` for loading states, data lists, and UI toggles. This eliminates manual subscription management."

---

## 4.3 Angular Router & Lazy Loading

**Definition:** Angular's built-in navigation system with code-splitting support.

**Project Usage:**
```typescript
{
  path: 'patient',
  loadComponent: () => import('./pages/patient/patient-dashboard.component')
    .then(m => m.PatientDashboardComponent),
  canActivate: [authGuard, roleGuard(['PATIENT'])],
  children: [
    { path: '', redirectTo: 'appointments', pathMatch: 'full' },
    {
      path: 'appointments',
      loadComponent: () => import('./pages/patient/appointments/appointments.component')
        .then(m => m.PatientAppointmentsComponent)
    }
  ]
}
```

**Interview Answer:** "We use `loadComponent()` with dynamic imports for lazy loading. Each role's dashboard and all child pages are separate chunks. The default child route uses `redirectTo` so navigating to `/patient` automatically shows `/patient/appointments`."

---

## 4.4 Route Guards (Functional)

**Definition:** Functions that determine if a route can be activated.

**Project Usage (auth.guard.ts):**
```typescript
export const authGuard: CanActivateFn = () => {
  const userService = inject(UserService);
  const router = inject(Router);
  if (userService.isLoggedIn()) return true;
  router.navigate(['/']);
  return false;
};

export const roleGuard = (allowedRoles: UserRole[]): CanActivateFn => {
  return () => {
    const userService = inject(UserService);
    const hasRole = allowedRoles.some(role => userService.roles().includes(role));
    if (hasRole) return true;
    router.navigate([userService.getDashboardRoute()]);
    return false;
  };
};
```

**Interview Answer:** "We use functional guards — the modern Angular pattern. `authGuard` checks if the user is logged in via the signal. `roleGuard` is a higher-order function — it takes allowed roles as parameter and returns a `CanActivateFn`. This is more flexible than class-based guards."

---

## 4.5 HTTP Interceptors (Functional)

**Definition:** Middleware that modifies HTTP requests/responses.

**Project Usage (auth.interceptor.ts):**
```typescript
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const userService = inject(UserService);
  const token = userService.token();
  
  if (token && !isPublicEndpoint) {
    req = req.clone({
      setHeaders: { Authorization: `Bearer ${token}` }
    });
  }
  
  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === 401) {
        authService.logoutLocally();
        router.navigate(['/']);
      }
      return throwError(() => error);
    })
  );
};
```

**Registered in:** `app.config.ts` → `provideHttpClient(withInterceptors([authInterceptor]))`

**Interview Answer:** "Our functional interceptor does three things: (1) reads the JWT from UserService signal, (2) clones the request with the Authorization header, (3) catches 401 errors globally to force logout. It skips auth endpoints so login/register handle their own errors."

---

## 4.6 Dependency Injection

**Project Pattern:** All services use `providedIn: 'root'` (singleton). Components use `inject()` function instead of constructor injection.

```typescript
// Modern pattern used in Medora
private apiService = inject(ApiService);
private toastService = inject(ToastService);
private router = inject(Router);
```

**Interview Answer:** "We use the `inject()` function — cleaner than constructor injection. All services are `providedIn: 'root'` for singleton behavior. The DI container resolves dependencies at runtime."

---

## 4.7 Template-Driven Forms (FormsModule)

**Project Usage:** Login, Register, BookAppointment, CreatePrescription all use `FormsModule` with `[(ngModel)]`.

```typescript
// LoginComponent
loginData = { username: '', password: '', rememberMe: false };

// RegisterComponent
registerData = {
  role: '' as UserRole | '',
  fullName: '', username: '', password: '', confirmPassword: '',
  age: null as number | null, gender: '', phone: '', location: '',
  hospitalName: '', licenceNumber: '', qualification: '',
  experience: null as number | null, address: '', contact: ''
};
```

**Interview Answer:** "We use template-driven forms with `FormsModule` for simpler forms like login and registration. Two-way binding with `[(ngModel)]` keeps the component model in sync with the template."

---

## 4.8 RxJS Operators Used

| Operator | Where Used | Purpose |
|----------|-----------|---------|
| `tap()` | AuthService.login() | Side-effect: store token after login |
| `tap()` | AuthService.logout() | Side-effect: clear user after logout |
| `catchError()` | authInterceptor | Handle 401 errors globally |
| `throwError()` | authInterceptor | Re-throw errors for component handling |
| `pipe()` | All service methods | Chain operators |

**Interview Answer:** "We use RxJS sparingly since Angular Signals handle most reactivity. `tap()` in AuthService for side-effects after login/logout, and `catchError()` in the interceptor for global error handling."

---

## 4.9 Component Communication Patterns

| Pattern | Example | Mechanism |
|---------|---------|-----------|
| Parent → Child | DashboardLayout receives menuItems | `input()` function |
| Child → Parent | LoginComponent emits closeModal | `output()` function |
| Service-based | Any component reads user state | UserService signals |
| Router params | CreatePrescription reads appointmentId | `ActivatedRoute.snapshot.paramMap` |

```typescript
// Child → Parent (LoginComponent)
closeModal = output<void>();
switchToRegister = output<void>();

// Parent → Child (DashboardLayoutComponent)
pageTitle = input<string>('Dashboard');
menuItems = input<MenuItem[]>([]);
```

---

## 4.10 Lifecycle Hooks Used

| Hook | Component | Purpose |
|------|-----------|---------|
| `ngOnInit` | PatientAppointmentsComponent | Load appointments on page load |
| `ngOnInit` | BookAppointmentComponent | Load doctors list |
| `ngOnInit` | AdminHospitalsComponent | Load hospitals |
| `ngOnInit` | PendingApprovalsComponent | Load pending doctors |
| `ngOnInit` | DashboardLayoutComponent | Load saved theme from localStorage |
| `constructor` | CreatePrescriptionComponent | Read route params |

---

## 4.11 Angular SSR

**Configuration:** `app.config.server.ts`, `main.server.ts`, `server.ts`

**Interview Answer:** "We have Angular SSR configured with `@angular/ssr`. The `server.ts` uses Express.js. SSR improves initial load time and SEO. We use `typeof window !== 'undefined'` checks before accessing `localStorage` since it's not available on the server."

---

# 5. THIRD-PARTY LIBRARIES ANALYSIS

## 5.1 Production Dependencies

| Library | Version | Purpose | Why Used |
|---------|---------|---------|----------|
| `@angular/core` | ^21.2.0 | Core framework | Foundation |
| `@angular/router` | ^21.2.0 | Client-side routing | SPA navigation |
| `@angular/forms` | ^21.2.0 | Template-driven forms | Form handling |
| `@angular/common` | ^21.2.0 | Common directives (ngIf, ngFor) | Template logic |
| `@angular/platform-browser` | ^21.2.0 | Browser rendering | DOM interaction |
| `@angular/platform-server` | ^21.2.0 | Server rendering | SSR |
| `@angular/ssr` | ^21.2.11 | SSR utilities | Server-side rendering |
| `@angular/compiler` | ^21.2.0 | JIT compiler | Template compilation |
| `primeng` | ^21.1.8 | UI component library | Rich UI components |
| `@primeng/themes` | ^21.0.4 | PrimeNG theming | Theme customization |
| `@primeuix/themes` | ^2.0.3 | PrimeUI theming | Extended themes |
| `lucide-angular` | ^1.0.0 | Icon library | SVG icons |
| `@lucide/angular` | ^1.16.0 | Lucide Angular wrapper | Icon components |
| `rxjs` | ~7.8.0 | Reactive Extensions | Async operations |
| `date-fns` | ^4.2.1 | Date utility library | Date formatting |
| `express` | ^5.1.0 | Node.js web framework | SSR server |
| `tslib` | ^2.3.0 | TypeScript helpers | Runtime helpers |

## 5.2 Dev Dependencies

| Library | Version | Purpose |
|---------|---------|---------|
| `@angular/build` | ^21.2.11 | Build system (esbuild) |
| `@angular/cli` | ^21.2.11 | CLI tools |
| `@angular/compiler-cli` | ^21.2.0 | AOT compilation |
| `tailwindcss` | ^4.3.0 | Utility-first CSS |
| `@tailwindcss/postcss` | ^4.3.0 | Tailwind PostCSS plugin |
| `postcss` | ^8.5.15 | CSS transformation |
| `prettier` | ^3.8.1 | Code formatting |
| `typescript` | ~5.9.2 | TypeScript compiler |
| `vitest` | ^4.0.8 | Unit testing framework |
| `jsdom` | ^28.0.0 | DOM simulation for tests |

**Key Interview Points:**
- **PrimeNG vs Angular Material:** "We chose PrimeNG for its richer component set and better theming support. It includes DataTable, Dialog, Calendar, and 80+ components out of the box."
- **Vitest vs Jasmine/Karma:** "We use Vitest instead of the traditional Karma+Jasmine. Vitest is faster, uses ESM natively, and has better DX."
- **Tailwind CSS 4:** "Tailwind v4 uses PostCSS-based configuration (`.postcssrc.json`) instead of `tailwind.config.js`. It provides utility classes for rapid styling."
- **date-fns vs Moment.js:** "We use date-fns because it's tree-shakable and immutable, unlike Moment.js which is deprecated and heavy."

---

# 6. AUTHENTICATION FLOW (Detailed)

## 6.1 Registration Flow

```
User selects role (Patient/Doctor/Hospital) on Register modal
  ↓
Fills role-specific form fields
  ↓
RegisterComponent.onSubmit() validates:
  - Passwords match
  - Terms agreed
  ↓
buildRegistrationRequest() constructs payload based on role
  ↓
AuthService.register(request) → POST /api/register
  ↓
Backend creates User + role-specific entity (Patient/Doctor/Hospital)
  ↓
If PATIENT → returns JWT token immediately (auto-login)
If DOCTOR/HOSPITAL → throws UserNotApprovedException
  → Frontend shows "Registration successful! Please login."
  → Switches to Login modal
  ↓
Doctor/Hospital must wait for ADMIN/HOSPITAL approval
```

## 6.2 Login Flow

```
User enters username + password
  ↓
LoginComponent.onSubmit()
  ↓
AuthService.login({username, password})
  ↓
POST /api/login → Backend validates:
  1. User exists?
  2. If HOSPITAL/DOCTOR → AuthStatus === APPROVED?
  3. Password matches (BCrypt)?
  4. Generate JWT token
  ↓
Response: { token, username, roles, expiresIn: 86400 }
  ↓
tap() operator:
  → Create CurrentUser { token, username, roles, expiresAt }
  → UserService.setUser() → signal.set() + localStorage.setItem()
  ↓
Router.navigate(getDashboardRoute())
  → PATIENT → /patient
  → DOCTOR → /doctor
  → HOSPITAL → /hospital
  → ADMIN → /admin
```

## 6.3 Token Expiry Handling

```
User makes any API call
  ↓
authInterceptor reads token from UserService.token() signal
  ↓
Attaches: Authorization: Bearer <token>
  ↓
If backend returns 401:
  → authService.logoutLocally()
  → toastService.error('Session expired. Please login again.')
  → router.navigate(['/'])

Also: UserService.isLoggedIn computed signal checks:
  → user.expiresAt > Date.now()
  → If expired, returns false → guards block access
```

---

# 7. COMPONENT-BY-COMPONENT ANALYSIS

## 7.1 HomeComponent
- **Purpose:** Landing page with hero, features, stats, testimonials
- **Services:** None (static content)
- **Signals:** showLoginModal, showRegisterModal, isDarkMode
- **Children:** LoginComponent, RegisterComponent
- **Interview:** "Landing page using signal-based modal management. Features and testimonials are static arrays."

## 7.2 LoginComponent
- **Purpose:** Login modal
- **Services:** AuthService, UserService, ToastService, Router
- **Inputs:** None
- **Outputs:** `closeModal`, `switchToRegister`
- **Signals:** isLoading
- **API Calls:** POST /api/login
- **Interview:** "Modal component with output events. Uses FormsModule for two-way binding. Loading state prevents double-submit."

## 7.3 RegisterComponent
- **Purpose:** Multi-role registration
- **Services:** ApiService, AuthService, ToastService
- **Outputs:** `closeModal`, `switchToLogin`
- **Signals:** isLoading, showPasswordMismatch, hospitals
- **API Calls:** POST /api/register, GET /api/hospitals (for doctor hospital dropdown)
- **Business Logic:** `buildRegistrationRequest()` dynamically constructs role-specific payload
- **Interview:** "Supports 3 registration types. Dynamically loads hospital names for doctor registration. Uses spread operator to build role-specific requests."

## 7.4 PatientDashboardComponent
- **Purpose:** Patient sidebar + routing shell
- **Services:** UserService, AuthService, ToastService, Router
- **Signals:** isSidebarOpen, isDarkMode
- **Features:** Sidebar toggle, theme toggle, logout, menu navigation
- **Note:** Has its own full template (not using shared DashboardLayoutComponent)

## 7.5 DoctorDashboardComponent / HospitalDashboardComponent / AdminDashboardComponent
- **Purpose:** Role-specific dashboard shells
- **Pattern:** Use shared `DashboardLayoutComponent` with `[menuItems]` input
- **Template:** Inline template with `<app-dashboard-layout>` + `<router-outlet>`

## 7.6 BookAppointmentComponent
- **Purpose:** Multi-step appointment booking
- **Services:** ApiService, ToastService, Router
- **Signals:** isLoading, doctors, loadingDoctors, searchQuery, selectedSlot, loadingSlots
- **API Calls:** GET doctors, GET slots, POST appointment
- **Business Logic:** Doctor search/filter, date range validation (today to +30 days), slot availability checking, WAITING_LIST handling
- **Interview:** "Most complex component. Three-step flow: select doctor → select date (loads slots) → select available time slot → submit. Handles edge case where slot gets booked between check and submit (WAITING_LIST)."

## 7.7 PatientAppointmentsComponent
- **Purpose:** View and manage appointments
- **Services:** ApiService, ToastService
- **Signals:** appointments, isLoading, selectedFilter, searchQuery
- **API Calls:** GET appointments, GET prescriptions (for prescription-exists check), PATCH cancel
- **Business Logic:** Filter by status (ALL/BOOKED/WAITING_LIST/COMPLETED/CANCELLED), search by doctor name, cancel with confirmation

## 7.8 CreatePrescriptionComponent
- **Purpose:** Doctor creates prescription for appointment
- **Services:** ApiService, ToastService, Router, ActivatedRoute
- **Signals:** appointmentId, isLoading
- **API Calls:** POST prescription
- **Route Param:** `:appointmentId` extracted from URL

## 7.9 AdminHospitalsComponent
- **Purpose:** Admin manages hospitals (approve/reject/suspend/fraud)
- **Services:** ApiService, ToastService
- **Signals:** hospitals, loading, selectedStatus, selectedHospital, showModal, searchQuery
- **Computed:** filteredHospitals (by status and search query)
- **API Calls:** GET all hospitals, PATCH approve/reject/suspend/fraud
- **Business Logic:** Reason input for reject/suspend/fraud actions, modal-based details view

## 7.10 PendingApprovalsComponent (Hospital)
- **Purpose:** Hospital approves/rejects pending doctors
- **Services:** ApiService, ToastService
- **Signals:** pendingDoctors, loading, searchQuery
- **API Calls:** GET pending doctors, PATCH approve, PATCH reject
- **Business Logic:** Rejection requires reason, inline rejection form

## 7.11 DashboardLayoutComponent (Shared)
- **Purpose:** Reusable sidebar + header layout
- **Inputs:** `pageTitle`, `menuItems`
- **Services:** UserService, AuthService, ToastService, Router
- **Signals:** isSidebarOpen, isDarkMode
- **Features:** Sidebar toggle, dark mode toggle (persisted in localStorage), logout

## 7.12 ToastComponent
- **Purpose:** Display toast notifications
- **Services:** ToastService
- **Pattern:** Reads `toastService.toasts` signal, renders toast stack

---

# 8. FRONTEND INTERVIEW QUESTIONS

## Basic Questions

**Q1: What is Angular and why did you choose it for Medora?**
> "Angular is a TypeScript-based SPA framework by Google. We chose Angular 21 for its strong typing, built-in DI, robust routing, and enterprise-grade features. The standalone component architecture in v21 eliminated module boilerplate."

**Q2: What are standalone components?**
> "Components that declare their own dependencies via `imports` array. Every component in Medora is standalone — no NgModule needed."

**Q3: How does routing work in your project?**
> "We use Angular Router with lazy loading via `loadComponent()`. Routes are organized by role with child routes. Each parent dashboard has `canActivate` guards for auth + role checking."

**Q4: What is dependency injection?**
> "DI is a design pattern where dependencies are provided by an external container rather than created by the class. We use `inject()` function and `providedIn: 'root'` for singleton services."

## Intermediate Questions

**Q5: Explain your authentication flow.**
> "User logs in → backend returns JWT → `AuthService` stores it via `UserService` signal + localStorage → `authInterceptor` attaches Bearer token to every request → `authGuard` checks `isLoggedIn` signal → on 401, interceptor force-logouts."

**Q6: How do you handle route protection?**
> "Two functional guards: `authGuard` checks login state, `roleGuard` is a higher-order function that takes allowed roles and returns a guard function. Applied via `canActivate` on routes."

**Q7: What are Angular Signals and why did you use them over RxJS?**
> "Signals are synchronous reactive primitives. Unlike Observables, they don't need subscribe/unsubscribe. We use them for UI state (loading, lists, filters) and user state. RxJS is only used for HTTP calls and side-effects."

**Q8: How does lazy loading improve performance?**
> "Each route's component is a separate bundle chunk loaded on demand. So the patient dashboard code isn't loaded until a patient navigates there. This reduces initial bundle size significantly."

## Advanced Questions

**Q9: How would you handle JWT token refresh?**
> "Currently we use long-lived tokens (23 hours). For production, I'd implement a refresh token flow: store refresh token in httpOnly cookie, use an interceptor to detect near-expiry, call a /refresh endpoint, and retry the original request."

**Q10: How would you add real-time notifications?**
> "The backend already has `spring-boot-starter-websocket`. I'd add a WebSocket service in Angular using `WebSocketSubject` from RxJS, connect on login, and push notification signals."

**Q11: Why not use NgRx for state management?**
> "NgRx is overkill for our app size. Angular Signals + a centralized UserService provide sufficient reactivity. The state is simple: current user + per-component data. No complex shared state across unrelated components."

**Q12: How does your interceptor handle concurrent requests during token expiry?**
> "Currently, each 401 triggers a logout. For production, I'd implement a token refresh queue: the first 401 triggers refresh, subsequent requests wait for the new token, then retry."

## Project-Specific Questions

**Q13: How does the appointment booking flow work end-to-end?**
> "Patient selects doctor → picks date → component fetches available slots for that doctor+date → shows 5 time slots (MORNING to NIGHT) with AVAILABLE/BOOKED status → patient selects slot + enters problem → POST to backend → backend books slot + creates appointment → if slot was just booked, returns WAITING_LIST status."

**Q14: How do you handle role-based UI differences?**
> "Four separate dashboards with different child routes. The `roleGuard` prevents cross-role access. Each dashboard has its own menu items. The shared `DashboardLayoutComponent` accepts menu items as input."

**Q15: How does the registration handle different roles?**
> "The RegisterComponent has a role selector. Based on selected role, it shows role-specific form fields. `buildRegistrationRequest()` uses switch-case to construct the correct payload with spread operators."

---

# 9. FRONTEND STORYTELLING

## 9.1 Explain Frontend in 2 Minutes

> "Medora's frontend is built with Angular 21 using standalone components and TypeScript. We have four role-based dashboards — Patient, Doctor, Hospital, and Admin — each lazy-loaded for performance.
>
> Authentication uses JWT tokens stored in localStorage, managed by Angular Signals for reactive state. A functional HTTP interceptor automatically attaches tokens and handles session expiry.
>
> Key features include: appointment booking with real-time slot availability, prescription management, hospital/doctor approval workflows, fraud reporting, and a query system.
>
> We use PrimeNG for UI components, Tailwind CSS for styling, and Lucide for icons. The app supports SSR for SEO and fast initial loads."

## 9.2 Explain Frontend in 5 Minutes

> *Start with the 2-minute version, then add:*
>
> "Let me walk through the architecture. The `core/` module contains singleton services: `AuthService` handles login/register/logout, `UserService` manages user state using Angular Signals — computed signals like `isLoggedIn`, `isPatient`, `isDoctor` automatically derive from the user signal. `ApiService` centralizes all 60+ HTTP calls.
>
> Route protection uses two functional guards: `authGuard` checks login state, `roleGuard` is a higher-order function that accepts allowed roles. The functional interceptor attaches JWT tokens and globally handles 401 errors.
>
> The booking flow is the most complex feature — it's a multi-step process: select approved doctor → pick date → fetch slot availability (5 time slots per day) → book. The backend handles race conditions by returning WAITING_LIST status.
>
> For the admin panel, we implemented hospital lifecycle management: PENDING → APPROVED/REJECTED/SUSPENDED/FRAUD. Similarly, hospitals manage doctor approvals. Each status change requires a reason that's stored in the database.
>
> We also have a query system where patients can raise questions and staff (doctors, hospitals, admins) can reply — like a support ticket system."

## 9.3 Explain Challenges

> "The biggest challenge was designing the slot-based appointment system. We needed to show real-time availability for 5 time slots across 30 days for each doctor, handle concurrent bookings, and provide clear UX. We solved it by fetching slots on date selection and handling the race condition server-side with a WAITING_LIST fallback.
>
> Another challenge was managing authentication state across SSR and client-side. We use `typeof window !== 'undefined'` checks before accessing localStorage since the Node.js server doesn't have window/localStorage."

## 9.4 Explain Optimizations

> "1. **Lazy Loading:** All dashboard pages are lazy-loaded, reducing initial bundle by ~60%.
> 2. **Signals over RxJS:** Using signals for synchronous state eliminates subscription leaks.
> 3. **Computed Signals:** Derived state like `isLoggedIn` is memoized — only recalculated when dependencies change.
> 4. **SSR:** Server-side rendering for faster first contentful paint and SEO.
> 5. **Functional patterns:** Functional guards/interceptors are tree-shakable."
