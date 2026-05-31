package com.medora.app.service.impl;

import com.medora.app.dto.PrescriptionDTO;
import com.medora.app.entity.Prescription;
import com.medora.app.exception.UserNotFoundException;
import com.medora.app.mapper.PrescriptionMapper;
import com.medora.app.repository.PrescriptionRepository;
import com.medora.app.service.AppointmentService;
import com.medora.app.service.PrescriptionService;
import com.medora.app.service.UserService;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class PrescriptionServiceImpl implements PrescriptionService {

    private final PrescriptionRepository prescriptionRepository;

    private final AppointmentService appointmentService;

    private final UserService userService;

    private final PrescriptionMapper prescriptionMapper;

    public PrescriptionServiceImpl(PrescriptionRepository prescriptionRepository, AppointmentService appointmentService, UserService userService, PrescriptionMapper prescriptionMapper) {
        this.prescriptionRepository = prescriptionRepository;
        this.appointmentService = appointmentService;
        this.userService = userService;
        this.prescriptionMapper = prescriptionMapper;
    }

    @Override
    public PrescriptionDTO addPrescription(PrescriptionDTO prescriptionDTO, long appointmentId) {
        Prescription prescription=prescriptionMapper.mapToEntity(prescriptionDTO);
        prescription.setAppointment(appointmentService.getAppointment(appointmentId));
        return prescriptionMapper.mapToDTO(prescriptionRepository.save(prescription));
    }

    @Override
    public PrescriptionDTO getPrescriptionDTO(long prescriptionId){
        return prescriptionMapper.mapToDTO(getPrescription(prescriptionId));
    }

    @Override
    public Prescription getPrescription(long prescriptionId){
        return prescriptionRepository.findById(prescriptionId).orElseThrow(() -> new UserNotFoundException("Prescription not found"));
    }

    @Override
    public List<PrescriptionDTO> getAllPrescriptions() {
        return prescriptionRepository.findAll().stream()
                .map(prescription -> prescriptionMapper.mapToDTO(prescription))
                .collect(Collectors.toList());
    }

    @Override
    public List<PrescriptionDTO> getDoctorPrescriptions(long doctorId) {
        return getAllPrescriptions().stream()
                .filter((prescription)->
                        prescription.getAppointment().getDoctor().getId() == doctorId)
                .collect(Collectors.toList());
    }

    @Override
    public List<PrescriptionDTO> getPatientPrescriptions(long patientId){
        return getAllPrescriptions().stream()
                .filter((prescription)->
                        prescription.getAppointment().getPatient().getId() == patientId)
                .collect(Collectors.toList());
    }

    @Override
    public PrescriptionDTO updatePrescription(long prescriptionId, PrescriptionDTO prescriptionDTO) {
        Prescription prescription=getPrescription(prescriptionId);
        prescription.setDiagnosis(prescriptionDTO.getDiagnosis());
        prescription.setMedicine(prescriptionDTO.getMedicine());
        return prescriptionMapper.mapToDTO(prescriptionRepository.save(prescription));
    }

    @Override
    public Boolean deletePrescription(long prescriptionId) {
        if(prescriptionRepository.existsById(prescriptionId)){
            prescriptionRepository.deleteById(prescriptionId);
            return true;
        }
        return false;
    }



}
