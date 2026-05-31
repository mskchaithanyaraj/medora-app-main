package com.medora.app.entity;

import com.medora.app.constants.ReportStatus;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Data
@AllArgsConstructor
@NoArgsConstructor
public class FraudReport {

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
    private ReportStatus reportStatus;

    @Column(length = 200)
    private String reason;

    private LocalDateTime createdAt;

    @PrePersist
    public void onCreate(){
        createdAt=LocalDateTime.now();
    }
}
