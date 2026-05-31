package com.medora.app.service.impl;

import com.medora.app.constants.AuthStatus;
import com.medora.app.dto.HospitalDTO;
import com.medora.app.dto.RegistrationDTO;
import com.medora.app.entity.Hospital;
import com.medora.app.entity.User;
import com.medora.app.exception.UserAlreadyExistsException;
import com.medora.app.exception.UserNotFoundException;
import com.medora.app.mapper.HospitalMapper;
import com.medora.app.repository.HospitalRepository;
import com.medora.app.service.HospitalService;
import com.medora.app.service.UserService;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class HospitalServiceImpl implements HospitalService {

    private final HospitalRepository hospitalRepository;

    private final HospitalMapper hospitalMapper;

    private final UserService userService;

    public HospitalServiceImpl(HospitalRepository hospitalRepository, HospitalMapper hospitalMapper, UserService userService) {
        this.hospitalRepository = hospitalRepository;
        this.hospitalMapper = hospitalMapper;
        this.userService = userService;
    }

    @Override
    public HospitalDTO addHospital(RegistrationDTO registrationDTO, User user) {
        if(hospitalRepository.existsByName(registrationDTO.getHospitalName())){
            throw new UserAlreadyExistsException("Hospital Already Exists");
        }
        Hospital hospital=new Hospital();
        hospital.setUser(user);
        hospital.setName(registrationDTO.getHospitalName());
        hospital.setContact(registrationDTO.getHospitalContact());
        hospital.setAddress(registrationDTO.getHospitalAddress());
        hospital.setAuthStatus(AuthStatus.PENDING);

        return hospitalMapper.mapToDTO(hospitalRepository.save(hospital));
    }

    @Override
    public HospitalDTO getHospitalDTO(long hospitalId){
        return hospitalMapper.mapToDTO(getHospital(hospitalId));
    }

    @Override
    public Hospital getHospital(long hospitalId) {
        return hospitalRepository.findById(hospitalId).orElseThrow(() -> new UserNotFoundException("Hospital not found"));
    }

    @Override
    public HospitalDTO getByNameDTO(String name){
        return hospitalMapper.mapToDTO(getByName(name));
    }

    @Override
    public Hospital getByName(String name){
        return hospitalRepository.getByName(name).orElseThrow(() -> new UserNotFoundException("Hospital not found"));
    }

    @Override
    public HospitalDTO approveHospital(long hospitalId) {
        Hospital hospital=getHospital(hospitalId);
        if(hospital.getRejectionReason()!=null){
            hospital.setRejectionReason(null);
        }
        hospital.setAuthStatus(AuthStatus.APPROVED);
        return hospitalMapper.mapToDTO(hospitalRepository.save(hospital));
    }

    @Override
    public HospitalDTO updateAuthStatus(long hospitalId, AuthStatus authStatus, HospitalDTO hospitalDTO) {
        Hospital hospital=getHospital(hospitalId);
        hospital.setRejectionReason(hospitalDTO.getRejectionReason());
        hospital.setAuthStatus(authStatus);
        return hospitalMapper.mapToDTO(hospitalRepository.save(hospital));
    }

    @Override
    public List<HospitalDTO> getAllHospitals() {
        return hospitalRepository.findAll().stream()
                .map(hospital -> hospitalMapper.mapToDTO(hospital))
                .collect(Collectors.toList());
    }

    @Override
    public List<String> getApprovedHospitalNames(){
        List<String> hospitalNames=new ArrayList<>();
        List<HospitalDTO> hospitals=getAllHospitalByAuthStatus(AuthStatus.APPROVED);
        for(HospitalDTO hospitalDTO:hospitals){
            hospitalNames.add(hospitalDTO.getName());
        }
        return hospitalNames;
    }

    @Override
    public List<HospitalDTO> getAllHospitalByAuthStatus(AuthStatus authStatus){
        return getAllHospitals().stream()
                .filter((hospital)-> hospital.getAuthStatus().equals(authStatus))
                .collect(Collectors.toList());
    }

    @Override
    public HospitalDTO updateHospital(HospitalDTO hospitalDTO) {
        long hospitalId=userService.getUserByUsername(SecurityContextHolder.getContext().getAuthentication().getName()).getId();
        Hospital hospital=getHospital(hospitalId);
        hospital.setAddress(hospitalDTO.getAddress());
        hospital.setName(hospitalDTO.getName());
        hospital.setContact(hospitalDTO.getContact());
        return hospitalMapper.mapToDTO(hospitalRepository.save(hospital));
    }

    @Override
    public Boolean deleteHospital(long hospitalId) {
        if(hospitalRepository.existsById(hospitalId)){
            hospitalRepository.deleteById(hospitalId);
            return true;
        }
        return false;
    }

    @Override
    public HospitalDTO viewProfile() {
        User user=userService.getUserByUsername(SecurityContextHolder
                .getContext().getAuthentication().getName());
        return getHospitalDTO(user.getId());
    }



}
