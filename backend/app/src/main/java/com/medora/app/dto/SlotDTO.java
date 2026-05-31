package com.medora.app.dto;

import com.medora.app.constants.SlotStatus;
import com.medora.app.constants.SlotType;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class SlotDTO {

    private Long id;

    private DoctorDTO doctor;

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
