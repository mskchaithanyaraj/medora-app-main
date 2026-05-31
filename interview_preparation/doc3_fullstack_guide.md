# MEDORA — FULL STACK INTERVIEW MASTER GUIDE

---

# 1. FULL STACK END-TO-END FLOWS

## 1.1 Complete Appointment Booking Flow

```
  ┌───────────────┐                  ┌────────────────┐                  ┌────────────────┐
  │ PATIENT VIEW  │                  │  API SERVICE   │                  │ AUTH INTERCEPT │
  │ (Angular UI)  │                  │ (api.service)  │                  │ (interceptor)  │
  └───────┬───────┘                  └───────┬────────┘                  └───────┬────────┘
          │                                  │                                   │
          │ 1. Select doctor, date, slot     │                                   │
          ├─────────────────────────────────→│                                   │
          │                                  │ 2. Append Bearer JWT              │
          │                                  ├──────────────────────────────────→│
          │                                  │                                   │ 3. Forward request
          │                                  │                                   ├───────────────────┐
          │                                  │                                   │                   │
          │                                  │                                   │                   ▼
  ┌───────▼───────┐                  ┌───────▼────────┐                  ┌───────▼────────┐   ┌──────────────┐
  │  CONTROLLER   │                  │    SERVICE     │                  │  REPOSITORY    │   │   DATABASE   │
  │ (backend App) │                  │ (impl service) │                  │  (Spring Data) │   │   (MySQL)    │
  └───────┬───────┘                  └───────┬────────┘                  └───────┬────────┘   └───────┬──────┘
          │                                  │                                   │                    │
          │ 4. Read request details          │                                   │                    │
          │    & identify patient            │                                   │                    │
          ├─────────────────────────────────→│                                   │                    │
          │                                  │ 5. Atomically update slot status  │                    │
          │                                  ├──────────────────────────────────→│                    │
          │                                  │                                   │ 6. Run SQL UPDATE  │
          │                                  │                                   ├───────────────────→│
          │                                  │                                   │                    │
          │                                  │ 7. Return slot status             │                    │
          │                                  │←──────────────────────────────────┤                    │
          │                                  │                                   │                    │
          │                                  │ 8. Save Appointment record        │                    │
          │                                  ├──────────────────────────────────→│                    │
          │                                  │                                   │ 9. Run SQL INSERT  │
          │                                  │                                   ├───────────────────→│
          │                                  │                                   │                    │
          │                                  │ 10. Map Entity to DTO             │                    │
          │                                  ├───────────────┐                   │                    │
          │                                  │               │                   │                    │
          │                                  │◄──────────────┘                   │                    │
          │                                  │                                   │                    │
          │ 11. Send JSON Response           │                                   │                    │
          │←─────────────────────────────────┤                                   │                    │
          │                                  │                                   │                    │
```

### End-to-End Details
1. **Frontend Input:** The patient uses the booking UI to select a doctor, select a date (up to 30 days in the future), and pick a slot (e.g., `MORNING`).
2. **REST API Call:** `BookAppointmentComponent` calls `apiService.bookAppointment(doctorId, data)`.
3. **HTTP Interceptor:** The `authInterceptor` intercepts the request, reads the token from the `UserService` signal, and injects `Authorization: Bearer <token>` into the headers.
4. **Backend Security Verification:** The request hits `JWTFilter`. The token is parsed, and the user is authenticated in Spring Security's `SecurityContext`.
5. **Controller Layer:** `PatientController.bookAppointment()` catches the request and delegates to `AppointmentService.bookAppointment()`.
6. **Business Logic & Race Condition Handling:**
   - The system retrieves the logged-in patient's profile from the database.
   - It invokes `SlotService.bookSlot()`. This queries the `Slot` table for the doctor and date.
   - Using synchronous execution, the system checks the target slot status. If `AVAILABLE`, it updates the status to `BOOKED` and saves it. If already `BOOKED`, it returns null.
   - If the slot booking is successful, the appointment status is marked as `BOOKED`. If the slot booking fails (e.g., due to a race condition where another user booked the slot a split-second earlier), the status defaults to `WAITING_LIST`.
7. **Mapping and DB Commit:** The appointment entity is saved in the database. MapStruct maps the new `Appointment` entity to an `AppointmentDTO`.
8. **UI State Update:** The backend returns the `AppointmentDTO` as JSON. The frontend dashboard updates, displaying a success toast if the booking was confirmed, or a warning if the patient was placed on the waiting list.

---

# 2. DESIGN PATTERNS & SOLID PRINCIPLES

The Medora codebase incorporates several standard software engineering design patterns and principles:

## 2.1 Design Patterns

- **Data Transfer Object (DTO) Pattern:** Prevents direct exposure of persistent JPA entities to client APIs. This keeps the database model decoupled from the REST contract, enabling API versioning and field-level validation without database schema changes.
- **Mapper Pattern (MapStruct):** MapStruct automates DTO-to-Entity conversion at compile time. This eliminates tedious setter/getter boilerplate code and ensures type safety with zero runtime performance overhead.
- **Repository Pattern (Spring Data JPA):** Isolates data access logic by abstracting SQL operations. The application interacts with repositories through high-level methods (e.g., `findByDoctorIdAndDate`), leaving query generation to Hibernate.
- **Singleton Pattern:** Spring Boot services and controllers are registered as singletons, ensuring single-instance resource sharing (such as connection configurations). Similarly, Angular services are marked with `providedIn: 'root'` to share application state globally.
- **Interceptor Pattern:** Implemented globally on the frontend (`authInterceptor`) to automatically attach authorization tokens and catch session expiry errors (401), and on the backend (`JWTFilter`) to inspect incoming requests.

## 2.2 SOLID Principles

- **Single Responsibility Principle (SRP):** Controllers handle HTTP request/response routing, services contain business logic, and repositories handle database operations. On the frontend, `UserService` only tracks authentication status, while `ApiService` handles HTTP requests.
- **Open/Closed Principle (OCP):** Service contracts are defined using interfaces. If a business workflow changes (e.g., adding a third-party notification system), developers can create a new implementation of the interface without modifying existing controllers.
- **Liskov Substitution Principle (LSP):** We inject interfaces (e.g., `DoctorService`) into controllers rather than concrete implementations (e.g., `DoctorServiceImpl`). Any valid implementation of the interface can be swapped in without breaking execution.
- **Interface Segregation Principle (ISP):** Angular components inject only the specific services they require. For instance, profile pages inject `UserService` for credentials but omit the larger `ApiService` if no external database operations are needed.
- **Dependency Inversion Principle (DIP):** Both Spring Boot and Angular rely on Dependency Injection (DI) frameworks. High-level modules do not instantiate low-level components directly; instead, the framework injects them at runtime.

---

# 3. SCALABILITY, SECURITY, & PRODUCTION READINESS

To transition the Medora project from a development environment to an enterprise-grade production deployment, several key adjustments must be made:

## 3.1 Database Connection Pooling & Performance Tuning
- **HikariCP Tuning:** Configure connection pool settings in `application.properties` to optimize performance:
  ```properties
  spring.datasource.hikari.maximum-pool-size=20
  spring.datasource.hikari.minimum-idle=5
  spring.datasource.hikari.idle-timeout=300000
  spring.datasource.hikari.connection-timeout=20000
  ```
- **Database Indexing:** Add indexes to high-frequency query columns in the database schema:
  - `idx_appointment_date_status` on `appointment (appointment_date, booking_status)`
  - `idx_slot_doctor_date` on `slot (doctor_id, date)`
  - `idx_user_username` on `user (username)`

## 3.2 Secure Production Configuration
- **JWT Key Management:** Replace random runtime key generation with a static, secure key loaded from an environment variable:
  ```java
  // In JWTService.java
  @Value("${security.jwt.secret-key}")
  private String secretKey;
  ```
- **HTTPS Enforcement:** Configure Tomcat to enforce SSL/TLS, and set cookie attributes to `Secure` and `HttpOnly` on the frontend interceptors.

## 3.3 Horizontal Scaling & Session Management
- **Stateless Architecture:** Spring Boot instances are stateless by default. However, to support horizontal scaling behind a load balancer, scheduled tasks (such as the daily slot scheduling cron job) must be synchronized across instances using tools like **ShedLock** to prevent duplicate runs.
- **Distributed Cache:** Integrate **Redis** to cache available doctor lists and appointment slots, reducing the load on the primary MySQL database.

---

# 4. TOP 50 INTERVIEW QUESTIONS (MASTER LIST)

## 4.1 Angular 21 Questions

**Q1: What are Angular Standalone Components?**
> "Standalone components are self-contained building blocks in Angular that define their dependencies directly inside their `@Component` imports array, bypassing the need for traditional `@NgModule` declarations."

**Q2: How do Angular Signals work?**
> "Signals are reactive values that keep track of where they are read. When a signal's value changes, Angular automatically updates the dependent components and templates. They are synchronous and do not require manual unsubscribe calls."

**Q3: What is the difference between `signal` and `computed` in Angular?**
> "`signal` creates a writeable value that can be modified using `.set()` or `.update()`. `computed` creates a read-only derived value that automatically recalculates whenever any of the signals read inside it change."

**Q4: How do you handle lazy loading in Angular 21 routing?**
> "We use the `loadComponent` property within the route definition and pass a dynamic import function: `loadComponent: () => import('./page.component').then(m => m.PageComponent)`."

**Q5: What is the purpose of an HTTP Interceptor in Angular?**
> "Interceptors act as middleware for outgoing HTTP requests. In Medora, the interceptor automatically appends the JWT bearer token to the headers and redirects the user to the login screen if a 401 Unauthorized status is returned."

**Q6: What are functional guards in Angular?**
> "Introduced in Angular 15, functional guards are plain JavaScript functions defined as `CanActivateFn` that use the `inject()` function to fetch services. They replace older class-based guards that implemented routing interfaces."

**Q7: Explain the `inject()` function in Angular.**
> "The `inject()` function provides a way to resolve dependencies dynamically within components, directives, or guards outside of the standard class constructor. This results in cleaner code, especially for functional guards and interceptors."

**Q8: How do you pass data from a parent component to a child in Angular 21?**
> "We use the new Signal-based input API: `myProperty = input<string>()` in the child component. The parent passes the value via standard property binding: `[myProperty]="value"`."

**Q9: How do you emit events from a child component to a parent?**
> "We use the new `output()` function: `myEvent = output<void>()`. The child triggers it by calling `this.myEvent.emit()`, and the parent template binds to it with event syntax: `(myEvent)="handleEvent()"`."

**Q10: Why did you use template-driven forms over reactive forms in this project?**
> "For simple forms like registration and login, template-driven forms with standard `[(ngModel)]` binding are lightweight, require less boilerplate code, and are easy to maintain."

**Q11: How do you check if a route guard is running on the server or the client during SSR?**
> "We use Angular's platform checking utilities: `isPlatformBrowser(platformId)` or `isPlatformServer(platformId)` to safely execute browser-only logic (such as accessing `localStorage`) only on the client side."

**Q12: What is the difference between RxJS Observables and Angular Signals?**
> "Observables are asynchronous, push-based streams that require subscriptions and are ideal for handling events over time (such as HTTP requests). Signals are synchronous, pull-based reactive state holders designed to optimize change detection."

**Q13: How do you optimize initial page load performance in Angular?**
> "By utilizing route-based lazy loading, optimizing static assets, enabling SSR (Server-Side Rendering) for faster initial paints, and keeping third-party dependencies lightweight."

**Q14: What does `provideClientHydration()` do?**
> "It enables hydration on the client side, allowing the Angular application to reuse the HTML pre-rendered on the server without recreating all DOM nodes from scratch, preventing UI flicker."

**Q15: How does Medora handle application alerts and notifications?**
> "We created a centralized `ToastService` that exposes a read-only signal containing an array of active alerts. Components trigger success or error messages, which are displayed dynamically by a global `ToastComponent`."

---

## 4.2 Spring Boot Questions

**Q16: Explain Spring Boot's dependency injection container.**
> "The Spring Inversion of Control (IoC) container manages the lifecycle of application objects, known as beans. It instantiates, configures, and injects dependencies at startup, reducing tight coupling between components."

**Q17: What is the difference between `@Component`, `@Service`, and `@Repository`?**
> "`@Component` is a generic stereotype annotation for any Spring-managed bean. `@Service` and `@Repository` are specialized stereotypes for the business logic and database access layers, respectively, with `@Repository` enabling automatic DB exception translation."

**Q18: How does `@Autowired` compare to Constructor Injection?**
> "Constructor injection is preferred because it enforces class immutability (by allowing fields to be marked as `final`), makes dependencies explicit, and simplifies unit testing by allowing developers to pass mocks manually."

**Q19: What is Spring Data JPA?**
> "It is a specification wrapper that simplifies data access by generating repository implementations at runtime based on method names defined in interface contracts, reducing the need for raw boilerplate SQL."

**Q20: How do you define custom queries in Spring Data JPA?**
> "We can write JPQL or native SQL queries using the `@Query` annotation over repository methods, or write derived queries directly using Spring Data method-naming patterns."

**Q21: What is Hibernate and what is its role in Spring Boot?**
> "Hibernate is an Object-Relational Mapping (ORM) framework that acts as the default provider for JPA specifications in Spring Boot. It translates Java object operations into relational SQL queries."

**Q22: Explain the Hibernate N+1 query problem.**
> "It occurs when the application fetches a list of parent entities (1 query) and then executes a separate query for each parent to retrieve its child relationships (N queries). It can be resolved by using join fetches or entity graphs."

**Q23: What is the difference between `@OneToOne` and `@ManyToOne`?**
> "`@OneToOne` defines a strict direct pairing between two entities. `@ManyToOne` indicates that multiple records of the source entity can reference a single target entity."

**Q24: How does `@MapsId` work in JPA mappings?**
> "It maps a one-to-one relationship by configuring the child entity to share the primary key of its parent entity. This simplifies the schema by avoiding redundant primary key columns and foreign key indexes."

**Q25: What is the function of the `@PrePersist` annotation?**
> "It designates a callback method within an entity that executes immediately before the record is saved to the database, which we use to assign default creation timestamps."

**Q26: What is MapStruct and why is it preferred over reflection-based mappers?**
> "MapStruct is an annotation processor that generates Java mapping code at compile time. Because it uses plain method calls instead of reflection, it is extremely fast and type-safe."

**Q27: How does Spring Boot's `@RestControllerAdvice` work?**
> "It intercept exceptions thrown by any controller method globally, allowing developers to define centralized error-handling strategies and return standardized JSON error payloads."

**Q28: What is the default scope of a Spring bean?**
> "The default scope is Singleton, meaning Spring creates a single shared instance of the bean within the application context."

**Q29: How do you run background tasks in Spring Boot?**
> "By enabling scheduling via `@EnableScheduling` and annotating service methods with `@Scheduled`, passing cron expressions or fixed intervals."

**Q30: How does Spring Boot connect to database profiles?**
> "It reads the configuration profiles defined in `application.properties` or `application.yml`, allowing developers to switch database sources dynamically based on target profiles."

---

## 4.3 Security & JWT Questions

**Q31: What is Role-Based Access Control (RBAC)?**
> "RBAC is an authorization model that grants permissions based on user roles (such as PATIENT, DOCTOR, or ADMIN), restricting access to specific endpoints or features."

**Q32: How is RBAC enforced in the backend?**
> "By defining request matchers in `SecurityConfig` (e.g., `.requestMatchers("/api/admin/**").hasAuthority("ADMIN")`) and using `@PreAuthorize` annotations on controllers."

**Q33: How does JWT authentication work?**
> "The client logs in with credentials. The server validates them and generates a signed JWT token. The client stores this token and sends it in the Authorization header of subsequent requests, allowing the server to authenticate requests without sessions."

**Q34: What is the role of the `JWTFilter` in Spring Security?**
> "It intercepts incoming requests, extracts the JWT token from the Authorization header, validates the signature, extracts the user details, and registers the user in Spring's SecurityContext."

**Q35: Why do we extend `OncePerRequestFilter` for JWT validation?**
> "It guarantees that the filter logic runs exactly once for each request, preventing duplicate execution during internal forwards or servlet dispatches."

**Q36: Where does Spring Security store authentication details during a request?**
> "Within the `SecurityContextHolder`, which wraps a ThreadLocal context containing the current user's principal, credentials, and authorities."

**Q37: Why do we hash passwords and which algorithm do we use?**
> "To protect passwords in the database. We use BCrypt, which incorporates a salt automatically to prevent rainbow table attacks."

**Q38: What is CORS and how is it configured in Medora?**
> "Cross-Origin Resource Sharing is a browser security mechanism. We configure it in `CorsConfig` to allow the Angular frontend origin (`localhost:4200`) to request resources from the backend API."

**Q39: What is CSRF and why is it disabled in Medora?**
> "Cross-Site Request Forgery is an attack vector exploiting session cookies. Since Medora uses stateless JWT tokens instead of cookies for session tracking, it is not vulnerable to CSRF, allowing us to disable it."

**Q40: How do you invalidate a JWT token on logout?**
> "Since JWT is stateless, the server cannot invalidate it directly. The client discards the token locally. For high-security applications, we can blacklist logged-out tokens in Redis until they expire."

---

## 4.4 Database & System Integration Questions

**Q41: What database is used in Medora?**
> "We use MySQL, a reliable relational database, along with Spring Data JPA and Hibernate for database integration."

**Q42: What is the purpose of database transactions?**
> "Transactions group database operations into a single execution unit, guaranteeing ACID compliance (Atomicity, Consistency, Isolation, Durability) to prevent data corruption."

**Q43: How do you handle race conditions in database entries?**
> "By using database lock mechanisms, such as pessimistic locking for high-concurrency environments, or optimistic locking with `@Version` columns."

**Q44: What is the difference between Lazy and Eager loading?**
> "Eager loading retrieves related entities immediately alongside the parent record. Lazy loading defers retrieval until the child relationship is explicitly accessed, saving memory and query time."

**Q45: Why is `@JsonIgnore` used in our entities?**
> "It prevents infinite recursion during JSON serialization of bi-directional relationships (such as Query and Reply) by directing Jackson to skip the mapped relationship field."

**Q46: How are database schemas generated in Medora?**
> "During development, Hibernate generates and updates tables automatically based on JPA annotations via the `spring.jpa.hibernate.ddl-auto=update` property."

**Q47: How does Medora handle soft deletes?**
> "By adding an active status flag to entities (such as user accounts) and filtering query results based on this status, keeping historical data intact."

**Q48: How do you configure environment variables in Spring Boot?**
> "Using libraries like `dotenv-java` to load variable configurations from a `.env` file on startup and mapping them to application properties."

**Q49: How would you debug an HTTP 500 Error in this application?**
> "I would trace the stack trace in the backend console logs, identify the originating method, check database constraint violations, and inspect the payload sent by the frontend."

**Q50: How do you implement search filtering in the backend?**
> "By writing custom query methods in the repository that use database wildcard parameters (such as `LIKE %query%`) to filter records."

---

# 5. 1-DAY & 2-HOUR REVISION QUICK GUIDES

## 5.1 The 1-Day Study Plan

### Morning (09:00 - 12:00): Architecture & Database Relationships
- Review the structural layout of the Angular standalone app and Spring Boot package directories.
- Memorize the database schema and entity relationships (User ↔ Patient/Doctor/Hospital using `@MapsId`).

### Afternoon (13:00 - 17:00): Deep Dive into Core Workflows
- Trace the authentication lifecycle, focusing on how JWT tokens are generated, validated, and attached to requests.
- Revisit the appointment booking mechanism and analyze how slots are updated and race conditions are mitigated.

### Evening (18:00 - 21:00): Core Concepts & Interview Practice
- Go through the Spring Boot annotations and Angular concepts master guides.
- Practice answering the Top 50 questions, focusing on explaining backend processes and state management.

---

## 5.2 The 2-Hour Quick Refresh

### Minutes 00 - 30: System Overview & Technical Stack
- Medora is a Healthcare Management System.
- Frontend: Angular 21 (Signals, standalone components, dynamic routing, Tailwind CSS 4).
- Backend: Spring Boot 3.5, Java 21, Spring Security, JWT, JPA, MapStruct, MySQL.

### Minutes 30 - 60: Key Database & Security Concepts
- Enums are saved as strings in the DB.
- Registration creates User and profile records using `@MapsId` (sharing the primary key).
- Only approved doctor/hospital profiles can log in.
- The JWT contains only the username; roles are verified from the database on every request.

### Minutes 60 - 90: Workflow Core Mechanics
- Booking an appointment updates the slot table atomically.
- If booking succeeds, the appointment status is set to `BOOKED`; if it fails, the patient is queued on a `WAITING_LIST`.
- The frontend interceptor attaches the JWT token to requests and manages session expiration.
- A daily cron job runs at midnight to update and maintain the rolling 30-day booking slot window.

### Minutes 90 - 120: Final Q&A Review
- Skim through the Spring annotations table and key Angular concepts.
- Review the core interview questions to ensure confident delivery during the technical discussion.
