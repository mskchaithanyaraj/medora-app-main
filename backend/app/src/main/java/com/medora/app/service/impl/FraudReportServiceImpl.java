package com.medora.app.service.impl;

import com.medora.app.constants.ReportStatus;
import com.medora.app.dto.FraudReportDTO;
import com.medora.app.entity.FraudReport;
import com.medora.app.exception.UserNotFoundException;
import com.medora.app.mapper.FraudReportMapper;
import com.medora.app.repository.FraudReportRepository;
import com.medora.app.service.*;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class FraudReportServiceImpl implements FraudReportService {

    private final FraudReportRepository fraudReportRepository;

    private final UserService userService;

    private final DoctorService doctorService;

    private final PatientService patientService;

    private final FraudReportMapper fraudReportMapper;

    public FraudReportServiceImpl(FraudReportRepository fraudReportRepository, UserService userService, DoctorService doctorService, PatientService patientService, FraudReportMapper fraudReportMapper) {
        this.fraudReportRepository = fraudReportRepository;
        this.userService = userService;
        this.doctorService = doctorService;
        this.patientService = patientService;
        this.fraudReportMapper = fraudReportMapper;
    }

    @Override
    public List<FraudReportDTO> getAllFraudReports() {
        return fraudReportRepository.findAll().stream()
                .map(fraudReport -> fraudReportMapper.mapToDTO(fraudReport))
                .collect(Collectors.toList());
    }

    @Override
    public List<FraudReportDTO> getAllFraudReportsByStatus(ReportStatus reportStatus) {
        return getAllFraudReports().stream()
                .filter(fraudReport ->
                        fraudReport.getReportStatus().equals(reportStatus)
                ).collect(Collectors.toList());
    }

    @Override
    public List<FraudReportDTO> getDoctorFraudReports(long doctorId) {
        return getAllFraudReports().stream()
                .filter(report ->
                        report.getDoctor().getId()==doctorId)
                .collect(Collectors.toList());
    }

    @Override
    public List<FraudReportDTO> getPatientFraudReports() {
        return getAllFraudReports().stream()
                .filter(report ->
                        report.getPatient().getId()==userService.getUserByUsername(
                                SecurityContextHolder.getContext().getAuthentication().getName()).getId())
                .collect(Collectors.toList());
    }

    @Override
    public FraudReportDTO addFraudReport(FraudReportDTO fraudReportDTO, long doctorId) {
        FraudReport fraudReport = fraudReportMapper.mapToEntity(fraudReportDTO);
        fraudReport.setDoctor(doctorService.getDoctor(doctorId));
        long patientId=userService.getUserByUsername(SecurityContextHolder.getContext().getAuthentication().getName()).getId();
        fraudReport.setPatient(patientService.getPatient(patientId));
        fraudReport.setReportStatus(ReportStatus.OPEN);
        return fraudReportMapper.mapToDTO(fraudReportRepository.save(fraudReport));
    }

    @Override
    public FraudReportDTO updateReportStatus(long fraudReportId, ReportStatus reportStatus) {
        FraudReport fraudReport=getFraudReport(fraudReportId);
        fraudReport.setReportStatus(reportStatus);
        return fraudReportMapper.mapToDTO(fraudReportRepository.save(fraudReport));
    }

    @Override
    public FraudReportDTO getFraudReportDTO(long fraudReportId) {
        FraudReport fraudReport = getFraudReport(fraudReportId);
        return fraudReportMapper.mapToDTO(fraudReport);
    }

    @Override
    public FraudReport getFraudReport(long fraudReportId) {
        return fraudReportRepository.findById(fraudReportId).orElseThrow(() -> new UserNotFoundException("Fraud Report Not Found"));
    }

    @Override
    public Boolean deleteFraudReport(long fraudReportId) {
        if(fraudReportRepository.existsById(fraudReportId)){
            fraudReportRepository.deleteById(fraudReportId);
            return true;
        }
        return false;
    }


}
