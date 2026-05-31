package com.medora.app.dto;

import com.medora.app.entity.Patient;
import com.medora.app.entity.Reply;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class QueryDTO {

    private Long id;

    private String message;

    private Patient patient;

    private List<Reply> replies;

    private LocalDateTime createdAt;

}
