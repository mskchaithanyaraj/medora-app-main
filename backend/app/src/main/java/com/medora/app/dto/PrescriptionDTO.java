package com.medora.app.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class PrescriptionDTO {

    private long id;

    private AppointmentDTO appointment;

    private String diagnosis;

    private String medicine;

    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;

}
