package com.medora.app.dto;

import lombok.Data;

import java.time.LocalDateTime;

@Data
public class PatientDTO {

    private long id;

    private UserDTO user;

    private String name;

    private int age;

    private String gender;

    private String phone;

    private String location;

    private LocalDateTime updatedAt;
}
