package com.medora.app.repository;

import com.medora.app.entity.Query;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface QueryRepository extends JpaRepository<Query, Long> {
    List<Query> getByPatientId(Long patientId);
}
