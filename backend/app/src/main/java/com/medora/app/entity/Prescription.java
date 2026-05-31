package com.medora.app.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Data
@AllArgsConstructor
@NoArgsConstructor
public class Prescription {

    @Id
    private long id;

    @OneToOne
    @MapsId
    @JoinColumn(name = "appointment_id")
    private Appointment appointment;

    @Column(nullable = false, length = 2000)
    private String diagnosis;

    @Column(nullable = false, length = 2000)
    private String medicine;

    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;

    @PrePersist
    public void onCreate(){
        createdAt=LocalDateTime.now();
    }

    @PreUpdate
    public void onUpdate(){
        createdAt=LocalDateTime.now();
    }

}
