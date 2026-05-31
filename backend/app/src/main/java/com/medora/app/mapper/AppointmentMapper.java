package com.medora.app.mapper;

import com.medora.app.dto.AppointmentDTO;
import com.medora.app.entity.Appointment;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring", uses={DoctorMapper.class, PatientMapper.class})
public interface AppointmentMapper {
    Appointment mapToEntity(AppointmentDTO dto);
    AppointmentDTO mapToDTO(Appointment appointment);
}
