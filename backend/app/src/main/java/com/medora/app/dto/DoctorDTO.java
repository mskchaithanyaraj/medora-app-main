package com.medora.app.dto;

import com.medora.app.constants.AuthStatus;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class DoctorDTO {

    private long id;

    private String name;

    private UserDTO user;

    private HospitalDTO hospital;

    private String licenceNumber;

    private String qualification;

    private int experience;

    private String location;

    private AuthStatus authStatus;

    private String rejectionReason;

    private LocalDateTime updatedAt;

}
