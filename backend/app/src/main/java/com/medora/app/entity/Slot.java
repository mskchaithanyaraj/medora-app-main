package com.medora.app.entity;

import com.medora.app.constants.SlotStatus;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;



@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Slot {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "doctor_id")
    private Doctor doctor;

    private LocalDate date;

    @Enumerated(EnumType.STRING)
    private SlotStatus morning;

    @Enumerated(EnumType.STRING)
    private SlotStatus preNoon;

    @Enumerated(EnumType.STRING)
    private SlotStatus afterNoon;

    @Enumerated(EnumType.STRING)
    private SlotStatus evening;

    @Enumerated(EnumType.STRING)
    private SlotStatus night;
}


