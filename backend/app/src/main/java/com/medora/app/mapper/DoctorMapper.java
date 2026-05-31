package com.medora.app.mapper;

import com.medora.app.dto.DoctorDTO;
import com.medora.app.entity.Doctor;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring", uses={HospitalMapper.class, UserMapper.class})
public interface DoctorMapper {
    Doctor mapToEntity(DoctorDTO dto);
    DoctorDTO mapToDTO(Doctor doctor);
}
