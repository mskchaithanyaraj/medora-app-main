package com.medora.app.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Data
@Entity
@NoArgsConstructor
@AllArgsConstructor
public class Patient {

    @Id
    private long id;

    @OneToOne
    @MapsId
    @JoinColumn(name="user_id")
    private User user;

    @Column(nullable = false, length = 100)
    private String name;

    @Column(nullable = false, unique = false)
    private int age;

    @Column(nullable = false, unique = false)
    private String gender;

    @Column(nullable = false,length = 15)
    private String phone;

    @Column(nullable = false,length = 500)
    private String location;

    private LocalDateTime updatedAt;

    @PreUpdate
    public void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

}
