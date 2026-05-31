package com.medora.app.entity;

import com.medora.app.constants.AuthStatus;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Entity
@Data
@AllArgsConstructor
@NoArgsConstructor
public class Doctor {

    @Id
    private long id;

    @Column(nullable = false)
    private String name;

    @OneToOne
    @MapsId
    @JoinColumn(name="user_id")
    private User user;

    @ManyToOne
    @JoinColumn(name="hospital_id")
    private Hospital hospital;

    @Column(nullable = false, length = 10)
    private String licenceNumber;

    @Column(nullable = false, length = 50)
    private String qualification;

    @Column(nullable = false)
    private int experience;

    @Column(nullable = false, length = 200)
    private String location;

    @Enumerated(EnumType.STRING)
    private AuthStatus authStatus;

    @Column(length = 1000)
    private String rejectionReason;

    private LocalDateTime updatedAt;

    @PreUpdate
    public void onUpdate(){
        updatedAt=LocalDateTime.now();
    }
}
