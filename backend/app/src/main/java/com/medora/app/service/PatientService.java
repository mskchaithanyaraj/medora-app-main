package com.medora.app.service;

import com.medora.app.dto.PatientDTO;
import com.medora.app.dto.RegistrationDTO;
import com.medora.app.entity.Patient;
import com.medora.app.entity.User;
import org.springframework.security.core.userdetails.UserDetails;

import javax.swing.*;
import java.util.List;

public interface PatientService {
    PatientDTO getPatientDTO(long patientId);
    Patient getPatient(long patientId);
    PatientDTO addPatient(RegistrationDTO dto, User user);
    PatientDTO viewProfile();
    PatientDTO updatePatient(PatientDTO patientDTO);
    boolean deletePatient(long patientId);
    List<PatientDTO> getAllPatients();
}
