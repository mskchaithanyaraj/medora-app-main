package com.medora.app.service;

import com.medora.app.constants.AuthStatus;
import com.medora.app.constants.BookingStatus;
import com.medora.app.dto.AppointmentDTO;
import com.medora.app.entity.Appointment;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

public interface AppointmentService {
    List<AppointmentDTO> getAllAppointments();

    AppointmentDTO bookAppointment(Long doctorId, AppointmentDTO appointment);

    Appointment saveAppointment(Appointment appointment);
    // for patients only
    List<AppointmentDTO> getPatientAppointments();
    List<AppointmentDTO> getPatientAppointmentsByBookingStatus(BookingStatus bookingStatus);


    AppointmentDTO updateBookingStatus(long appointmentId, String status);
    AppointmentDTO cancelAppointment(long appointmentId);
    AppointmentDTO getAppointmentDTO(long id);
    Appointment getAppointment(long id);

    //for doctor controller only
    List<AppointmentDTO> getDoctorAppointmentsByDate(LocalDate date);
    List<AppointmentDTO> getDoctorAppointments();
    List<AppointmentDTO> getDoctorAppointmentsByBookingStatus(BookingStatus bookingStatus);

    List<Appointment> findByDoctorIdAndAppointmentDate(Long doctorId, LocalDate date);
    List<Appointment> findByAppointmentDateAndBookingStatus(LocalDate date, BookingStatus bookingStatus);

    // for hospital controller
    List<AppointmentDTO> getHospitalAppointments();
}
