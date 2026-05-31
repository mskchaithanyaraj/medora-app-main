package com.medora.app.mapper;

import com.medora.app.dto.PrescriptionDTO;
import com.medora.app.entity.Prescription;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring", uses={AppointmentMapper.class})
public interface PrescriptionMapper {
    Prescription mapToEntity(PrescriptionDTO dto);
    PrescriptionDTO mapToDTO(Prescription prescription);
}
