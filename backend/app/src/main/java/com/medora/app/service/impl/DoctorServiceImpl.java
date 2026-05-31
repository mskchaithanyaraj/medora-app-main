package com.medora.app.service.impl;

import com.medora.app.constants.AuthStatus;
import com.medora.app.dto.DoctorDTO;
import com.medora.app.dto.RegistrationDTO;
import com.medora.app.entity.Doctor;
import com.medora.app.entity.User;
import com.medora.app.exception.UserNotFoundException;
import com.medora.app.mapper.DoctorMapper;
import com.medora.app.repository.DoctorRepository;
import com.medora.app.service.DoctorService;
import com.medora.app.service.HospitalService;
import com.medora.app.service.SlotService;
import com.medora.app.service.UserService;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class DoctorServiceImpl implements DoctorService {

    private final DoctorRepository doctorRepository;

    private final HospitalService hospitalService;

    private final DoctorMapper doctorMapper;

    private final UserService userService;

    public DoctorServiceImpl(DoctorRepository doctorRepository, HospitalService hospitalService, DoctorMapper doctorMapper, UserService userService) {
        this.doctorRepository = doctorRepository;
        this.hospitalService = hospitalService;
        this.doctorMapper = doctorMapper;
        this.userService = userService;
    }

    @Override
    public DoctorDTO getDoctorDTO(long doctorId) {
        return doctorMapper.mapToDTO(getDoctor(doctorId));
    }

    @Override
    public Doctor getDoctor(long doctorId) {
        return doctorRepository.findById(doctorId).orElseThrow(() -> new UserNotFoundException("Doctor Not Found"));
    }

    @Override
    public DoctorDTO addDoctor(RegistrationDTO registrationDTO, User user){
        Doctor doctor =new Doctor();
        doctor.setName(registrationDTO.getDoctorName());
        doctor.setExperience(registrationDTO.getExperience());
        doctor.setLocation(registrationDTO.getDoctorLocation());
        doctor.setLicenceNumber(registrationDTO.getLicenceNumber());
        doctor.setQualification(registrationDTO.getQualification());

        doctor.setHospital(hospitalService.getByName(registrationDTO.getHospitalName()));
        doctor.setUser(user);
        doctor.setAuthStatus(AuthStatus.PENDING);
        return doctorMapper.mapToDTO(doctorRepository.save(doctor));
    }

    @Override
    public Boolean deleteDoctor(long doctorId) {
        if(doctorRepository.existsById(doctorId)){
            doctorRepository.deleteById(doctorId);
            return true;
        }else{
            return false;
        }
    }

    @Override
    public List<DoctorDTO> getAllDoctors() {
        return doctorRepository.findAll().stream()
                .map(doctor -> doctorMapper.mapToDTO(doctor))
                .collect(Collectors.toList());
    }

    @Override
    public List<DoctorDTO> getDoctorsByAuthStatus(AuthStatus authStatus) {
        return getAllDoctors().stream()
                .filter(doctor -> doctor.getAuthStatus().equals(authStatus))
                .collect(Collectors.toList());
    }

    @Override
    public List<DoctorDTO> getDoctorsByHospitalAndAuthStatus(AuthStatus authStatus) {
        long hospitalId=userService.getUserByUsernameDTO(SecurityContextHolder
                .getContext().getAuthentication().getName()).getId();
        return getDoctorsByHospital(hospitalId).stream()
                .filter(doctor -> doctor.getAuthStatus().equals(authStatus))
                .collect(Collectors.toList());
    }

    @Override
    public List<DoctorDTO> getDoctorsByHospital(long hospitalId) {
        return doctorRepository.findByHospitalId(hospitalId).stream()
                .map(doctor -> doctorMapper.mapToDTO(doctor))
                .collect(Collectors.toList());
    }

    @Override
    public DoctorDTO approveDoctor(long doctorId) {
        Doctor doctor=getDoctor(doctorId);
        if(doctor.getRejectionReason()!=null){
            doctor.setRejectionReason(null);
        }
        doctor.setAuthStatus(AuthStatus.APPROVED);
        return doctorMapper.mapToDTO(doctorRepository.save(doctor));
    }

    @Override
    public DoctorDTO updateAuthStatus(long doctorId, AuthStatus status, DoctorDTO doctorDTO) {
        Doctor doctor=getDoctor(doctorId);
        doctor.setRejectionReason(doctorDTO.getRejectionReason());
        doctor.setAuthStatus(status);
        return doctorMapper.mapToDTO(doctorRepository.save(doctor));
    }

    @Override
    public DoctorDTO updateDoctor(DoctorDTO doctorDTO) {
        long doctorId=userService.getUserByUsername(SecurityContextHolder.getContext().getAuthentication().getName()).getId();
        Doctor doctor=getDoctor(doctorId);
        doctor.setName(doctorDTO.getName());
        doctor.setQualification(doctorDTO.getQualification());
        doctor.setLocation(doctorDTO.getLocation());
        doctor.setExperience(doctorDTO.getExperience());
        return doctorMapper.mapToDTO(doctorRepository.save(doctor));
    }

    @Override
    public DoctorDTO viewProfile(){
        User user=userService.getUserByUsername(SecurityContextHolder
                .getContext().getAuthentication().getName());
        return getDoctorDTO(user.getId());
    }

}
