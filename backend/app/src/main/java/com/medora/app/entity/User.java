package com.medora.app.entity;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.medora.app.constants.Role;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;
import java.util.Set;

@Entity
@Data
@AllArgsConstructor
@NoArgsConstructor
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private long id;

    @Column(nullable = false, unique = true)
    private String username;

    @Column(nullable = false)
    @JsonProperty(access = JsonProperty.Access.WRITE_ONLY)
    private String password;

    @Column(nullable = false)
    @Enumerated(EnumType.STRING)
    private Set<Role> roles;

    private LocalDateTime createdAt;

    @PrePersist
    public void onCreate(){
        createdAt=LocalDateTime.now();
    }

}
