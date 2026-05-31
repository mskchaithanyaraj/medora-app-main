package com.medora.app.repository;

import com.medora.app.entity.Hospital;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface HospitalRepository extends JpaRepository<Hospital, Long> {
    Optional<Hospital> getByName(String name);
    boolean existsByName(String name);
}
