package com.medora.app.mapper;

import com.medora.app.dto.PatientDTO;
import com.medora.app.entity.Patient;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring", uses={UserMapper.class})
public interface PatientMapper {
    Patient mapToEntity(PatientDTO dto);
    PatientDTO mapToDTO(Patient patient);
}
