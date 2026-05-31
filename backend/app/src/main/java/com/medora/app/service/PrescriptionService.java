package com.medora.app.service;

import com.medora.app.dto.PrescriptionDTO;
import com.medora.app.entity.Prescription;

import java.util.List;

public interface PrescriptionService {

    // added by doctor
    PrescriptionDTO addPrescription(PrescriptionDTO prescriptionDTO, long appointmentId);

    PrescriptionDTO getPrescriptionDTO(long prescriptionId);

    Prescription getPrescription(long prescriptionId);

    List<PrescriptionDTO> getAllPrescriptions();

    //for doctor, admin controllers
    List<PrescriptionDTO> getDoctorPrescriptions(long doctorId);

    //for doctor , patient controllers
    List<PrescriptionDTO> getPatientPrescriptions(long patientId);

    PrescriptionDTO updatePrescription(long prescriptionId, PrescriptionDTO prescriptionDTO);
    Boolean deletePrescription(long prescriptionId);
}
