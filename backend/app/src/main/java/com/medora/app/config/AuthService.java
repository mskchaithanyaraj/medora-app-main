package com.medora.app.config;

import com.medora.app.constants.AuthStatus;
import com.medora.app.constants.Role;
import com.medora.app.dto.LoginResponseDTO;
import com.medora.app.dto.RegistrationDTO;
import com.medora.app.dto.UserDTO;
import com.medora.app.entity.Doctor;
import com.medora.app.entity.Hospital;
import com.medora.app.entity.User;
import com.medora.app.exception.UserNotApprovedException;
import com.medora.app.exception.UserNotFoundException;
import com.medora.app.mapper.UserMapper;
import com.medora.app.service.DoctorService;
import com.medora.app.service.HospitalService;
import com.medora.app.service.PatientService;
import com.medora.app.service.UserService;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class AuthService {

    private final UserService userService;

    private final UserMapper userMapper;

    private final BCryptPasswordEncoder pwdEncoder;

    private final AuthenticationManager authManager;

    private final JWTService jwtService;

    private final HospitalService hospitalService;

    private final DoctorService doctorService;

    private final PatientService patientService;

    public AuthService(UserService userService, UserMapper userMapper, BCryptPasswordEncoder pwdEncoder, AuthenticationManager authManager, JWTService jwtService, HospitalService hospitalService, DoctorService doctorService, PatientService patientService) {
        this.userService = userService;
        this.userMapper = userMapper;
        this.pwdEncoder = pwdEncoder;
        this.authManager = authManager;
        this.jwtService = jwtService;
        this.hospitalService = hospitalService;
        this.doctorService = doctorService;
        this.patientService = patientService;
    }

    public String register(RegistrationDTO registrationDTO) {
        String password = pwdEncoder.encode(registrationDTO.getPassword());
        registrationDTO.setPassword(password);
        User user = userService.addUser(registrationDTO);

        if(registrationDTO.getRoles().contains(Role.HOSPITAL)){
            hospitalService.addHospital(registrationDTO, user);
            throw  new UserNotApprovedException("Authentication Pending, wait until Approved");
        }else if(registrationDTO.getRoles().contains(Role.DOCTOR)){
            doctorService.addDoctor(registrationDTO, user);
            throw  new UserNotApprovedException("Authentication Pending, wait until Approved");
        }else if(registrationDTO.getRoles().contains(Role.PATIENT)){
            patientService.addPatient(registrationDTO, user);
        }

        return jwtService.generateToken(user.getUsername());
    }

    public LoginResponseDTO login(UserDTO dto) {
        User user=userMapper.mapToEntity(dto);

        User userIn=userService.getUserByUsername(user.getUsername());
        if(userIn==null){
            throw new UserNotFoundException("Invalid Username");
        }
        if(userIn.getRoles().contains(Role.HOSPITAL)){
            Hospital hospital = hospitalService.getHospital(userIn.getId());
            if(!hospital.getAuthStatus().equals(AuthStatus.APPROVED)){
                throw  new UserNotApprovedException("Not an Approved User");
            }
        }else if(userIn.getRoles().contains(Role.DOCTOR)){
            Doctor doctor = doctorService.getDoctor(userIn.getId());
            if(!doctor.getAuthStatus().equals(AuthStatus.APPROVED)){
                throw  new UserNotApprovedException("Not an Approved User");
            }
        }

        UsernamePasswordAuthenticationToken token= new UsernamePasswordAuthenticationToken(user.getUsername(), user.getPassword());
        Authentication authenticate = authManager.authenticate(token);

        if(authenticate.isAuthenticated() ) {
            String jwt=jwtService.generateToken(user.getUsername());
            return LoginResponseDTO.builder()
                    .token(jwt)
                    .username(userIn.getUsername())
                    .roles(userIn.getRoles())
                    .expiresIn(3600*24) // 1 day in seconds
                    .build();
        }
        throw new UserNotFoundException("Invalid Password");
    }

    public boolean logout(){
        if(SecurityContextHolder.getContext().getAuthentication()!=null){
            SecurityContextHolder.getContext().setAuthentication(null);
            return true;
        }
        return false;
    }

    public List<String> getHospitalNames(){
        return hospitalService.getApprovedHospitalNames();
    }

}
