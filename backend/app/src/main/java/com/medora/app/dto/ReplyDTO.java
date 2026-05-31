package com.medora.app.dto;


import com.fasterxml.jackson.annotation.JsonIgnore;
import com.medora.app.entity.Query;
import com.medora.app.entity.User;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ReplyDTO {

    private Long id;

    @JsonIgnore
    private Query query;

    private String message;

    private User repliedUser;

    private LocalDateTime createdAt;

}

