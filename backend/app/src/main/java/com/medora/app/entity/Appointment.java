package com.medora.app.entity;

import com.medora.app.constants.BookingStatus;
import com.medora.app.constants.SlotType;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;

@Entity
@Data
@AllArgsConstructor
@NoArgsConstructor
public class Appointment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private long id;

    @ManyToOne
    @JoinColumn(name = "doctor_id")
    private Doctor doctor;

    @ManyToOne
    @JoinColumn(name = "patient_id")
    private Patient patient;

    @Column(nullable = false)
    private BookingStatus bookingStatus;

    private LocalDate appointmentDate;

    @Enumerated(EnumType.STRING)
    private SlotType slotType;

    @Column(nullable = false, length = 2000)
    private String problem;

    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;

    @PrePersist
    public void onCreate(){
        createdAt=LocalDateTime.now();
    }

    @PreUpdate
    public void onUpdate(){
        updatedAt=LocalDateTime.now();
    }
}
