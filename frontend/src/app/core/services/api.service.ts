import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  Patient,
  Doctor,
  Hospital,
  Appointment,
  AppointmentRequest,
  Prescription,
  PrescriptionRequest,
  UserDTO,
  Slot,
  Query,
  Reply,
  Review,
  FraudReport
} from '../models/user.model';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private readonly API_URL = environment.apiUrl;
  
  private http = inject(HttpClient);

  // ==================== PATIENT APIs ====================
  
  getPatientProfile(): Observable<Patient> {
    return this.http.get<Patient>(`${this.API_URL}/patient/profile`);
  }

  updatePatientProfile(data: Partial<Patient>): Observable<Patient> {
    return this.http.put<Patient>(`${this.API_URL}/patient/profile`, data);
  }

  changePatientPassword(data: { oldPassword: string; newPassword: string }): Observable<string> {
    return this.http.patch(`${this.API_URL}/patient/password`, data, { responseType: 'text' });
  }

  deletePatientProfile(patientId: number): Observable<void> {
    return this.http.delete<void>(`${this.API_URL}/patient/${patientId}`);
  }

  getPatientDoctors(): Observable<Doctor[]> {
    return this.http.get<Doctor[]>(`${this.API_URL}/patient/doctors`);
  }

  getDoctorSlots(doctorId: number, date: string): Observable<Slot> {
    return this.http.get<Slot>(`${this.API_URL}/patient/doctors/${doctorId}/slots/${date}`);
  }

  getPatientAppointments(): Observable<Appointment[]> {
    return this.http.get<Appointment[]>(`${this.API_URL}/patient/appointments`);
  }

  bookAppointment(doctorId: number, data: AppointmentRequest): Observable<Appointment> {
    return this.http.post<Appointment>(`${this.API_URL}/patient/doctors/${doctorId}/appointments`, data);
  }

  cancelAppointment(appointmentId: number): Observable<Appointment> {
    return this.http.patch<Appointment>(`${this.API_URL}/patient/appointments/${appointmentId}`, {});
  }

  getPatientPrescriptions(): Observable<Prescription[]> {
    return this.http.get<Prescription[]>(`${this.API_URL}/patient/prescriptions`);
  }

  getPatientPrescriptionById(prescriptionId: number): Observable<Prescription> {
    return this.http.get<Prescription>(`${this.API_URL}/patient/prescriptions/${prescriptionId}`);
  }

  // Patient Reviews
  getPatientReviews(): Observable<Review[]> {
    return this.http.get<Review[]>(`${this.API_URL}/patient/reviews`);
  }

  getDoctorReviews(doctorId: number): Observable<Review[]> {
    return this.http.get<Review[]>(`${this.API_URL}/patient/doctors/${doctorId}/reviews`);
  }

  postReview(doctorId: number, data: Partial<Review>): Observable<Review> {
    return this.http.post<Review>(`${this.API_URL}/patient/doctors/${doctorId}/reviews`, data);
  }

  deleteReview(reviewId: number): Observable<any> {
    return this.http.delete(`${this.API_URL}/patient/reviews/${reviewId}`);
  }

  // Patient Fraud Reports
  getPatientFraudReports(): Observable<FraudReport[]> {
    return this.http.get<FraudReport[]>(`${this.API_URL}/patient/fraud-reports`);
  }

  postFraudReport(doctorId: number, data: Partial<FraudReport>): Observable<FraudReport> {
    return this.http.post<FraudReport>(`${this.API_URL}/patient/doctors/${doctorId}/fraud-reports`, data);
  }

  // Patient Queries
  getPatientQueries(): Observable<Query[]> {
    return this.http.get<Query[]>(`${this.API_URL}/patient/queries`);
  }

  postQuery(data: Partial<Query>): Observable<Query> {
    return this.http.post<Query>(`${this.API_URL}/patient/queries`, data);
  }

  deleteQuery(queryId: number): Observable<any> {
    return this.http.delete(`${this.API_URL}/patient/queries/${queryId}`);
  }

  getPatientQueryReplies(queryId: number): Observable<Reply[]> {
    return this.http.get<Reply[]>(`${this.API_URL}/patient/queries/${queryId}/replies`);
  }

  // ==================== DOCTOR APIs ====================

  getDoctorProfile(): Observable<Doctor> {
    return this.http.get<Doctor>(`${this.API_URL}/doctor/profile`);
  }

  updateDoctorProfile(data: Partial<Doctor>): Observable<Doctor> {
    return this.http.put<Doctor>(`${this.API_URL}/doctor/profile`, data);
  }

  changeDoctorPassword(data: { oldPassword: string; newPassword: string }): Observable<string> {
    return this.http.patch(`${this.API_URL}/doctor/password`, data, { responseType: 'text' });
  }

  provideSlots(doctorId: number): Observable<any> {
    return this.http.post(`${this.API_URL}/doctor/${doctorId}/slots`, {});
  }

  getDoctorAppointments(): Observable<Appointment[]> {
    return this.http.get<Appointment[]>(`${this.API_URL}/doctor/appointments`);
  }

  getDoctorAppointmentById(appointmentId: number): Observable<Appointment> {
    return this.http.get<Appointment>(`${this.API_URL}/doctor/appointments/${appointmentId}`);
  }

  getDoctorBookedAppointments(): Observable<Appointment[]> {
    return this.http.get<Appointment[]>(`${this.API_URL}/doctor/appointments/booked`);
  }

  getDoctorCompletedAppointments(): Observable<Appointment[]> {
    return this.http.get<Appointment[]>(`${this.API_URL}/doctor/appointments/completed`);
  }

  getDoctorCancelledAppointments(): Observable<Appointment[]> {
    return this.http.get<Appointment[]>(`${this.API_URL}/doctor/appointments/cancelled`);
  }

  createPrescription(appointmentId: number, data: PrescriptionRequest): Observable<Prescription> {
    return this.http.post<Prescription>(`${this.API_URL}/doctor/appointments/${appointmentId}/prescriptions`, data);
  }

  getDoctorPrescriptionById(prescriptionId: number): Observable<Prescription> {
    return this.http.get<Prescription>(`${this.API_URL}/doctor/prescriptions/${prescriptionId}`);
  }

  getPatientPrescriptionsByDoctor(patientId: number): Observable<Prescription[]> {
    return this.http.get<Prescription[]>(`${this.API_URL}/doctor/prescriptions/patients/${patientId}`);
  }

  deletePrescription(prescriptionId: number): Observable<any> {
    return this.http.delete(`${this.API_URL}/doctor/prescriptions/${prescriptionId}`);
  }

  updatePrescription(prescriptionId: number, data: PrescriptionRequest): Observable<Prescription> {
    return this.http.put<Prescription>(`${this.API_URL}/doctor/prescriptions/${prescriptionId}`, data, {
      headers: { 'Content-Type': 'application/json' }
    });
  }

  getDoctorReviewsForDoctor(): Observable<Review[]> {
    return this.http.get<Review[]>(`${this.API_URL}/doctor/reviews`);
  }

  // Doctor Queries & Replies
  getDoctorQueries(): Observable<Query[]> {
    return this.http.get<Query[]>(`${this.API_URL}/doctor/queries`);
  }

  getDoctorQueryReplies(queryId: number): Observable<Reply[]> {
    return this.http.get<Reply[]>(`${this.API_URL}/doctor/queries/${queryId}/replies`);
  }

  postDoctorReply(queryId: number, data: Partial<Reply>): Observable<Reply> {
    return this.http.post<Reply>(`${this.API_URL}/doctor/queries/${queryId}/replies`, data);
  }

  deleteDoctorReply(replyId: number): Observable<any> {
    return this.http.delete(`${this.API_URL}/doctor/replies/${replyId}`);
  }

  // ==================== HOSPITAL APIs ====================

  getHospitalProfile(): Observable<Hospital> {
    return this.http.get<Hospital>(`${this.API_URL}/hospital/profile`);
  }

  updateHospitalProfile(data: Partial<Hospital>): Observable<Hospital> {
    return this.http.put<Hospital>(`${this.API_URL}/hospital/profile`, data);
  }

  changeHospitalPassword(data: { oldPassword: string; newPassword: string }): Observable<string> {
    return this.http.patch(`${this.API_URL}/hospital/password`, data, { responseType: 'text' });
  }

  getHospitalDoctors(): Observable<Doctor[]> {
    return this.http.get<Doctor[]>(`${this.API_URL}/hospital/doctors`);
  }

  getHospitalDoctorsByStatus(status: string): Observable<Doctor[]> {
    return this.http.get<Doctor[]>(`${this.API_URL}/hospital/doctors/${status.toLowerCase()}`);
  }

  approveDoctor(doctorId: number): Observable<Doctor> {
    return this.http.patch<Doctor>(`${this.API_URL}/hospital/doctors/${doctorId}/approve`, {});
  }

  rejectDoctor(doctorId: number, data: Partial<Doctor>): Observable<Doctor> {
    return this.http.patch<Doctor>(`${this.API_URL}/hospital/doctors/${doctorId}/reject`, data);
  }

  suspendDoctor(doctorId: number, data: Partial<Doctor>): Observable<Doctor> {
    return this.http.patch<Doctor>(`${this.API_URL}/hospital/doctors/${doctorId}/suspend`, data);
  }

  markDoctorFraud(doctorId: number, data: Partial<Doctor>): Observable<Doctor> {
    return this.http.patch<Doctor>(`${this.API_URL}/hospital/doctors/${doctorId}/fraud`, data);
  }

  getHospitalAppointments(): Observable<Appointment[]> {
    return this.http.get<Appointment[]>(`${this.API_URL}/hospital/appointments`);
  }

  // Hospital Queries & Replies
  getHospitalQueries(): Observable<Query[]> {
    return this.http.get<Query[]>(`${this.API_URL}/hospital/queries`);
  }

  getHospitalQueryReplies(queryId: number): Observable<Reply[]> {
    return this.http.get<Reply[]>(`${this.API_URL}/hospital/queries/${queryId}/replies`);
  }

  postHospitalReply(queryId: number, data: Partial<Reply>): Observable<Reply> {
    return this.http.post<Reply>(`${this.API_URL}/hospital/queries/${queryId}/replies`, data);
  }

  deleteHospitalReply(replyId: number): Observable<any> {
    return this.http.delete(`${this.API_URL}/hospital/replies/${replyId}`);
  }

  // ==================== ADMIN APIs ====================

  getAdminProfile(): Observable<UserDTO> {
    return this.http.get<UserDTO>(`${this.API_URL}/admin/profile`);
  }

  getUserById(userId: number): Observable<UserDTO> {
    return this.http.get<UserDTO>(`${this.API_URL}/admin/users/${userId}`);
  }

  getHospitalNames(): Observable<string[]> {
    return this.http.get<string[]>(`${this.API_URL}/hospitals`);
  }

  getAllHospitals(): Observable<Hospital[]> {
    return this.http.get<Hospital[]>(`${this.API_URL}/admin/hospitals`);
  }

  getHospitalById(hospitalId: number): Observable<Hospital> {
    return this.http.get<Hospital>(`${this.API_URL}/admin/hospitals/${hospitalId}`);
  }

  approveHospital(hospitalId: number): Observable<Hospital> {
    return this.http.patch<Hospital>(`${this.API_URL}/admin/hospitals/${hospitalId}/approve`, {});
  }

  rejectHospital(hospitalId: number, data: Partial<Hospital>): Observable<Hospital> {
    return this.http.patch<Hospital>(`${this.API_URL}/admin/hospitals/${hospitalId}/reject`, data);
  }

  suspendHospital(hospitalId: number, data: Partial<Hospital>): Observable<Hospital> {
    return this.http.patch<Hospital>(`${this.API_URL}/admin/hospitals/${hospitalId}/suspend`, data);
  }

  flagHospitalAsFraud(hospitalId: number, data: Partial<Hospital>): Observable<Hospital> {
    return this.http.patch<Hospital>(`${this.API_URL}/admin/hospitals/${hospitalId}/fraud`, data);
  }

  getAllPatients(): Observable<Patient[]> {
    return this.http.get<Patient[]>(`${this.API_URL}/admin/patients`);
  }

  getPatientById(patientId: number): Observable<Patient> {
    return this.http.get<Patient>(`${this.API_URL}/admin/patients/${patientId}`);
  }

  getAllDoctors(): Observable<Doctor[]> {
    return this.http.get<Doctor[]>(`${this.API_URL}/admin/doctors`);
  }

  getDoctorById(doctorId: number): Observable<Doctor> {
    return this.http.get<Doctor>(`${this.API_URL}/admin/doctors/${doctorId}`);
  }

  // Admin Fraud Reports
  getAllFraudReports(): Observable<FraudReport[]> {
    return this.http.get<FraudReport[]>(`${this.API_URL}/admin/fraud-reports`);
  }

  getFraudReportsByStatus(status: string): Observable<FraudReport[]> {
    return this.http.get<FraudReport[]>(`${this.API_URL}/admin/fraud-reports/${status.toLowerCase()}`);
  }

  reviewFraudReport(fraudReportId: number): Observable<FraudReport> {
    return this.http.patch<FraudReport>(`${this.API_URL}/admin/fraud-reports/${fraudReportId}/review`, {});
  }

  resolveFraudReport(fraudReportId: number): Observable<FraudReport> {
    return this.http.patch<FraudReport>(`${this.API_URL}/admin/fraud-reports/${fraudReportId}/resolve`, {});
  }

  // Admin Queries & Replies
  getAdminQueries(): Observable<Query[]> {
    return this.http.get<Query[]>(`${this.API_URL}/admin/queries`);
  }

  getAdminQueryReplies(queryId: number): Observable<Reply[]> {
    return this.http.get<Reply[]>(`${this.API_URL}/admin/queries/${queryId}/replies`);
  }

  postAdminReply(queryId: number, data: Partial<Reply>): Observable<Reply> {
    return this.http.post<Reply>(`${this.API_URL}/admin/queries/${queryId}/replies`, data);
  }

  deleteAdminReply(replyId: number): Observable<any> {
    return this.http.delete(`${this.API_URL}/admin/replies/${replyId}`);
  }
}
