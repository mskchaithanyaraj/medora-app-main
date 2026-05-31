package com.medora.app.mapper;

import com.medora.app.dto.HospitalDTO;
import com.medora.app.entity.Hospital;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring", uses={UserMapper.class})
public interface HospitalMapper {
    Hospital mapToEntity(HospitalDTO dto);
    HospitalDTO mapToDTO(Hospital hospital);
}
