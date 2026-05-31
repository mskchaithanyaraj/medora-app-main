# MEDORA — BACKEND INTERVIEW PREPARATION HANDBOOK (Part 2)

---

# 7. BUSINESS LOGIC DEEP DIVES

## 7.1 Slot Booking System & Cron Job Scheduling

The slot scheduling system is one of the core features of the Medora platform. It is managed by `SlotService` and `SlotServiceImpl`, utilizing both synchronous REST endpoints and automated daily scheduling.

### How Slots are Modeled
Slots are represented by the `Slot` entity. Instead of storing a separate row for each individual hourly slot, slots are grouped by day and doctor into a single record. 
- A single `Slot` record contains the doctor reference, a `date`, and five slots representing different parts of the day: `MORNING`, `PRE_NOON`, `AFTER_NOON`, `EVENING`, and `NIGHT`.
- The status of each time slot is stored as a `SlotStatus` enum: `AVAILABLE` or `BOOKED`.

### Daily Scheduling (`maintainSlotWindow`)
A daily cron job runs at midnight to maintain a rolling 30-day slot window for all approved doctors in the system.

```java
@Scheduled(cron = "0 0 0 * * ?")
public void maintainSlotWindow() {
    LocalDate today = LocalDate.now();
    List<DoctorDTO> doctors = doctorService.getAllDoctors();

    for (DoctorDTO doctor : doctors) {
        Long doctorId = doctor.getId();

        // 1. Delete yesterday's slot record to clean up historical data
        LocalDate yesterday = today.minusDays(1);
        slotRepository.deleteByDoctorIdAndDate(doctorId, yesterday);

        // 2. Add a slot record for the 30th day in the future (today + 29 days)
        LocalDate newDay = today.plusDays(29);
        boolean exists = slotRepository.findByDoctorIdAndDate(doctorId, newDay).isPresent();

        if (!exists) {
            Slot newSlot = new Slot();
            newSlot.setDoctor(doctorMapper.mapToEntity(doctor));
            newSlot.setDate(newDay);
            newSlot.setMorning(SlotStatus.AVAILABLE);
            newSlot.setPreNoon(SlotStatus.AVAILABLE);
            newSlot.setAfterNoon(SlotStatus.AVAILABLE);
            newSlot.setEvening(SlotStatus.AVAILABLE);
            newSlot.setNight(SlotStatus.AVAILABLE);
            saveSlot(newSlot);
        }
    }
}
```

### Booking Flow & Race Condition Mitigation
When a patient attempts to book an appointment, the system must reserve the slot atomically to prevent double bookings.
1. The client sends a request to book a specific `SlotType` on a given `LocalDate` for a `doctorId`.
2. `SlotServiceImpl.bookSlot()` is invoked:
   - It queries the `Slot` entity for that doctor and date. If no slot record exists, it throws an exception.
   - It checks if the requested time slot (e.g., `MORNING`) is `AVAILABLE`.
   - If `AVAILABLE`, it changes the status to `BOOKED` and saves the entity.
   - If already `BOOKED`, it returns `null`.
3. `AppointmentServiceImpl.bookAppointment()` evaluates the result of the booking:
   - If the slot booking succeeded (returned slot is not null), the appointment is created with `BookingStatus.BOOKED`.
   - If the slot booking failed (returned null because another patient booked it just milliseconds prior), the system defaults to adding the patient to a queue by setting `BookingStatus.WAITING_LIST`.

---

## 7.2 Hospital & Doctor Lifecycle Transitions

To maintain quality and safety in the platform, doctors and hospitals cannot log in immediately after registration. They must go through a formal vetting process.

### Lifecycle Status Map
The verification lifecycle is governed by the `AuthStatus` enum:
`PENDING` → `APPROVED` / `REJECTED` → `SUSPENDED` / `FRAUD`

```
  Registration
       │
       ▼
 ┌───────────┐         Admin/Hospital rejects
 │  PENDING  ├─────────────────────────────────┐
 └─────┬─────┘                                 │
       │ Admin/Hospital approves               │
       ▼                                       ▼
 ┌───────────┐                           ┌───────────┐
 │ APPROVED  │                           │ REJECTED  │
 └─────┬─────┘                           └───────────┘
       │ Admin suspends / flags fraud
       ├────────────────────────┐
       ▼                        ▼
 ┌───────────┐            ┌───────────┐
 │ SUSPENDED │            │   FRAUD   │
 └───────────┘            └───────────┘
```

### Business Rules
1. **Hospital Approval (Admin Action):**
   - Administrators review pending hospitals via `AdminController`.
   - Approving updates `AuthStatus` to `APPROVED`.
   - Rejecting, suspending, or flagging as fraud requires a `rejectionReason` string which is stored in the `Hospital` entity.
2. **Doctor Approval (Hospital Action):**
   - Doctors register by specifying a hospital name.
   - The corresponding hospital verifies the doctor's credentials (license number, qualifications).
   - The hospital logs into their dashboard and approves the doctor, changing the status from `PENDING` to `APPROVED`.
   - If rejected, the hospital supplies a reason.
3. **Login Enforcement:**
   - During `AuthService.login()`, the system retrieves the user's role.
   - If the role is `HOSPITAL` or `DOCTOR`, it queries the respective profile.
   - If the `AuthStatus` is anything other than `APPROVED`, a `UserNotApprovedException` is thrown, blocking JWT generation.

---

## 7.3 Patient Queries & Support Tickets

The system supports a support query-and-reply loop enabling patients to seek advice and receive responses from medical staff or administrators.
- **Query Entity:** Created by patients. Contains a relationship to the `Patient` and a list of `Reply` objects.
- **Reply Entity:** Created by staff members (Doctors, Hospitals, Admins). It holds a reference to the parent `Query` and the `User` who wrote the reply.
- **Circular Reference Prevention:** To prevent Jackson from entering an infinite loop when converting the `Query` and `Reply` relationships to JSON, the `ReplyDTO` class applies `@JsonIgnore` to the `query` field, breaking the serialization loop.

---

# 8. CONTROLLER-BY-CONTROLLER DETAILED ANALYSIS

The Medora backend exposes REST controllers divided by role, using Spring Security to restrict access.

### 8.1 AuthController (`/api`)
- **Endpoints:**
  - `POST /register`: Registers a new user. Calls `AuthService.register()`. Unsecured.
  - `POST /login`: Authenticates credentials. Returns JWT. Unsecured.
  - `POST /logout`: Invalidates session. Requires authentication.
- **Role Constraints:** None (public access for login/register).

### 8.2 AdminController (`/api/admin`)
- **Endpoints:**
  - `GET /hospitals`, `GET /hospitals/pending`: View all or pending hospitals.
  - `PATCH /hospitals/{id}/approve`: Approves a hospital registration.
  - `PATCH /hospitals/{id}/reject`: Rejects a hospital (requires reason).
  - `PATCH /hospitals/{id}/suspend`: Suspends an active hospital.
  - `PATCH /hospitals/{id}/fraud`: Flags a hospital as fraudulent.
  - `GET /doctors`, `GET /patients`: List doctors and patients.
  - `GET /fraud-reports`: Monitor submitted fraud reports.
- **Role Constraints:** `@PreAuthorize("hasAuthority('ADMIN')")` applied globally at class level.

### 8.3 HospitalController (`/api/hospital`)
- **Endpoints:**
  - `GET /profile`, `PUT /profile`: Manage hospital profile.
  - `PATCH /password`: Update credentials.
  - `GET /doctors`, `GET /doctors/pending`: Review doctors belonging to this hospital.
  - `PATCH /doctors/{id}/approve`: Approve a doctor's credential request.
  - `PATCH /doctors/{id}/reject`, `PATCH /doctors/{id}/suspend`, `PATCH /doctors/{id}/fraud`: Change doctor auth status.
  - `GET /appointments`: View appointments booked at this hospital's doctors.
- **Role Constraints:** `@PreAuthorize("hasAuthority('HOSPITAL')")` at class level.

### 8.4 DoctorController (`/api/doctor`)
- **Endpoints:**
  - `GET /profile`, `PUT /profile`: Manage doctor profile.
  - `PATCH /password`: Update credentials.
  - `POST /{id}/slots`: Triggers slot initialization (provides 30 days of slots).
  - `GET /appointments`: List doctor's appointments.
  - `POST /appointments/{id}/prescriptions`: Create a patient prescription.
  - `PUT /prescriptions/{id}`, `DELETE /prescriptions/{id}`: Modify prescriptions.
- **Role Constraints:** `@PreAuthorize("hasAuthority('DOCTOR')")` at class level.

### 8.5 PatientController (`/api/patient`)
- **Endpoints:**
  - `GET /profile`, `PUT /profile`: Manage patient profile.
  - `PATCH /password`: Update credentials.
  - `GET /doctors`: View approved doctors in the network.
  - `GET /doctors/{doctorId}/slots/{date}`: Check slot availability.
  - `POST /doctors/{doctorId}/appointments`: Book a slot.
  - `PATCH /appointments/{id}`: Cancel an appointment (frees the slot).
  - `POST /doctors/{doctorId}/fraud-reports`: File a report against a doctor.
  - `POST /queries`, `DELETE /queries/{id}`: Manage support queries.
- **Role Constraints:** `@PreAuthorize("hasAuthority('PATIENT')")` at class level.

---

# 9. BACKEND INTERVIEW QUESTIONS

## Spring Boot & Core Java

**Q1: What does `@SpringBootApplication` do under the hood?**
> "It is a convenience annotation that wraps three core annotations: `@Configuration` (defines bean configurations), `@EnableAutoConfiguration` (tells Spring Boot to configure beans based on dependencies in the classpath), and `@ComponentScan` (directs Spring to scan the current package and sub-packages for components, services, and controllers)."

**Q2: How do you handle exceptions globally in Spring Boot?**
> "We use a `@RestControllerAdvice` class (`GlobalExceptionHandler`). We define methods annotated with `@ExceptionHandler` for specific exceptions, such as `UserNotFoundException` or `UserAlreadyExistsException`. These methods intercept the exceptions thrown by services and return a standardized JSON payload using a custom `ErrorResponse` class alongside appropriate HTTP status codes (e.g., 404 NOT FOUND, 226 IM USED)."

**Q3: What is the purpose of using DTOs and how do you map them?**
> "DTOs (Data Transfer Objects) isolate the database entity model from the REST API layer, preventing sensitive fields like passwords or internal structure from leaking. We use MapStruct to generate mapper implementations at compile time. Annotating our mapper interfaces with `@Mapper(componentModel = "spring")` registers them as Spring beans, enabling dependency injection."

---

## Spring Security & JWT

**Q4: Explain the OncePerRequestFilter and why you used it.**
> "Spring Security's filter chain can invoke certain filters multiple times per request due to forwards or servlet dispatches. By extending `OncePerRequestFilter` for our `JWTFilter`, we guarantee that the authentication logic runs exactly once for each incoming HTTP request, optimizing performance and preventing redundant token validation."

**Q5: Where are the roles and security authorities stored?**
> "In our implementation, roles are stored in the database. The JWT payload contains only the user's username. When a request is authenticated via `JWTFilter`, the system extracts the username and calls `UserDetailsService.loadUserByUsername()` to fetch the user's roles from the database. This pattern ensures that any changes to user roles take effect immediately, without needing to invalidate or reissue tokens."

---

## JPA / Hibernate

**Q6: What is `@MapsId` and how does it benefit database design?**
> "The `@MapsId` annotation is used in one-to-one relationships to indicate that the child entity (like `Patient` or `Doctor`) shares the same primary key as the parent entity (`User`). This ensures that the primary key of the child table acts as a foreign key pointing to the parent table. It removes the overhead of maintaining an auto-incrementing ID column in the child table and strictly enforces the one-to-one mapping."

**Q7: How does JPA handle entity updates and timestamps?**
> "We use JPA lifecycle callbacks. The `@PrePersist` and `@PreUpdate` annotations are applied to helper methods inside our entities to automatically assign values to audit fields like `createdAt` and `updatedAt` before Hibernate executes INSERT or UPDATE statements in the database."

---

# 10. BACKEND STORYTELLING

## 10.1 Explain Backend in 2 Minutes

> "The Medora backend is constructed using Spring Boot 3.5 and Java 21, with MySQL as the persistent database. The architecture is split into controllers, services, repositories, and compile-time MapStruct mappers.
>
> Security is handled by Spring Security and JWT. Upon registration, patients are immediately authenticated, while doctors and hospitals are registered with a `PENDING` status. These profiles must be reviewed and approved by administrators or parent hospitals before they can log in.
>
> We use standard JPA relations like `@OneToOne` with `@MapsId` to share primary keys across authentication profiles, preventing redundant key generation. A core component is our slot booking service, which leverages Spring's `@Scheduled` annotation to run a daily midnight cleanup, maintaining a rolling 30-day booking window for approved medical professionals."

## 10.2 Explain Challenges & Technical Resolutions

> "One of the key challenges we faced was mitigating race conditions when multiple patients attempted to book the exact same time slot simultaneously.
>
> To resolve this, we designed the slot booking database operation to verify availability atomically. If `SlotServiceImpl.bookSlot()` detects that a slot has already changed status to `BOOKED`, it immediately returns a null indicator. The calling service then changes the target booking status to `WAITING_LIST` rather than failing the transaction.
> 
> Another challenge was preventing infinite recursion when serializing bi-directional relationships between the `Query` support ticket and the `Reply` replies. We solved this clean by configuring the mapping DTOs with `@JsonIgnore` on the child reference, ensuring the JSON payload is cleanly formatted without cyclical depth."
