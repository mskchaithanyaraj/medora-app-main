package com.medora.app.dto;

import com.medora.app.constants.Role;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Set;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class LoginResponseDTO {
    private String token;
    private String username;
    private Set<Role> roles;
    private long expiresIn; // in seconds
}
