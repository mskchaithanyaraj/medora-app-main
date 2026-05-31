package com.medora.app.dto;

import com.medora.app.constants.BookingStatus;
import com.medora.app.constants.SlotType;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class AppointmentDTO {

    private long id;

    private DoctorDTO doctor;

    private PatientDTO patient;

    private BookingStatus bookingStatus;

    private LocalDate appointmentDate;

    @Enumerated(EnumType.STRING)
    private SlotType slotType;

    private String problem;

    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;
}
