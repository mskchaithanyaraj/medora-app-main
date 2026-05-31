# Medora App - Backend TODO List

This document tracks missing APIs and functionality that need to be implemented in the Medora healthcare application backend.

**Last Updated**: May 20, 2026  
**Priority Legend**: 🔴 High | 🟡 Medium | 🟢 Low

---

## 📋 Table of Contents
- [Authentication & Authorization](#authentication--authorization)
- [Patient Features](#patient-features)
- [Doctor Features](#doctor-features)
- [Hospital Features](#hospital-features)
- [Admin Features](#admin-features)
- [System Features](#system-features)

---

## 🔐 Authentication & Authorization

### ✅ Completed
- [x] User Registration (Patient, Doctor, Hospital)
- [x] User Login with JWT
- [x] Logout API
- [x] JWT Token Generation & Validation
- [x] Role-based Access Control

### ⏳ Pending
- [ ] 🟡 Password Reset/Forgot Password
- [ ] 🟡 Email Verification for Registration
- [ ] 🟡 Refresh Token Implementation
- [ ] 🟢 Two-Factor Authentication (2FA)
- [ ] 🟢 Session Management & Token Blacklisting

---

## 👨‍⚕️ Patient Features

### ✅ Completed
- [x] Patient Profile View
- [x] Patient Profile Delete
- [x] View All Appointments
- [x] Book Appointment with Doctor
- [x] Cancel Appointment
- [x] View All Prescriptions
- [x] View Prescription by ID

### ⏳ Pending - High Priority

#### 🔴 Fraud Reporting
**Endpoint**: `POST /api/patient/fraud-reports`
- Allow patients to report hospitals for fraudulent activities
- **Request Body**: `FraudReportDTO`
  ```json
  {
    "hospitalId": 1,
    "reason": "Overcharging for services, false billing practices"
  }
  ```
- **Response**: `FraudReportDTO` with status `OPEN`
- **Implementation Steps**:
  1. Create `FraudReportDTO` if not exists
  2. Add endpoint in `PatientController`
  3. Create `FraudReportService` and `FraudReportRepository`
  4. Implement business logic to create fraud report
  5. Send notification to admin (optional)

#### 🔴 View Fraud Report Status
**Endpoint**: `GET /api/patient/fraud-reports`
- View all fraud reports submitted by the patient
- **Response**: `List<FraudReportDTO>`

#### 🔴 Doctor Availability Check
**Endpoint**: `GET /api/patient/doctors/{doctorId}/availability`
- View available time slots for a specific doctor
- **Query Parameters**: `date` (LocalDate)
- **Response**: `List<SlotDTO>`
- Currently commented out in `PatientController.java` line 55

#### 🔴 Doctor Search & Browse
**Endpoint**: `GET /api/patient/doctors`
- Search and filter doctors by specialization, location, hospital
- **Query Parameters**: 
  - `specialization` (optional)
  - `location` (optional)
  - `hospitalId` (optional)
  - `rating` (optional - minimum rating)
- **Response**: `List<DoctorDTO>`

#### 🟡 Patient Profile Update
**Endpoint**: `PATCH /api/patient/profile`
- Update patient information (phone, location, age)
- **Request Body**: `PatientDTO`
- **Response**: `PatientDTO`

#### 🟡 Doctor Reviews & Ratings
**Endpoint**: `POST /api/patient/doctors/{doctorId}/reviews`
- Submit review and rating for a doctor after appointment
- **Request Body**: `ReviewDTO`
  ```json
  {
    "rating": 5,
    "comment": "Excellent doctor, very caring and professional"
  }
  ```
- **Response**: `ReviewDTO`

**Endpoint**: `GET /api/patient/doctors/{doctorId}/reviews`
- View all reviews for a specific doctor
- **Response**: `List<ReviewDTO>`

#### 🟡 Appointment History
**Endpoint**: `GET /api/patient/appointments/history`
- View completed/cancelled appointment history
- **Query Parameter**: `status` (optional: COMPLETED, CANCELLED)
- **Response**: `List<AppointmentDTO>`

#### 🟡 Prescription Download
**Endpoint**: `GET /api/patient/prescriptions/{prescriptionId}/download`
- Download prescription as PDF
- **Response**: PDF file

### ⏳ Pending - Medium/Low Priority

#### 🟢 Query/Support System
**Endpoint**: `POST /api/patient/queries`
- Submit queries or support requests
- **Request Body**:
  ```json
  {
    "message": "How do I reschedule my appointment?"
  }
  ```
- **Response**: `QueryDTO`

**Endpoint**: `GET /api/patient/queries`
- View all queries and their replies
- **Response**: `List<QueryDTO>`

#### 🟢 Medical History
**Endpoint**: `GET /api/patient/medical-history`
- View consolidated medical history (appointments + prescriptions)
- **Response**: Comprehensive medical history object

#### 🟢 Appointment Reminders
- Automatic email/SMS reminders before appointment
- Implementation: Background job/scheduler

---

## 🩺 Doctor Features

### ✅ Completed
- [x] Update Doctor Profile
- [x] Create Prescription for Appointment
- [x] View Prescription by ID
- [x] View Patient Prescriptions

### ⏳ Pending - High Priority

#### 🔴 View Doctor's Appointments
**Endpoint**: `GET /api/doctors/appointments`
- View all appointments for the authenticated doctor
- **Query Parameters**: 
  - `status` (optional: PENDING, CONFIRMED, COMPLETED, CANCELLED)
  - `date` (optional: specific date)
- **Response**: `List<AppointmentDTO>`

#### 🔴 Update Appointment Status
**Endpoint**: `PATCH /api/doctors/appointments/{appointmentId}/status`
- Confirm, complete, or cancel appointment
- **Request Body**:
  ```json
  {
    "status": "CONFIRMED"
  }
  ```
- **Response**: `AppointmentDTO`

#### 🔴 Availability Management
**Endpoint**: `POST /api/doctors/availability`
- Set available time slots for appointments
- **Request Body**: `SlotDTO`
  ```json
  {
    "date": "2026-05-25",
    "morning": "AVAILABLE",
    "preNoon": "AVAILABLE",
    "afterNoon": "BOOKED",
    "evening": "AVAILABLE",
    "night": "AVAILABLE"
  }
  ```
- **Response**: `SlotDTO`
- Currently commented out in `DoctorController.java` line 34

**Endpoint**: `GET /api/doctors/availability`
- View doctor's own availability schedule
- **Query Parameter**: `date` (optional, range)
- **Response**: `List<SlotDTO>`

**Endpoint**: `PATCH /api/doctors/availability/{slotId}`
- Update existing availability slot
- **Request Body**: `SlotDTO`
- **Response**: `SlotDTO`

#### 🟡 Patient Details View
**Endpoint**: `GET /api/doctors/patients/{patientId}`
- View patient profile and history before appointment
- **Response**: `PatientDTO` with appointment history

#### 🟡 View Doctor's Reviews
**Endpoint**: `GET /api/doctors/reviews`
- View all reviews received by the doctor
- **Response**: `List<ReviewDTO>`

#### 🟡 Dashboard Statistics
**Endpoint**: `GET /api/doctors/dashboard`
- Get statistics: total appointments, pending, completed, avg rating
- **Response**:
  ```json
  {
    "totalAppointments": 150,
    "pendingAppointments": 5,
    "completedAppointments": 140,
    "cancelledAppointments": 5,
    "averageRating": 4.7,
    "totalReviews": 89
  }
  ```

### ⏳ Pending - Medium/Low Priority

#### 🟢 Prescription Templates
**Endpoint**: `GET /api/doctors/prescription-templates`
- Saved prescription templates for common diagnoses
- **Response**: `List<PrescriptionTemplateDTO>`

#### 🟢 Patient Search
**Endpoint**: `GET /api/doctors/patients`
- Search patients treated by the doctor
- **Query Parameter**: `name`, `phone`
- **Response**: `List<PatientDTO>`

---

## 🏥 Hospital Features

### ✅ Completed
- [x] View All Doctors in Hospital
- [x] View Doctors by Status
- [x] Approve Doctor
- [x] Reject Doctor

### ⏳ Pending - High Priority

#### 🔴 Hospital Profile Update
**Endpoint**: `PATCH /api/hospital/profile`
- Update hospital information
- **Request Body**: `HospitalDTO`
- **Response**: `HospitalDTO`

#### 🔴 View Hospital Profile
**Endpoint**: `GET /api/hospital/profile`
- View authenticated hospital's profile
- **Response**: `HospitalDTO`

#### 🔴 Hospital Appointments
**Endpoint**: `GET /api/hospital/appointments`
- View all appointments across all doctors in hospital
- **Query Parameters**: 
  - `status` (optional)
  - `doctorId` (optional)
  - `date` (optional)
- **Response**: `List<AppointmentDTO>`
- Currently commented out in `HospitalController.java` line 56-59

**Endpoint**: `GET /api/hospital/appointments/{appointmentId}`
- View specific appointment details
- **Response**: `AppointmentDTO`
- Currently commented out in `HospitalController.java` line 61

#### 🟡 Doctor Performance Analytics
**Endpoint**: `GET /api/hospital/doctors/{doctorId}/analytics`
- View doctor's performance metrics
- **Response**:
  ```json
  {
    "doctorId": 1,
    "totalAppointments": 200,
    "completedAppointments": 190,
    "averageRating": 4.5,
    "totalReviews": 120,
    "monthlyAppointments": [...]
  }
  ```

#### 🟡 Hospital Dashboard
**Endpoint**: `GET /api/hospital/dashboard`
- Overall hospital statistics and metrics
- **Response**: Comprehensive hospital analytics

#### 🟡 View Fraud Reports
**Endpoint**: `GET /api/hospital/fraud-reports`
- View fraud reports filed against the hospital
- **Response**: `List<FraudReportDTO>`

#### 🟡 Respond to Fraud Reports
**Endpoint**: `POST /api/hospital/fraud-reports/{reportId}/response`
- Add response/explanation to fraud report
- **Request Body**:
  ```json
  {
    "response": "This is a misunderstanding. We have documentation..."
  }
  ```

### ⏳ Pending - Medium/Low Priority

#### 🟢 Doctor Specialization Management
**Endpoint**: `PATCH /api/hospital/doctors/{doctorId}/specialization`
- Update doctor's specialization/department

#### 🟢 Hospital Operating Hours
**Endpoint**: `POST /api/hospital/operating-hours`
- Set hospital operating hours

---

## 👨‍💼 Admin Features

### ✅ Completed
- [x] Get User by ID
- [x] Get All Hospitals
- [x] Get Hospital by ID
- [x] Approve/Reject/Suspend/Flag Hospital as Fraud
- [x] Get All Patients
- [x] Get Patient by ID
- [x] Get All Doctors

### ⏳ Pending - High Priority

#### 🔴 Fraud Report Management
**Endpoint**: `GET /api/admin/fraud-reports`
- View all fraud reports submitted
- **Query Parameters**:
  - `status` (optional: OPEN, REVIEWED, RESOLVED)
  - `hospitalId` (optional)
- **Response**: `List<FraudReportDTO>`

**Endpoint**: `GET /api/admin/fraud-reports/{reportId}`
- View specific fraud report details
- **Response**: `FraudReportDTO`

**Endpoint**: `PATCH /api/admin/fraud-reports/{reportId}/status`
- Update fraud report status (REVIEWED, RESOLVED)
- **Request Body**:
  ```json
  {
    "status": "REVIEWED",
    "adminNotes": "Investigated, found credible evidence"
  }
  ```
- **Response**: `FraudReportDTO`

#### 🔴 Get Doctor by ID
**Endpoint**: `GET /api/admin/doctors/{doctorId}`
- View specific doctor details
- **Response**: `DoctorDTO`

#### 🟡 Approve/Reject Doctors (Admin Level)
**Endpoint**: `PATCH /api/admin/doctors/{doctorId}/approve`
**Endpoint**: `PATCH /api/admin/doctors/{doctorId}/reject`
- Admin-level doctor verification
- **Response**: `DoctorDTO`

#### 🟡 System Statistics Dashboard
**Endpoint**: `GET /api/admin/dashboard`
- Overall system metrics
- **Response**:
  ```json
  {
    "totalUsers": 1500,
    "totalPatients": 1000,
    "totalDoctors": 300,
    "totalHospitals": 50,
    "totalAppointments": 5000,
    "openFraudReports": 12,
    "pendingHospitals": 5,
    "pendingDoctors": 15
  }
  ```

#### 🟡 User Management
**Endpoint**: `GET /api/admin/users`
- Get all users with filtering
- **Query Parameters**: `role`, `status`
- **Response**: `List<UserDTO>`

**Endpoint**: `DELETE /api/admin/users/{userId}`
- Delete/deactivate user account
- **Response**: `204 No Content`

#### 🟡 Appointment Management
**Endpoint**: `GET /api/admin/appointments`
- View all appointments in the system
- **Query Parameters**: filters
- **Response**: `List<AppointmentDTO>`

### ⏳ Pending - Medium/Low Priority

#### 🟢 Activity Logs/Audit Trail
**Endpoint**: `GET /api/admin/audit-logs`
- View system activity logs
- Track all major actions (approvals, rejections, etc.)

#### 🟢 Reports & Analytics
**Endpoint**: `GET /api/admin/reports/monthly`
- Generate monthly system reports

#### 🟢 Content Management
**Endpoint**: `POST /api/admin/announcements`
- Create system-wide announcements

---

## ⚙️ System Features

### ⏳ Pending - All Priorities

#### 🔴 Query/Support System (Admin Side)
**Endpoint**: `GET /api/admin/queries`
- View all support queries
- **Query Parameter**: `status` (OPEN, ANSWERED, CLOSED)
- **Response**: `List<QueryDTO>`

**Endpoint**: `POST /api/admin/queries/{queryId}/reply`
- Reply to patient queries
- **Request Body**:
  ```json
  {
    "message": "Thank you for reaching out. Here's how to..."
  }
  ```
- **Response**: `ReplyDTO`

#### 🟡 Email Notifications
- Appointment confirmation emails
- Prescription ready notifications
- Fraud report acknowledgment
- Implementation: Email service integration

#### 🟡 SMS Notifications
- Appointment reminders
- OTP for verification
- Implementation: SMS gateway integration

#### 🟡 File Upload/Download
**Endpoint**: `POST /api/upload/documents`
- Upload medical documents, certificates
- **Response**: File URL

**Endpoint**: `GET /api/download/documents/{fileId}`
- Download uploaded documents

#### 🟢 Search Functionality
**Endpoint**: `GET /api/search`
- Global search across doctors, hospitals, specializations
- **Query Parameter**: `q` (search query)
- **Response**: Combined search results

#### 🟢 Notification System
**Endpoint**: `GET /api/notifications`
- Get user notifications
- **Response**: `List<NotificationDTO>`

**Endpoint**: `PATCH /api/notifications/{notificationId}/read`
- Mark notification as read

---

## 📊 Implementation Priority Summary

### Phase 1 - Critical (Sprint 1-2)
1. ✅ Core authentication system - COMPLETED
2. ✅ Basic appointment booking - COMPLETED
3. ✅ Prescription management - COMPLETED
4. 🔴 Fraud reporting system (Patient → Admin)
5. 🔴 Doctor availability/slot management
6. 🔴 Doctor appointments view & management
7. 🔴 Admin fraud report management

### Phase 2 - Important (Sprint 3-4)
1. 🟡 Review & rating system
2. 🟡 Hospital profile & appointments
3. 🟡 Patient profile update
4. 🟡 Doctor dashboard & analytics
5. 🟡 Admin dashboard & statistics
6. 🟡 Query/Support system

### Phase 3 - Enhancement (Sprint 5+)
1. 🟢 Email/SMS notifications
2. 🟢 File upload/download
3. 🟢 Advanced search
4. 🟢 Reports & analytics
5. 🟢 Audit logs
6. 🟢 Prescription templates

---

## 🛠️ Technical Implementation Notes

### DTOs to Create/Update
- [ ] `FraudReportDTO` - Complete implementation
- [ ] `SlotDTO` - Complete implementation
- [ ] `ReviewDTO` - Complete implementation  
- [ ] `QueryDTO` - Complete implementation
- [ ] `ReplyDTO` - Complete implementation
- [ ] `NotificationDTO` - Create new
- [ ] `DashboardStatsDTO` - Create new

### Services to Create
- [ ] `FraudReportService` + `FraudReportServiceImpl`
- [ ] `SlotService` + `SlotServiceImpl`
- [ ] `ReviewService` + `ReviewServiceImpl`
- [ ] `QueryService` + `QueryServiceImpl`
- [ ] `NotificationService` + `NotificationServiceImpl`
- [ ] `EmailService` + Implementation
- [ ] `FileStorageService` + Implementation

### Repositories to Create
- [ ] `FraudReportRepository`
- [ ] `SlotRepository`
- [ ] `ReviewRepository`
- [ ] `QueryRepository`
- [ ] `ReplyRepository`
- [ ] `NotificationRepository`

### Security Configurations
- [ ] Add rate limiting for API endpoints
- [ ] Implement request validation
- [ ] Add CORS configuration for frontend
- [ ] API documentation with Swagger/OpenAPI

### Database Migrations
- [ ] Ensure all entity relationships are properly mapped
- [ ] Add indexes for frequently queried fields
- [ ] Set up database constraints

---

## 📝 Notes

### Entity Relationships Already Defined
- ✅ `FraudReport` - Patient can report Hospital
- ✅ `Review` - Patient can review Doctor
- ✅ `Slot` - Doctor has availability slots
- ✅ `Query` - Patient can create queries
- ✅ `Reply` - Admin/Staff can reply to queries

### Commented Out Code to Implement
1. `PatientController.java:55` - Doctor availability endpoint
2. `DoctorController.java:34` - Doctor availability management
3. `HospitalController.java:56-61` - Hospital appointments view

### Testing Requirements
- [ ] Unit tests for all new services
- [ ] Integration tests for API endpoints
- [ ] Security testing for role-based access
- [ ] Performance testing for heavy endpoints

---

**Next Steps**: 
1. Review and prioritize features with the team
2. Create detailed implementation tickets for Phase 1
3. Set up development branch and begin implementation
4. Update API_IMPLEMENTATION.md as features are completed

**Contact**: Development Team  
**Last Review**: May 20, 2026
