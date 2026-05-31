package com.medora.app.service;

import com.medora.app.constants.AuthStatus;
import com.medora.app.dto.HospitalDTO;
import com.medora.app.dto.HospitalDTO;
import com.medora.app.dto.RegistrationDTO;
import com.medora.app.entity.Hospital;
import com.medora.app.entity.User;

import java.util.List;

public interface HospitalService {
    HospitalDTO getHospitalDTO(long hospitalId);
    Hospital getHospital(long hospitalId);
    HospitalDTO getByNameDTO(String name);
    Hospital getByName(String name);
    HospitalDTO addHospital(RegistrationDTO registrationDTO, User user);
    HospitalDTO approveHospital(long hospitalId);
    HospitalDTO updateAuthStatus(long hospitalId, AuthStatus authStatus, HospitalDTO hospitalDTO);
    List<HospitalDTO> getAllHospitals();

    List<String> getApprovedHospitalNames();

    List<HospitalDTO> getAllHospitalByAuthStatus(AuthStatus authStatus);
    HospitalDTO updateHospital(HospitalDTO hospitalDTO);
    Boolean deleteHospital(long hospitalId);
    HospitalDTO viewProfile();
}
