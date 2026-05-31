package com.medora.app.repository;

import com.medora.app.entity.Slot;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.Optional;

public interface SlotRepository extends JpaRepository<Slot, Long> {
    Optional<Slot> findByDoctorIdAndDate(Long doctorId, LocalDate date);
    boolean deleteByDoctorIdAndDate(Long doctorId, LocalDate date);
}
