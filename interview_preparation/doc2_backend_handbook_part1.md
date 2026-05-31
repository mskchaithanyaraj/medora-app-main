# MEDORA — BACKEND INTERVIEW PREPARATION HANDBOOK (Part 1)

---

# 1. BACKEND ARCHITECTURE

## 1.1 Layered Architecture

```
┌─────────────────────────────────────────────────┐
│                  CLIENT (Angular)                │
└─────────────────────┬───────────────────────────┘
                      │ HTTP Request + JWT
┌─────────────────────▼───────────────────────────┐
│              SECURITY LAYER                      │
│  CorsConfig → JWTFilter → SecurityFilterChain   │
│  UserDetailsServiceImpl → BCryptPasswordEncoder  │
└─────────────────────┬───────────────────────────┘
                      │
┌─────────────────────▼───────────────────────────┐
│            CONTROLLER LAYER (REST APIs)          │
│  AuthController │ AdminController                │
│  PatientController │ DoctorController            │
│  HospitalController │ RootController             │
└─────────────────────┬───────────────────────────┘
                      │
┌─────────────────────▼───────────────────────────┐
│             SERVICE LAYER (Business Logic)       │
│  AuthService │ UserService │ PatientService      │
│  DoctorService │ HospitalService                 │
│  AppointmentService │ PrescriptionService        │
│  SlotService │ FraudReportService                │
│  QueryService │ ReplyService │ ReviewService     │
│  DataInitializerService                          │
└─────────────────────┬───────────────────────────┘
                      │
┌─────────────────────▼───────────────────────────┐
│            MAPPER LAYER (MapStruct)              │
│  Entity ←→ DTO conversion                       │
│  11 mappers: User, Patient, Doctor, Hospital,    │
│  Appointment, Prescription, Slot, Query, Reply,  │
│  Review, FraudReport                             │
└─────────────────────┬───────────────────────────┘
                      │
┌─────────────────────▼───────────────────────────┐
│          REPOSITORY LAYER (Spring Data JPA)      │
│  11 repositories extending JpaRepository         │
│  Derived queries + custom queries                │
└─────────────────────┬───────────────────────────┘
                      │
┌─────────────────────▼───────────────────────────┐
│            DATABASE LAYER (MySQL)                │
│  Tables: user, patient, doctor, hospital,        │
│  appointment, prescription, slot, query, reply,  │
│  review, fraud_report                            │
│  Hibernate auto DDL: update                      │
└─────────────────────────────────────────────────┘
```

**Interview Answer:**
> "Our backend follows a strict layered architecture. Requests hit the Security layer first (CORS → JWT Filter → SecurityFilterChain), then Controllers which delegate to Services for business logic. Services use MapStruct Mappers to convert between Entities and DTOs. Repositories handle database operations via Spring Data JPA with Hibernate ORM against MySQL."

## 1.2 Package Structure

```
com.medora.app/
├── AppApplication.java          # Main class (@SpringBootApplication, @EnableScheduling)
├── config/                      # Security & Configuration
│   ├── SecurityConfig.java      # SecurityFilterChain, AuthManager, BCrypt
│   ├── JWTFilter.java           # OncePerRequestFilter for JWT
│   ├── JWTService.java          # Token generation/validation
│   ├── AuthService.java         # Login/Register/Logout logic
│   ├── UserDetailsServiceImpl.java  # Spring Security UserDetailsService
│   ├── CorsConfig.java          # CORS configuration
│   └── DataInitializer.java     # Seed data on startup
├── constants/                   # Enums
│   ├── Role.java                # ADMIN, HOSPITAL, DOCTOR, PATIENT
│   ├── AuthStatus.java          # PENDING, APPROVED, REJECTED, SUSPENDED, FRAUD
│   ├── BookingStatus.java       # BOOKED, WAITING_LIST, COMPLETED, CANCELLED
│   ├── ReportStatus.java        # OPEN, REVIEWED, RESOLVED
│   ├── SlotStatus.java          # AVAILABLE, BOOKED
│   └── SlotType.java            # MORNING, PRE_NOON, AFTER_NOON, EVENING, NIGHT
├── controller/                  # REST Controllers (6)
├── dto/                         # Data Transfer Objects (14)
├── entity/                      # JPA Entities (10)
├── exception/                   # Exception handling
├── mapper/                      # MapStruct mappers (11)
├── repository/                  # JPA Repositories (11)
└── service/                     # Service interfaces + impl/ (22 files)
```

---

# 2. BACKEND FILE EXPLORATION ROADMAP

### Step 1: `AppApplication.java`
```java
@SpringBootApplication
@EnableScheduling
public class AppApplication {
    public static void main(String[] args) {
        Dotenv dotenv = Dotenv.load();
        System.setProperty("DB_USERNAME", dotenv.get("DB_USERNAME"));
        System.setProperty("DB_PASSWORD", dotenv.get("DB_PASSWORD"));
        SpringApplication.run(AppApplication.class, args);
    }
}
```
**Interview:** "Entry point. `@SpringBootApplication` combines `@Configuration`, `@EnableAutoConfiguration`, `@ComponentScan`. `@EnableScheduling` enables cron-based slot maintenance. We use `dotenv-java` to load DB credentials from `.env` file — keeps secrets out of `application.properties`."

### Step 2: `SecurityConfig.java`
**Purpose:** Configures Spring Security filter chain  
**Key Beans:** `BCryptPasswordEncoder`, `DaoAuthenticationProvider`, `AuthenticationManager`, `SecurityFilterChain`  
**Interview:** "The SecurityFilterChain defines URL authorization: `/api/register` and `/api/login` are `permitAll()`. Role-specific endpoints use `hasAuthority()` — `/api/admin/**` requires ADMIN, etc. CSRF is disabled for REST APIs. The JWTFilter is added before `UsernamePasswordAuthenticationFilter`."

### Step 3: `JWTFilter.java`
**Purpose:** Extracts and validates JWT from every request  
**Extends:** `OncePerRequestFilter`  
**Interview:** "For each request: extracts `Authorization` header → strips 'Bearer ' prefix → extracts username from token → if valid and no existing auth, loads UserDetails and sets `SecurityContext`. Extends `OncePerRequestFilter` to guarantee single execution per request."

### Step 4: `JWTService.java`
**Purpose:** JWT token generation, validation, claim extraction  
**Interview:** "Generates HmacSHA256 key on startup (random per restart — tokens invalidate on server restart). Token contains subject (username), issuedAt, expiration (23 hours). Uses jjwt library for building/parsing."

### Step 5: `AuthService.java`
**Purpose:** Registration, login, logout business logic  
**Interview:** "Registration: encodes password with BCrypt, creates User, then creates role-specific entity (Patient/Doctor/Hospital). Doctors and Hospitals get `UserNotApprovedException` after registration — they must be approved first. Login: validates user exists, checks AuthStatus for Doctor/Hospital, authenticates via `AuthenticationManager`, returns JWT token."

### Step 6: Controllers (5 role-specific + 1 root)
**Interview:** "Six controllers mapped to role-based URL prefixes. Each injects services via constructor injection. Returns `ResponseEntity<T>` for proper HTTP status codes."

### Step 7: Service Interfaces + Implementations
**Interview:** "We follow the Interface-Implementation pattern. 11 service interfaces in `service/` with implementations in `service/impl/`. This supports the Dependency Inversion Principle and makes unit testing easier with mocks."

### Steps 8-10: DTOs → Entities → Repositories → Mappers
**Interview:** "DTOs prevent entity exposure to clients. MapStruct generates mapper implementations at compile time — zero runtime overhead. Repositories extend `JpaRepository` for CRUD + custom derived queries."

---

# 3. COMPLETE API EXECUTION FLOWS

## 3.1 Registration Flow (POST /api/register)

```
Request: POST /api/register { username, password, roles: ["PATIENT"], patientName, ... }
  ↓
JWTFilter: No Authorization header → skips authentication
  ↓
SecurityFilterChain: /api/register is permitAll() → allows through
  ↓
AuthController.register(@RequestBody RegistrationDTO)
  ↓
AuthService.register():
  1. pwdEncoder.encode(password) → BCrypt hash
  2. userService.addUser(registrationDTO)
     → UserRepository.existsByUsername() check
     → new User() → set fields → UserRepository.save()
  3. If role is HOSPITAL:
     → hospitalService.addHospital(dto, user) → set AuthStatus.PENDING
     → throw UserNotApprovedException("Authentication Pending")
  4. If role is DOCTOR:
     → doctorService.addDoctor(dto, user) → find hospital by name → set AuthStatus.PENDING
     → throw UserNotApprovedException("Authentication Pending")
  5. If role is PATIENT:
     → patientService.addPatient(dto, user) → no approval needed
     → return jwtService.generateToken(username) → auto-login
  ↓
Response: JWT token string (Patient) OR 401 error with message (Doctor/Hospital)
```

## 3.2 Login Flow (POST /api/login)

```
Request: POST /api/login { username, password }
  ↓
AuthController.login(@RequestBody UserDTO)
  ↓
AuthService.login():
  1. userMapper.mapToEntity(dto) → User object
  2. userService.getUserByUsername() → find user or throw UserNotFoundException
  3. If HOSPITAL → hospitalService.getHospital() → check AuthStatus == APPROVED
  4. If DOCTOR → doctorService.getDoctor() → check AuthStatus == APPROVED
     → If not approved: throw UserNotApprovedException
  5. AuthenticationManager.authenticate(UsernamePasswordAuthenticationToken)
     → DaoAuthenticationProvider → UserDetailsServiceImpl.loadUserByUsername()
     → BCrypt password verification
  6. If authenticated:
     → jwtService.generateToken(username)
     → return LoginResponseDTO { token, username, roles, expiresIn: 86400 }
  ↓
Response: 200 OK { token: "eyJ...", username: "patient1", roles: ["PATIENT"], expiresIn: 86400 }
```

## 3.3 Appointment Booking Flow (POST /api/patient/doctors/{doctorId}/appointments)

```
Request: POST /api/patient/doctors/1/appointments { appointmentDate, slotType: "MORNING", problem }
  ↓
JWTFilter: Extract token → validate → set SecurityContext
SecurityFilterChain: /api/patient/** requires PATIENT authority → verified
  ↓
PatientController.bookAppointment(@PathVariable doctorId, @RequestBody AppointmentDTO)
  ↓
AppointmentService.bookAppointment(doctorId, dto):
  1. Get authenticated username from SecurityContext
  2. Get patient by username → Patient entity
  3. Get doctor by doctorId → Doctor entity
  4. slotService.bookSlot(doctorId, date, slotType)
     → Find Slot by doctorId + date
     → Check if slot (e.g., MORNING) is AVAILABLE
     → If AVAILABLE → set to BOOKED → save → return Slot
     → If already BOOKED → return null
  5. If slot booked → set BookingStatus.BOOKED
     If slot null → set BookingStatus.WAITING_LIST
  6. Create Appointment entity → set all fields → save
  7. appointmentMapper.mapToDTO() → return
  ↓
Response: 200 OK AppointmentDTO { id, patient, doctor, bookingStatus, slotType, ... }
```

## 3.4 Hospital Approval Flow (PATCH /api/admin/hospitals/{id}/approve)

```
Request: PATCH /api/admin/hospitals/1/approve
  ↓
JWTFilter + SecurityFilterChain: Validates ADMIN authority
  ↓
AdminController.approveHospitals(@PathVariable hospitalId)
  ↓
HospitalService.approveHospital(hospitalId):
  1. hospitalRepository.findById(hospitalId) → Hospital entity
  2. hospital.setAuthStatus(AuthStatus.APPROVED)
  3. hospitalRepository.save(hospital) → @PreUpdate sets updatedAt
  4. hospitalMapper.mapToDTO() → return
  ↓
Response: 200 OK HospitalDTO { authStatus: "APPROVED", ... }
```

## 3.5 Prescription Creation Flow (POST /api/doctor/appointments/{id}/prescriptions)

```
Request: POST /api/doctor/appointments/5/prescriptions { diagnosis, medicine }
  ↓
DoctorController.createPrescription(@RequestBody PrescriptionDTO, @PathVariable appointmentId)
  ↓
PrescriptionService.addPrescription(dto, appointmentId):
  1. appointmentService.getAppointment(appointmentId) → Appointment entity
  2. new Prescription() → set appointment, diagnosis, medicine
  3. prescriptionRepository.save() → @PrePersist sets createdAt
  4. Update appointment status to COMPLETED
  5. prescriptionMapper.mapToDTO() → return
  ↓
Response: 200 OK PrescriptionDTO { id, appointment, diagnosis, medicine, createdAt }
```

---

# 4. SPRING BOOT ANNOTATIONS MASTER GUIDE

## Class-Level Annotations

| Annotation | Where Used | Definition | Interview Answer |
|-----------|-----------|-----------|-----------------|
| `@SpringBootApplication` | AppApplication | Combines @Configuration + @EnableAutoConfiguration + @ComponentScan | "Bootstrap annotation. Auto-configures beans based on classpath. Scans com.medora.app package." |
| `@EnableScheduling` | AppApplication | Enables @Scheduled methods | "Activates cron-based slot maintenance — creates new 30-day slot windows daily." |
| `@Configuration` | SecurityConfig, CorsConfig | Indicates class has @Bean methods | "Marks class as source of Spring bean definitions." |
| `@EnableWebSecurity` | SecurityConfig | Activates Spring Security | "Enables Spring Security's web security support and integrates with MVC." |
| `@RestController` | All controllers | @Controller + @ResponseBody | "Combines @Controller and @ResponseBody — all methods return JSON by default." |
| `@Service` | All services, JWTService, AuthService | Business logic component | "Semantic stereotype for service layer. Spring creates singleton bean." |
| `@Component` | JWTFilter, DataInitializer | Generic Spring-managed bean | "Generic stereotype. JWTFilter is @Component because it's not a service/controller." |
| `@Entity` | All entities | JPA entity → database table | "Maps class to database table. Hibernate manages lifecycle." |
| `@Data` | All entities, DTOs | Lombok: getter, setter, toString, equals, hashCode | "Generates boilerplate code at compile time." |
| `@AllArgsConstructor` | Most entities, DTOs | Lombok: constructor with all fields | "Generates constructor for all fields." |
| `@NoArgsConstructor` | Most entities, DTOs | Lombok: default constructor | "JPA requires no-arg constructor for entity instantiation." |
| `@Builder` | LoginResponseDTO | Lombok: builder pattern | "Enables LoginResponseDTO.builder().token().username().build()." |
| `@RequiredArgsConstructor` | DataInitializer | Lombok: constructor for final fields | "Generates constructor for fields marked final — enables DI." |
| `@Slf4j` | DataInitializer | Lombok: SLF4J logger | "Adds `private static final Logger log` field." |
| `@RestControllerAdvice` | GlobalExceptionHandler | Global exception handler | "Applies @ExceptionHandler methods across all controllers." |
| `@Mapper` | All MapStruct mappers | MapStruct mapper interface | "`componentModel = 'spring'` makes it a Spring bean. Generates implementation at compile time." |

## Method/Field Annotations

| Annotation | Purpose | Project Usage |
|-----------|---------|--------------|
| `@Bean` | Defines a Spring bean | SecurityConfig: pwdEncoder(), authProvider(), authManager(), security() |
| `@GetMapping` | HTTP GET | All read endpoints |
| `@PostMapping` | HTTP POST | register, login, createPrescription, bookAppointment |
| `@PatchMapping` | HTTP PATCH | approve, reject, suspend, fraud, cancel, changePassword |
| `@PutMapping` | HTTP PUT | updateProfile |
| `@DeleteMapping` | HTTP DELETE | deletePatient, deletePrescription |
| `@RequestMapping` | Base URL path | Controller-level: "/api/admin", "/api/patient", etc. |
| `@RequestBody` | Parse JSON body | All POST/PUT/PATCH request bodies |
| `@PathVariable` | URL path parameter | `/hospitals/{hospitalId}` |
| `@Id` | JPA primary key | All entity ID fields |
| `@GeneratedValue(IDENTITY)` | Auto-increment PK | User, Appointment, FraudReport, Query, Reply, Review, Slot |
| `@MapsId` | Share PK with parent | Patient, Doctor, Hospital, Prescription (PK = FK) |
| `@OneToOne` | 1:1 relationship | User↔Patient, User↔Doctor, User↔Hospital, Appointment↔Prescription |
| `@ManyToOne` | N:1 relationship | Doctor→Hospital, Appointment→Doctor/Patient, FraudReport→Doctor/Patient |
| `@OneToMany` | 1:N relationship | Query→Reply (cascade ALL) |
| `@JoinColumn` | Foreign key column | All relationship mappings |
| `@Column` | Column constraints | nullable, unique, length specifications |
| `@Enumerated(STRING)` | Store enum as string | Role, AuthStatus, BookingStatus, SlotStatus, SlotType |
| `@PrePersist` | Before insert callback | Set createdAt = LocalDateTime.now() |
| `@PreUpdate` | Before update callback | Set updatedAt = LocalDateTime.now() |
| `@JsonProperty(WRITE_ONLY)` | JSON serialization control | User.password, UserDTO.password — never sent in response |
| `@JsonIgnore` | Skip in JSON | Reply.query — prevents circular reference |
| `@ExceptionHandler` | Handle specific exceptions | GlobalExceptionHandler methods |
| `@ResponseStatus` | Set HTTP status | 404, 401, 226 (IM_USED), 500 |

---

# 5. SPRING SECURITY + JWT MASTER GUIDE

## 5.1 Security Filter Chain Flow

```
HTTP Request arrives
  ↓
CorsFilter (from CorsConfig)
  → Checks origin against allowed list (localhost:4200, 4000, 8000)
  → Adds CORS headers
  ↓
JWTFilter (extends OncePerRequestFilter)
  → Reads "Authorization" header
  → If starts with "Bearer ":
    → Extract token (substring 7)
    → JWTService.extractUsername(token)
    → If username != null && no existing auth:
      → UserDetailsServiceImpl.loadUserByUsername()
      → JWTService.validateToken() — checks expiration
      → Creates UsernamePasswordAuthenticationToken with authorities
      → Sets SecurityContextHolder.getContext().setAuthentication()
  → filterChain.doFilter() — continue chain
  ↓
SecurityFilterChain authorization rules:
  → "/", "/api/register", "/api/login", "/api/hospitals" → permitAll()
  → "/api/admin/**" → hasAuthority("ADMIN")
  → "/api/hospital/**" → hasAuthority("HOSPITAL")
  → "/api/doctor/**" → hasAuthority("DOCTOR")
  → "/api/patient/**" → hasAuthority("PATIENT")
  → anyRequest() → authenticated()
  ↓
Controller method executes
```

## 5.2 JWT Token Structure

```
Header: { "alg": "HS256", "typ": "JWT" }
Payload: {
  "sub": "patient1",        // username
  "iat": 1748700000,         // issued at
  "exp": 1748782800          // expiration (23 hours later)
}
Signature: HMAC-SHA256(header.payload, secretKey)
```

**Key Detail:** Secret key is generated randomly on each server start using `KeyGenerator.getInstance("HmacSHA256")`. This means all tokens are invalidated when the server restarts.

**Interview Answer:** "The JWT contains only the username as subject. Roles are NOT in the token — they're loaded from the database on each request via `UserDetailsServiceImpl`. This means role changes take effect immediately without token reissue."

## 5.3 Password Encoding

```
Registration: pwdEncoder.encode("password123") → "$2a$10$..."
Login: AuthenticationManager → DaoAuthenticationProvider
  → pwdEncoder.matches(rawPassword, encodedPassword)
Change Password: pwdEncoder.matches(oldPassword, stored)
  → pwdEncoder.encode(newPassword) → save
```

## 5.4 UserDetailsService Implementation

```java
public UserDetails loadUserByUsername(String username) {
    User user = userRepository.getUserByUsername(username)
        .orElseThrow(() -> new UsernameNotFoundException("Username not found"));
    List<SimpleGrantedAuthority> authorities = user.getRoles().stream()
        .map(role -> new SimpleGrantedAuthority(role.name()))
        .collect(Collectors.toList());
    return new org.springframework.security.core.userdetails.User(
        user.getUsername(), user.getPassword(), authorities);
}
```

**Interview:** "We convert our custom `Role` enum to Spring Security's `SimpleGrantedAuthority`. The `hasAuthority('ADMIN')` in SecurityConfig matches against these authority names."

---

# 6. DATABASE DESIGN ANALYSIS

## 6.1 Entity Relationship Diagram

```
┌──────────┐     ┌──────────────┐     ┌──────────────┐
│   USER   │────→│   PATIENT    │     │   HOSPITAL   │
│          │  1:1│   @MapsId    │     │   @MapsId    │
│ id (PK)  │     │ user_id (PK) │     │ user_id (PK) │
│ username │     │ name         │     │ name (unique)│
│ password │     │ age          │     │ address      │
│ roles    │     │ gender       │     │ contact      │
│ createdAt│     │ phone        │     │ authStatus   │
└──────────┘     │ location     │     │ rejectedReason│
     │           └──────────────┘     └───────┬──────┘
     │ 1:1                                    │ 1:N
     ▼                                        ▼
┌──────────────┐                    ┌──────────────┐
│   DOCTOR     │←───────────────────│   (hospital) │
│   @MapsId    │     N:1            │              │
│ user_id (PK) │                    └──────────────┘
│ name         │
│ hospital_id  │──→ Hospital (FK)
│ licenceNumber│
│ qualification│
│ experience   │
│ location     │
│ authStatus   │
│ rejectedReason│
└──────┬───────┘
       │
       │ 1:N                    1:N
       ▼                        ▼
┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│ APPOINTMENT  │     │   SLOT       │     │ FRAUD_REPORT │
│ id (PK, auto)│     │ id (PK,auto) │     │ id (PK,auto) │
│ doctor_id(FK)│     │ doctor_id(FK)│     │ doctor_id(FK)│
│ patient_id(FK│     │ date         │     │ patient_id(FK│
│ bookingStatus│     │ morning      │     │ reportStatus │
│ appointDate  │     │ preNoon      │     │ reason       │
│ slotType     │     │ afterNoon    │     │ createdAt    │
│ problem      │     │ evening      │     └──────────────┘
│ createdAt    │     │ night        │
│ updatedAt    │     └──────────────┘
└──────┬───────┘
       │ 1:1
       ▼
┌──────────────┐
│ PRESCRIPTION │
│   @MapsId    │
│ appt_id (PK) │
│ diagnosis    │
│ medicine     │
│ createdAt    │
│ updatedAt    │
└──────────────┘

┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│   QUERY      │     │   REPLY      │     │   REVIEW     │
│ id (PK,auto) │──→  │ id (PK,auto) │     │ id (PK,auto) │
│ patient_id   │ 1:N │ query_id(FK) │     │ doctor_id(FK)│
│ message      │     │ user_id(FK)  │     │ patient_id(FK│
│ createdAt    │     │ message      │     │ rating       │
└──────────────┘     │ createdAt    │     │ comment      │
                     └──────────────┘     │ createdAt    │
                                          └──────────────┘
```

## 6.2 Key Relationships

| Relationship | Type | Annotation | Strategy |
|-------------|------|-----------|----------|
| User → Patient | 1:1 | `@OneToOne @MapsId` | Shared PK (patient.id = user.id) |
| User → Doctor | 1:1 | `@OneToOne @MapsId` | Shared PK |
| User → Hospital | 1:1 | `@OneToOne @MapsId` | Shared PK |
| Hospital → Doctor | 1:N | `@ManyToOne` on Doctor | doctor.hospital_id FK |
| Doctor → Appointment | 1:N | `@ManyToOne` on Appointment | appointment.doctor_id FK |
| Patient → Appointment | 1:N | `@ManyToOne` on Appointment | appointment.patient_id FK |
| Appointment → Prescription | 1:1 | `@OneToOne @MapsId` | Shared PK (prescription.id = appointment.id) |
| Doctor → Slot | 1:N | `@ManyToOne` on Slot | slot.doctor_id FK |
| Patient → Query | 1:N | `@ManyToOne` on Query | query.patient_id FK |
| Query → Reply | 1:N | `@OneToMany cascade ALL` | reply.query_id FK |
| User → Reply | N:1 | `@ManyToOne` on Reply | reply.user_id FK |

**Interview Answer for @MapsId:**
> "We use `@MapsId` for Patient, Doctor, Hospital, and Prescription. This means the child entity shares the same primary key as the parent. For example, if a User has `id=5`, the corresponding Patient also has `id=5`. This eliminates the need for a separate auto-generated ID and enforces the 1:1 relationship at the database level."

## 6.3 Enum Storage

All enums use `@Enumerated(EnumType.STRING)` — stored as VARCHAR, not ordinal numbers. This prevents issues when enum values are reordered.
