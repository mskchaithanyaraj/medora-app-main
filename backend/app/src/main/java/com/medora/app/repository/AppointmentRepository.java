package com.medora.app.repository;

import com.medora.app.constants.BookingStatus;
import com.medora.app.entity.Appointment;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

public interface AppointmentRepository extends JpaRepository<Appointment, Long> {

    List<Appointment> findByDoctorIdOrderByAppointmentDateAsc(Long doctorId);

    List<Appointment> findByPatientIdOrderByAppointmentDateDesc(Long patientId);

    List<Appointment> findByDoctorIdAndAppointmentDate(Long doctorId, LocalDate date);

    List<Appointment> findByAppointmentDateAndBookingStatus(
            LocalDate date,
            BookingStatus status
    );

    List<Appointment> findByBookingStatus(BookingStatus status);

}
