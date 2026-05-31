# Medora App - REST API Documentation

This document lists all available REST APIs in the Medora healthcare application with example request/response bodies.

**Base URL**: `http://localhost:8080`

---

## Table of Contents
- [Health Check](#health-check)
- [Authentication APIs](#authentication-apis)
- [Admin APIs](#admin-apis)
  - [User Management](#user-management)
  - [Hospital Management](#hospital-management)
- [Patient APIs](#patient-apis)
  - [Appointment Management](#appointment-management)
- [Doctor APIs](#doctor-apis)
  - [Prescription Management](#prescription-management)
- [Hospital APIs](#hospital-apis)
  - [Doctor Management](#doctor-management)

---

## Health Check

### 0. API Health Check
- **Endpoint**: `GET /`
- **Description**: Check if Medora API is running
- **Authentication**: ❌ Not Required
- **Status**: ✅ Ready to use

**Response Example:**
```json
{
  "message": "Medora API is running",
  "status": "active"
}
```

---

## Authentication APIs
Base URL: `/api`

### 1. Register User
- **Endpoint**: `POST /api/register`
- **Description**: Register a new user (Patient, Doctor, or Hospital)
- **Authentication**: ❌ Not Required
- **Request Body**: `RegistrationDTO`
- **Status**: ✅ Ready to use

#### Scenario 1: Register as Patient
```json
{
  "username": "patient1",
  "password": "password123",
  "roles": ["PATIENT"],
  "patientName": "John Doe",
  "patientAge": 30,
  "patientGender": "Male",
  "patientPhone": "+1234567890",
  "patientLocation": "New York, NY"
}
```

#### Scenario 2: Register as Doctor
```json
{
  "username": "doctor1",
  "password": "password123",
  "roles": ["DOCTOR"],
  "doctorName": "Dr. Sarah Smith",
  "hospitalName": "City General Hospital",
  "licenceNumber": "DOC12345",
  "qualification": "MBBS, MD",
  "experience": 5,
  "doctorLocation": "Boston, MA"
}
```

#### Scenario 3: Register as Hospital
```json
{
  "username": "hospital1",
  "password": "password123",
  "roles": ["HOSPITAL"],
  "hospitalName": "City General Hospital",
  "hospitalAddress": "123 Main Street, Boston, MA 02115",
  "hospitalContact": "+1-555-0100"
}
```

**Response Example:**
```json
{
  "message": "User registered successfully",
  "userId": 1,
  "username": "patient1",
  "roles": ["PATIENT"]
}
```

---

### 2. Login
- **Endpoint**: `POST /api/login`
- **Description**: Authenticate user and get JWT token
- **Authentication**: ❌ Not Required
- **Request Body**: `User`
- **Status**: ✅ Ready to use

**Request Example:**
```json
{
  "username": "patient1",
  "password": "password123"
}
```

**Response Example:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "username": "patient1",
  "roles": ["PATIENT"],
  "expiresIn": 3600
}
```

**Usage**: Include the token in subsequent requests:
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

---

### 3. Logout
- **Endpoint**: `POST /api/logout`
- **Description**: Logout user and invalidate session (client should discard JWT token)
- **Authentication**: ✅ Required
- **Status**: ✅ Ready to use

**Request Example:**
```
POST /api/logout
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Response Example:**
```json
"Logged out successfully"
```

**Note**: After logout, the client application should remove the JWT token from storage (localStorage/sessionStorage).

---

## Admin APIs
Base URL: `/api/admin`
**Authentication**: ✅ Required (Role: ADMIN)

### User Management

#### 4. Get User by ID
- **Endpoint**: `GET /api/admin/users/{userId}`
- **Description**: Retrieve a specific user's information
- **Path Variable**: `userId` (Long)
- **Response**: `UserDTO`
- **Status**: ✅ Ready to use

**Request Example:**
```
GET /api/admin/users/1
```

**Response Example:**
```json
{
  "id": 1,
  "username": "patient1",
  "roles": ["PATIENT"],
  "createdAt": "2026-05-15T10:00:00",
  "updatedAt": "2026-05-19T09:00:00"
}
```

---

### Hospital Management

#### 5. Get All Hospitals
- **Endpoint**: `GET /api/admin/hospitals`
- **Description**: Retrieve list of all hospitals
- **Response**: `List<HospitalDTO>`
- **Status**: ✅ Ready to use

**Response Example:**
```json
[
  {
    "id": 1,
    "name": "City General Hospital",
    "user": {
      "id": 2,
      "username": "hospital1",
      "roles": ["HOSPITAL"]
    },
    "address": "123 Main Street, Boston, MA 02115",
    "contact": "+1-555-0100",
    "authStatus": "PENDING",
    "rejectionReason": null,
    "updatedAt": "2026-05-19T10:30:00"
  },
  {
    "id": 2,
    "name": "Metro Health Center",
    "user": {
      "id": 5,
      "username": "hospital2",
      "roles": ["HOSPITAL"]
    },
    "address": "456 Oak Avenue, Boston, MA 02116",
    "contact": "+1-555-0200",
    "authStatus": "APPROVED",
    "rejectionReason": null,
    "updatedAt": "2026-05-18T14:20:00"
  }
]
```

---

#### 6. Get Hospital by ID
- **Endpoint**: `GET /api/admin/hospitals/{hospitalId}`
- **Description**: Retrieve a specific hospital's information
- **Path Variable**: `hospitalId` (Long)
- **Response**: `HospitalDTO`
- **Status**: ✅ Ready to use

**Request Example:**
```
GET /api/admin/hospitals/1
```

**Response Example:**
```json
{
  "id": 1,
  "name": "City General Hospital",
  "user": {
    "id": 2,
    "username": "hospital1",
    "roles": ["HOSPITAL"]
  },
  "address": "123 Main Street, Boston, MA 02115",
  "contact": "+1-555-0100",
  "authStatus": "APPROVED",
  "rejectionReason": null,
  "updatedAt": "2026-05-19T10:30:00"
}
```

---

#### 7. Approve Hospital
- **Endpoint**: `PATCH /api/admin/hospitals/{hospitalId}/approve`
- **Description**: Approve a pending hospital registration
- **Path Variable**: `hospitalId` (Long)
- **Response**: `HospitalDTO`
- **Status**: ✅ Ready to use

**Request Example:**
```
PATCH /api/admin/hospitals/1/approve
```

**Response Example:**
```json
{
  "id": 1,
  "name": "City General Hospital",
  "user": {
    "id": 2,
    "username": "hospital1",
    "roles": ["HOSPITAL"]
  },
  "address": "123 Main Street, Boston, MA 02115",
  "contact": "+1-555-0100",
  "authStatus": "APPROVED",
  "rejectionReason": null,
  "updatedAt": "2026-05-19T11:00:00"
}
```

---

#### 8. Reject Hospital
- **Endpoint**: `PATCH /api/admin/hospitals/{hospitalId}/reject`
- **Description**: Reject a pending hospital registration
- **Path Variable**: `hospitalId` (Long)
- **Response**: `HospitalDTO`
- **Status**: ✅ Ready to use

**Request Example:**
```
PATCH /api/admin/hospitals/1/reject
```

**Response Example:**
```json
{
  "id": 1,
  "name": "City General Hospital",
  "authStatus": "REJECTED",
  "rejectionReason": "Incomplete documentation",
  "updatedAt": "2026-05-19T11:00:00"
}
```

---

#### 9. Suspend Hospital
- **Endpoint**: `PATCH /api/admin/hospitals/{hospitalId}/suspend`
- **Description**: Suspend an active hospital
- **Path Variable**: `hospitalId` (Long)
- **Response**: `HospitalDTO`
- **Status**: ✅ Ready to use

**Request Example:**
```
PATCH /api/admin/hospitals/2/suspend
```

**Response Example:**
```json
{
  "id": 2,
  "name": "Metro Health Center",
  "authStatus": "SUSPENDED",
  "rejectionReason": "Under investigation",
  "updatedAt": "2026-05-19T11:30:00"
}
```

---

#### 10. Flag Hospital as Fraud
- **Endpoint**: `PATCH /api/admin/hospitals/{hospitalId}/fraud`
- **Description**: Mark hospital as fraudulent
- **Path Variable**: `hospitalId` (Long)
- **Response**: `HospitalDTO`
- **Status**: ✅ Ready to use

**Request Example:**
```
PATCH /api/admin/hospitals/3/fraud
```

**Response Example:**
```json
{
  "id": 3,
  "name": "Fake Hospital Inc",
  "authStatus": "FRAUD",
  "rejectionReason": "Fraudulent credentials detected",
  "updatedAt": "2026-05-19T12:00:00"
}
```

---

### User Management

#### 11. Get All Patients
- **Endpoint**: `GET /api/admin/patients`
- **Description**: Retrieve list of all patients
- **Response**: `List<PatientDTO>`
- **Status**: ✅ Ready to use

**Response Example:**
```json
[
  {
    "id": 1,
    "user": {
      "id": 1,
      "username": "patient1",
      "roles": ["PATIENT"]
    },
    "name": "John Doe",
    "age": 30,
    "gender": "Male",
    "phone": "+1234567890",
    "location": "New York, NY",
    "updatedAt": "2026-05-19T09:00:00"
  },
  {
    "id": 2,
    "user": {
      "id": 4,
      "username": "patient2",
      "roles": ["PATIENT"]
    },
    "name": "Jane Smith",
    "age": 28,
    "gender": "Female",
    "phone": "+1234567891",
    "location": "Los Angeles, CA",
    "updatedAt": "2026-05-18T15:30:00"
  }
]
```

---

#### 12. Get Patient by ID
- **Endpoint**: `GET /api/admin/patients/{patientId}`
- **Description**: Retrieve a specific patient's information
- **Path Variable**: `patientId` (Long)
- **Response**: `PatientDTO`
- **Status**: ✅ Ready to use

**Request Example:**
```
GET /api/admin/patients/1
```

**Response Example:**
```json
{
  "id": 1,
  "user": {
    "id": 1,
    "username": "patient1",
    "roles": ["PATIENT"]
  },
  "name": "John Doe",
  "age": 30,
  "gender": "Male",
  "phone": "+1234567890",
  "location": "New York, NY",
  "updatedAt": "2026-05-19T09:00:00"
}
```

---

#### 13. Get All Doctors
- **Endpoint**: `GET /api/admin/doctors`
- **Description**: Retrieve list of all doctors
- **Response**: `List<DoctorDTO>`
- **Status**: ✅ Ready to use

**Response Example:**
```json
[
  {
    "id": 1,
    "name": "Dr. Sarah Smith",
    "user": {
      "id": 3,
      "username": "doctor1",
      "roles": ["DOCTOR"]
    },
    "hospital": {
      "id": 1,
      "name": "City General Hospital"
    },
    "licenceNumber": "DOC12345",
    "qualification": "MBBS, MD",
    "experience": 5,
    "location": "Boston, MA",
    "authStatus": "APPROVED",
    "rejectionReason": null,
    "updatedAt": "2026-05-19T10:00:00"
  }
]
```

---

## Patient APIs
Base URL: `/api/patient`
**Authentication**: ✅ Required (Role: PATIENT)

#### 14. View Patient Profile
- **Endpoint**: `GET /api/patient/profile`
- **Description**: Get authenticated patient's profile
- **Response**: `PatientDTO`
- **Status**: ✅ Ready to use

**Response Example:**
```json
{
  "id": 1,
  "user": {
    "id": 1,
    "username": "patient1",
    "roles": ["PATIENT"]
  },
  "name": "John Doe",
  "age": 30,
  "gender": "Male",
  "phone": "+1234567890",
  "location": "New York, NY",
  "updatedAt": "2026-05-19T09:00:00"
}
```

---

#### 15. Delete Patient Profile
- **Endpoint**: `DELETE /api/patient/{patientId}`
- **Description**: Delete a patient account
- **Path Variable**: `patientId` (Long)
- **Response**: `void`
- **Status**: ✅ Ready to use

**Request Example:**
```
DELETE /api/patient/1
```

**Response**: `204 No Content`

---

#### 16. Get Patient Prescriptions
- **Endpoint**: `GET /api/patient/prescriptions`
- **Description**: Get all prescriptions for authenticated patient
- **Response**: `List<PrescriptionDTO>`
- **Status**: ✅ Ready to use

**Response Example:**
```json
[
  {
    "id": 1,
    "appointment": {
      "id": 1,
      "patientName": "John Doe",
      "doctorName": "Dr. Sarah Smith",
      "date": "2026-05-18"
    },
    "diagnosis": "Common cold with mild fever",
    "medicine": "1. Paracetamol 500mg - Take 1 tablet every 6 hours\n2. Vitamin C - Once daily\n3. Rest and hydration",
    "createdAt": "2026-05-18T16:30:00"
  }
]
```

---

#### 17. Get Prescription by ID (Patient View)
- **Endpoint**: `GET /api/patient/prescriptions/{prescriptionId}`
- **Description**: Get a specific prescription by ID
- **Path Variable**: `prescriptionId` (Long)
- **Response**: `PrescriptionDTO`
- **Status**: ✅ Ready to use

**Request Example:**
```
GET /api/patient/prescriptions/1
```

**Response Example:**
```json
{
  "id": 1,
  "appointment": {
    "id": 1,
    "patientName": "John Doe",
    "doctorName": "Dr. Sarah Smith",
    "date": "2026-05-18"
  },
  "diagnosis": "Common cold with mild fever",
  "medicine": "1. Paracetamol 500mg - Take 1 tablet every 6 hours\n2. Vitamin C - Once daily\n3. Rest and hydration",
  "createdAt": "2026-05-18T16:30:00"
}
```

---

### Appointment Management

#### 18. Get Patient Appointments
- **Endpoint**: `GET /api/patient/appointments`
- **Description**: Get all appointments for authenticated patient
- **Response**: `List<AppointmentDTO>`
- **Status**: ✅ Ready to use

**Response Example:**
```json
[
  {
    "id": 1,
    "patient": {
      "id": 1,
      "name": "John Doe"
    },
    "doctor": {
      "id": 1,
      "name": "Dr. Sarah Smith"
    },
    "appointmentDate": "2026-05-22",
    "appointmentTime": "10:00:00",
    "status": "CONFIRMED",
    "reason": "Regular checkup",
    "createdAt": "2026-05-20T09:00:00"
  },
  {
    "id": 2,
    "patient": {
      "id": 1,
      "name": "John Doe"
    },
    "doctor": {
      "id": 2,
      "name": "Dr. Michael Johnson"
    },
    "appointmentDate": "2026-05-25",
    "appointmentTime": "14:30:00",
    "status": "PENDING",
    "reason": "Follow-up consultation",
    "createdAt": "2026-05-20T11:30:00"
  }
]
```

---

#### 19. Book Appointment
- **Endpoint**: `POST /api/patient/doctors/{doctorId}/appointments`
- **Description**: Book a new appointment with a doctor
- **Path Variable**: `doctorId` (Long)
- **Request Body**: `AppointmentDTO`
- **Response**: `AppointmentDTO`
- **Status**: ✅ Ready to use

**Request Example:**
```json
{
  "appointmentDate": "2026-05-25",
  "appointmentTime": "14:30:00",
  "reason": "Follow-up consultation for recent illness"
}
```

**Response Example:**
```json
{
  "id": 3,
  "patient": {
    "id": 1,
    "name": "John Doe"
  },
  "doctor": {
    "id": 1,
    "name": "Dr. Sarah Smith"
  },
  "appointmentDate": "2026-05-25",
  "appointmentTime": "14:30:00",
  "status": "PENDING",
  "reason": "Follow-up consultation for recent illness",
  "createdAt": "2026-05-20T12:00:00"
}
```

---

#### 20. Cancel Appointment
- **Endpoint**: `PATCH /api/patient/appointments/{appointmentId}`
- **Description**: Cancel an existing appointment
- **Path Variable**: `appointmentId` (Long)
- **Response**: `AppointmentDTO`
- **Status**: ✅ Ready to use

**Request Example:**
```
PATCH /api/patient/appointments/3
```

**Response Example:**
```json
{
  "id": 3,
  "patient": {
    "id": 1,
    "name": "John Doe"
  },
  "doctor": {
    "id": 1,
    "name": "Dr. Sarah Smith"
  },
  "appointmentDate": "2026-05-25",
  "appointmentTime": "14:30:00",
  "status": "CANCELLED",
  "reason": "Follow-up consultation for recent illness",
  "createdAt": "2026-05-20T12:00:00",
  "updatedAt": "2026-05-20T13:00:00"
}
```

---

## Doctor APIs
Base URL: `/api/doctors`
**Authentication**: ✅ Required (Role: DOCTOR)

#### 21. Update Doctor Profile
- **Endpoint**: `PATCH /api/doctors/profile`
- **Description**: Update doctor profile information
- **Request Body**: `DoctorDTO`
- **Response**: `DoctorDTO`
- **Status**: ✅ Ready to use

**Request Example:**
```json
{
  "id": 1,
  "name": "Dr. Sarah Smith",
  "qualification": "MBBS, MD, Fellowship in Cardiology",
  "experience": 6,
  "location": "Boston, MA"
}
```

**Response Example:**
```json
{
  "id": 1,
  "name": "Dr. Sarah Smith",
  "user": {
    "id": 3,
    "username": "doctor1",
    "roles": ["DOCTOR"]
  },
  "hospital": {
    "id": 1,
    "name": "City General Hospital"
  },
  "licenceNumber": "DOC12345",
  "qualification": "MBBS, MD, Fellowship in Cardiology",
  "experience": 6,
  "location": "Boston, MA",
  "authStatus": "APPROVED",
  "rejectionReason": null,
  "updatedAt": "2026-05-19T13:00:00"
}
```

---

### Prescription Management

#### 22. Create Prescription
- **Endpoint**: `POST /api/doctors/prescriptions/appointment/{appointmentId}`
- **Description**: Create a new prescription for an appointment
- **Path Variable**: `appointmentId` (Long)
- **Request Body**: `PrescriptionDTO`
- **Response**: `PrescriptionDTO`
- **Status**: ✅ Ready to use

**Request Example:**
```json
{
  "diagnosis": "Acute bronchitis with productive cough",
  "medicine": "1. Azithromycin 500mg - Once daily for 5 days\n2. Cough syrup - 2 teaspoons three times daily\n3. Steam inhalation twice daily\n4. Avoid cold drinks"
}
```

**Response Example:**
```json
{
  "id": 2,
  "appointment": {
    "id": 5,
    "patientName": "John Doe",
    "doctorName": "Dr. Sarah Smith",
    "date": "2026-05-19"
  },
  "diagnosis": "Acute bronchitis with productive cough",
  "medicine": "1. Azithromycin 500mg - Once daily for 5 days\n2. Cough syrup - 2 teaspoons three times daily\n3. Steam inhalation twice daily\n4. Avoid cold drinks",
  "createdAt": "2026-05-19T14:30:00"
}
```

---

#### 23. Get Prescription by ID
- **Endpoint**: `GET /api/doctors/prescriptions/{prescriptionId}`
- **Description**: Retrieve a specific prescription
- **Path Variable**: `prescriptionId` (Long)
- **Response**: `PrescriptionDTO`
- **Status**: ✅ Ready to use

**Request Example:**
```
GET /api/doctors/prescriptions/1
```

**Response Example:**
```json
{
  "id": 1,
  "appointment": {
    "id": 1,
    "patientName": "John Doe",
    "doctorName": "Dr. Sarah Smith",
    "date": "2026-05-18"
  },
  "diagnosis": "Common cold with mild fever",
  "medicine": "1. Paracetamol 500mg - Take 1 tablet every 6 hours\n2. Vitamin C - Once daily\n3. Rest and hydration",
  "createdAt": "2026-05-18T16:30:00"
}
```

---

#### 24. Get Patient Prescriptions (Doctor View)
- **Endpoint**: `GET /api/doctors/prescriptions/patient/{patientId}`
- **Description**: Get all prescriptions for a specific patient
- **Path Variable**: `patientId` (Long)
- **Response**: `List<PrescriptionDTO>`
- **Status**: ✅ Ready to use

**Request Example:**
```
GET /api/doctors/prescriptions/patient/1
```

**Response Example:**
```json
[
  {
    "id": 1,
    "appointment": {
      "id": 1,
      "patientName": "John Doe",
      "doctorName": "Dr. Sarah Smith",
      "date": "2026-05-18"
    },
    "diagnosis": "Common cold with mild fever",
    "medicine": "1. Paracetamol 500mg - Take 1 tablet every 6 hours\n2. Vitamin C - Once daily\n3. Rest and hydration",
    "createdAt": "2026-05-18T16:30:00"
  },
  {
    "id": 2,
    "appointment": {
      "id": 5,
      "patientName": "John Doe",
      "doctorName": "Dr. Sarah Smith",
      "date": "2026-05-19"
    },
    "diagnosis": "Acute bronchitis with productive cough",
    "medicine": "1. Azithromycin 500mg - Once daily for 5 days\n2. Cough syrup - 2 teaspoons three times daily",
    "createdAt": "2026-05-19T14:30:00"
  }
]
```

---

## Hospital APIs
Base URL: `/api/hospital`
**Authentication**: ✅ Required (Role: HOSPITAL)

### Doctor Management

#### 25. Get All Doctors of Hospital
- **Endpoint**: `GET /api/hospital/doctors`
- **Description**: Get all doctors working at the authenticated hospital
- **Response**: `List<DoctorDTO>`
- **Status**: ✅ Ready to use

**Request Example:**
```
GET /api/hospital/doctors
Authorization: Bearer <hospital-jwt-token>
```

**Response Example:**
```json
[
  {
    "id": 1,
    "name": "Dr. Sarah Smith",
    "user": {
      "id": 3,
      "username": "doctor1",
      "roles": ["DOCTOR"]
    },
    "hospital": {
      "id": 1,
      "name": "City General Hospital"
    },
    "licenceNumber": "DOC12345",
    "qualification": "MBBS, MD",
    "experience": 5,
    "location": "Boston, MA",
    "authStatus": "APPROVED",
    "rejectionReason": null,
    "updatedAt": "2026-05-19T10:00:00"
  },
  {
    "id": 2,
    "name": "Dr. Michael Johnson",
    "user": {
      "id": 6,
      "username": "doctor2",
      "roles": ["DOCTOR"]
    },
    "hospital": {
      "id": 1,
      "name": "City General Hospital"
    },
    "licenceNumber": "DOC67890",
    "qualification": "MBBS, MS (Surgery)",
    "experience": 8,
    "location": "Boston, MA",
    "authStatus": "PENDING",
    "rejectionReason": null,
    "updatedAt": "2026-05-19T11:30:00"
  }
]
```

---

#### 26. Get Doctors by Status
- **Endpoint**: `GET /api/hospital/doctors/{status}`
- **Description**: Get doctors filtered by approval status
- **Path Variable**: `status` (String) - Values: `PENDING`, `APPROVED`, `REJECTED`, `SUSPENDED`, `FRAUD`
- **Response**: `List<DoctorDTO>`
- **Status**: ✅ Ready to use

**Request Example:**
```
GET /api/hospital/doctors/PENDING
```

**Response Example:**
```json
[
  {
    "id": 2,
    "name": "Dr. Michael Johnson",
    "user": {
      "id": 6,
      "username": "doctor2",
      "roles": ["DOCTOR"]
    },
    "hospital": {
      "id": 1,
      "name": "City General Hospital"
    },
    "licenceNumber": "DOC67890",
    "qualification": "MBBS, MS (Surgery)",
    "experience": 8,
    "location": "Boston, MA",
    "authStatus": "PENDING",
    "rejectionReason": null,
    "updatedAt": "2026-05-19T11:30:00"
  }
]
```

---

#### 27. Approve Doctor
- **Endpoint**: `PATCH /api/hospital/doctors/{doctorId}/approve`
- **Description**: Approve a doctor's registration to the hospital
- **Path Variable**: `doctorId` (Long)
- **Response**: `DoctorDTO`
- **Status**: ✅ Ready to use

**Request Example:**
```
PATCH /api/hospital/doctors/2/approve
```

**Response Example:**
```json
{
  "id": 2,
  "name": "Dr. Michael Johnson",
  "authStatus": "APPROVED",
  "rejectionReason": null,
  "updatedAt": "2026-05-19T15:00:00"
}
```

---

#### 28. Reject Doctor
- **Endpoint**: `PATCH /api/hospital/doctors/{doctorId}/reject`
- **Description**: Reject a doctor's registration to the hospital
- **Path Variable**: `doctorId` (Long)
- **Response**: `DoctorDTO`
- **Status**: ✅ Ready to use

**Request Example:**
```
PATCH /api/hospital/doctors/3/reject
```

**Response Example:**
```json
{
  "id": 3,
  "name": "Dr. Robert Brown",
  "authStatus": "REJECTED",
  "rejectionReason": "Incomplete verification documents",
  "updatedAt": "2026-05-19T15:30:00"
}
```

---

## Common Notes

### Authentication
- Include the JWT token in the `Authorization` header as:
  ```
  Authorization: Bearer <your-jwt-token>
  ```
- Obtain the token from the `/api/login` endpoint
- Tokens typically expire after 1 hour (3600 seconds)

### Status Codes
- `200 OK` - Successful request
- `201 Created` - Resource created successfully
- `204 No Content` - Successful deletion
- `400 Bad Request` - Invalid request data
- `401 Unauthorized` - Authentication required or failed
- `403 Forbidden` - Insufficient permissions
- `404 Not Found` - Resource not found
- `500 Internal Server Error` - Server error

### Enums Reference

**Role**:
- `ADMIN` - System administrator
- `HOSPITAL` - Hospital account
- `DOCTOR` - Doctor account
- `PATIENT` - Patient account

**AuthStatus**:
- `PENDING` - Awaiting approval
- `APPROVED` - Approved and active
- `REJECTED` - Application rejected
- `SUSPENDED` - Temporarily suspended
- `FRAUD` - Flagged as fraudulent

**BookingStatus** (Appointment Status):
- `PENDING` - Appointment requested, awaiting confirmation
- `CONFIRMED` - Appointment confirmed
- `COMPLETED` - Appointment completed
- `CANCELLED` - Appointment cancelled
- `NO_SHOW` - Patient did not show up

---

**Total APIs Ready**: 28 endpoints  
**Last Updated**: May 20, 2026  
**API Version**: 1.0
