package com.medora.app.repository;

import java.util.List;
import com.medora.app.entity.Patient;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface PatientRepository extends JpaRepository<Patient, Long> {
    Optional<Patient> findByUserId(long id);

    List<Patient> findAll();

}
