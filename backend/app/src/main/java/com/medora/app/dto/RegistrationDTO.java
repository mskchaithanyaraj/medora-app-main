package com.medora.app.dto;

import com.medora.app.constants.Role;
import com.medora.app.entity.Hospital;
import com.medora.app.entity.User;
import lombok.*;

import java.util.Set;

@Data
public class RegistrationDTO {

    //User
    private String username;

    private String password;

    private Set<Role> roles;

    //Hospital
    private String hospitalName;//also for doctor

    private String hospitalAddress;

    private String hospitalContact;

    //Doctor
    private String doctorName;
    private String licenceNumber;
    private String qualification;
    private int experience;
    private String doctorLocation;

    //Patient

    private String patientName;

    private int patientAge;

    private String patientGender;

    private String patientPhone;

    private String patientLocation;

}
