package com.medora.app.service;

import com.medora.app.constants.AuthStatus;
import com.medora.app.dto.DoctorDTO;
import com.medora.app.dto.RegistrationDTO;
import com.medora.app.entity.Doctor;
import com.medora.app.entity.User;

import java.util.List;

public interface DoctorService {
    DoctorDTO getDoctorDTO(long doctorId);
    Doctor getDoctor(long doctorId);
    DoctorDTO addDoctor(RegistrationDTO registrationDTO, User user);
    Boolean deleteDoctor(long doctorId);
    DoctorDTO updateDoctor(DoctorDTO doctorDTO);
    List<DoctorDTO> getAllDoctors();
    List<DoctorDTO> getDoctorsByAuthStatus(AuthStatus authStatus);

    // only for hospital controller
    List<DoctorDTO> getDoctorsByHospitalAndAuthStatus(AuthStatus authStatus);
    List<DoctorDTO> getDoctorsByHospital(long hospitalId);
    DoctorDTO approveDoctor(long doctorId);
    DoctorDTO updateAuthStatus(long doctorId, AuthStatus status, DoctorDTO doctorDTO);

    DoctorDTO viewProfile();
}
