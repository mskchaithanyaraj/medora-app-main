package com.medora.app.dto;

import com.medora.app.constants.ReportStatus;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class FraudReportDTO {

    private long id;

    private DoctorDTO doctor;

    private PatientDTO patient;

    private ReportStatus reportStatus;

    private String reason;

    private LocalDateTime createdAt;

}
