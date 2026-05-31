package com.medora.app.entity;

import com.medora.app.constants.AuthStatus;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;
import java.util.List;

@Entity
@Data
@AllArgsConstructor
@NoArgsConstructor
public class Hospital {

    @Id
    private long id;

    @Column(nullable = false, unique = true)
    private String name;

    @OneToOne
    @MapsId
    @JoinColumn(name="user_id")
    private User user;

    @Column(nullable = false, length = 500)
    private String address;

    @Column(nullable = false, length = 15)
    private String contact;

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
