package com.medora.app.entity;


import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Reply {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "query_id")
    @JsonIgnore
    private Query query;

    private String message;

    @ManyToOne
    @JoinColumn(name = "user_id")
    private User repliedUser;

    private LocalDateTime createdAt;

    @PrePersist
    public void onCreate(){
        createdAt=LocalDateTime.now();
    }
}
