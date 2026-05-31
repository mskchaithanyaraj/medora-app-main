package com.medora.app.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class ReviewDTO {

    private long id;

    private DoctorDTO doctor;

    private PatientDTO patient;

    private int  rating;

    private String comment;

    private LocalDateTime createdAt;

}
