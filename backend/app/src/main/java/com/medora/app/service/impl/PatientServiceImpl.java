package com.medora.app.service.impl;

import com.medora.app.dto.PatientDTO;
import com.medora.app.dto.RegistrationDTO;
import com.medora.app.entity.Patient;
import com.medora.app.entity.User;
import com.medora.app.exception.UserNotFoundException;
import com.medora.app.mapper.PatientMapper;
import com.medora.app.repository.PatientRepository;
import com.medora.app.service.PatientService;
import com.medora.app.service.UserService;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
public class PatientServiceImpl implements PatientService {

    private final PatientRepository patientRepository;

    private final UserService userService;

    private final PatientMapper patientMapper;

    public PatientServiceImpl(PatientRepository patientRepository, UserService userService, PatientMapper patientMapper) {
        this.patientRepository = patientRepository;
        this.userService = userService;
        this.patientMapper = patientMapper;
    }

    @Override
    public PatientDTO addPatient(RegistrationDTO dto, User user){
        Patient newPatient = new Patient();
        newPatient.setName(dto.getPatientName());
        newPatient.setUser(user);
        newPatient.setAge(dto.getPatientAge());
        newPatient.setGender(dto.getPatientGender());
        newPatient.setPhone(dto.getPatientPhone());
        newPatient.setLocation(dto.getPatientLocation());

        return patientMapper.mapToDTO(patientRepository.save(newPatient));
    }

    @Override
    public PatientDTO viewProfile() {
        User user = userService.getUserByUsername(SecurityContextHolder
                .getContext().getAuthentication().getName());
        return getPatientDTO(user.getId());
    }

    @Override
    public boolean deletePatient(long patientId){
        if(patientRepository.existsById(patientId)){
            patientRepository.deleteById(patientId);
            return true;
        }
        return false;
    }

    @Override
    public PatientDTO getPatientDTO(long patientId){
        return patientMapper.mapToDTO(getPatient(patientId));
    }

    @Override
    public Patient getPatient(long patientId){
        return patientRepository.findById(patientId).orElseThrow(() -> new UserNotFoundException("Patient does not exists"));
    }

    @Override
    public PatientDTO updatePatient(PatientDTO patientDTO) {
        long patientId=userService.getUserByUsername(SecurityContextHolder.getContext().getAuthentication().getName()).getId();
        Patient patient=getPatient(patientId);
        patient.setName(patientDTO.getName());
        patient.setGender(patientDTO.getGender());
        patient.setAge(patientDTO.getAge());
        patient.setLocation(patientDTO.getLocation());
        patient.setPhone(patientDTO.getPhone());
        return patientMapper.mapToDTO(patientRepository.save(patient));
    }

    @Override
    public List<PatientDTO> getAllPatients(){
        List<PatientDTO> patientDTOs= new ArrayList<>();
        List<Patient> patients = patientRepository.findAll();

        for(Patient patient:patients){
            patientDTOs.add(patientMapper.mapToDTO(patient));
        }
        return patientDTOs;
    }

}
