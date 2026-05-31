package com.medora.app.mapper;

import com.medora.app.dto.FraudReportDTO;
import com.medora.app.entity.FraudReport;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring", uses={DoctorMapper.class, PatientMapper.class})
public interface FraudReportMapper {
    FraudReport mapToEntity(FraudReportDTO dto);
    FraudReportDTO mapToDTO(FraudReport fraudReport);
}
