package com.medora.app.repository;

import com.medora.app.entity.FraudReport;
import org.springframework.data.jpa.repository.JpaRepository;

public interface FraudReportRepository extends JpaRepository<FraudReport, Long> {
}
