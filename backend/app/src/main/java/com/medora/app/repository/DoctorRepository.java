package com.medora.app.repository;

import java.util.List;

import com.medora.app.entity.Doctor;
import org.springframework.data.jpa.repository.JpaRepository;

public interface DoctorRepository extends JpaRepository<Doctor, Long> {
    List<Doctor> findByHospitalId(long hospitalId);
}
