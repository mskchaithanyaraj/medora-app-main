package com.medora.app.service;

import com.medora.app.constants.ReportStatus;
import com.medora.app.dto.FraudReportDTO;
import com.medora.app.entity.FraudReport;

import java.util.List;

public interface FraudReportService {
    List<FraudReportDTO> getAllFraudReports();
    List<FraudReportDTO> getAllFraudReportsByStatus(ReportStatus reportStatus);

    // for Hospital,admin controller
    List<FraudReportDTO> getDoctorFraudReports(long doctorId);

    FraudReportDTO updateReportStatus(long fraudReportId, ReportStatus reportStatus);

    //only for patient controller
    List<FraudReportDTO> getPatientFraudReports();

    FraudReportDTO addFraudReport(FraudReportDTO fraudReportDTO, long doctorId);
    FraudReportDTO getFraudReportDTO(long fraudReportId);
    FraudReport getFraudReport(long fraudReportId);
    Boolean deleteFraudReport(long fraudReportId);
}
