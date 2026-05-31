package com.medora.app.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.medora.app.constants.Role;
import lombok.*;

import java.time.LocalDateTime;
import java.util.Set;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class UserDTO {

    private long id;

    private String username;

    @JsonProperty(access = JsonProperty.Access.WRITE_ONLY)
    private String password;

    private Set<Role> roles;

    private LocalDateTime createdAt;

}
