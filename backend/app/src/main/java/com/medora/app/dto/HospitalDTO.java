package com.medora.app.dto;

import com.medora.app.constants.AuthStatus;
import lombok.*;

import java.time.LocalDateTime;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class HospitalDTO {

    private long id;

    private String name;

    private UserDTO user;

    private String address;

    private String contact;

    private AuthStatus authStatus;

    private String rejectionReason;

    private LocalDateTime updatedAt;

}
