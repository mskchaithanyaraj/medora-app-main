// User roles
export type UserRole = 'ADMIN' | 'HOSPITAL' | 'DOCTOR' | 'PATIENT';

// Auth status for hospitals and doctors
export type AuthStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'SUSPENDED' | 'FRAUD';

// Booking status for appointments
export type BookingStatus = 'BOOKED' | 'WAITING_LIST' | 'COMPLETED' | 'CANCELLED';

// Slot status
export type SlotStatus = 'AVAILABLE' | 'BOOKED';

// Slot types for booking
export type SlotType = 'MORNING' | 'PRE_NOON' | 'AFTER_NOON' | 'EVENING' | 'NIGHT';

// Report status for fraud reports
export type ReportStatus = 'OPEN' | 'REVIEWED' | 'RESOLVED';

// Base user interface
export interface User {
  id: number;
  username: string;
  roles: UserRole[];
  createdAt?: string;
  updatedAt?: string;
}

// Login request/response
export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  username: string;
  roles: UserRole[];
  expiresIn: number;
}

// Registration request
export interface RegistrationRequest {
  username: string;
  password: string;
  roles: UserRole[];
  // Patient fields
  patientName?: string;
  patientAge?: number;
  patientGender?: string;
  patientPhone?: string;
  patientLocation?: string;
  // Doctor fields
  doctorName?: string;
  hospitalName?: string;
  licenceNumber?: string;
  qualification?: string;
  experience?: number;
  doctorLocation?: string;
  // Hospital fields
  hospitalAddress?: string;
  hospitalContact?: string;
}

export interface RegistrationResponse {
  message: string;
  userId: number;
  username: string;
  roles: UserRole[];
}

// Patient interface
export interface Patient {
  id: number;
  user: User;
  name: string;
  age: number;
  gender: string;
  phone: string;
  location: string;
  updatedAt?: string;
}

// Doctor interface
export interface Doctor {
  id: number;
  name: string;
  user: User;
  hospital: {
    id: number;
    name: string;
  };
  licenceNumber: string;
  qualification: string;
  experience: number;
  location: string;
  authStatus: AuthStatus;
  rejectionReason?: string;
  updatedAt?: string;
}

// Hospital interface
export interface Hospital {
  id: number;
  name: string;
  user: User;
  address: string;
  contact: string;
  location?: string;
  authStatus: AuthStatus;
  rejectionReason?: string;
  updatedAt?: string;
}

// Slot interface (matches backend entity structure)
export interface Slot {
  id: number;
  doctor?: Doctor;
  date: string;
  slotType?: SlotType;
  slotStatus?: SlotStatus;
  // Entity fields (individual slot statuses)
  morning?: SlotStatus;
  preNoon?: SlotStatus;
  afterNoon?: SlotStatus;
  evening?: SlotStatus;
  night?: SlotStatus;
}

// Appointment interface
export interface Appointment {
  id: number;
  patient: {
    id: number;
    name: string;
  };
  doctor: {
    id: number;
    name: string;
  };
  appointmentDate: string;
  slotType: SlotType;
  bookingStatus: BookingStatus;
  problem: string;
  createdAt?: string;
  updatedAt?: string;
}

// Appointment booking request
export interface AppointmentRequest {
  appointmentDate: string;
  slotType: SlotType;
  problem: string;
}

// Prescription interface
export interface Prescription {
  id: number;
  appointment: {
    id: number;
    patient: { id: number; name: string };
    doctor: { id: number; name: string };
    appointmentDate: string;
  };
  diagnosis: string;
  medicine: string;
  createdAt?: string;
}

// Prescription create request
export interface PrescriptionRequest {
  diagnosis: string;
  medicine: string;
}

// Query interface (patient questions)
export interface Query {
  id: number;
  patient: { id: number; name: string };
  message: string;
  createdAt?: string;
}

// Reply interface
export interface Reply {
  id: number;
  repliedUser: { id: number; username: string; roles: UserRole[] };
  query?: { id: number };
  message: string;
  createdAt?: string;
}

// Review interface
export interface Review {
  id: number;
  patient: { id: number; name: string };
  doctor: { id: number; name: string };
  rating: number;
  comment: string;
  createdAt?: string;
}

// Fraud Report interface
export interface FraudReport {
  id: number;
  patient: { id: number; name: string; phone?: string; location?: string; age?: number; gender?: string };
  doctor: { id: number; name: string; qualification?: string; experience?: number; location?: string; licenceNumber?: string; hospital?: { id: number; name: string } };
  reason: string;
  reportStatus: ReportStatus;
  createdAt?: string;
}

// User DTO for admin view
export interface UserDTO {
  id: number;
  username: string;
  roles: UserRole[];
  createdAt?: string;
  updatedAt?: string;
}

// Current user state
export interface CurrentUser {
  token: string;
  username: string;
  roles: UserRole[];
  expiresAt: number;
  patient?: Patient;
  doctor?: Doctor;
  hospital?: Hospital;
}
