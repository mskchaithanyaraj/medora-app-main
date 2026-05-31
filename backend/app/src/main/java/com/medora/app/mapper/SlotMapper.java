package com.medora.app.mapper;

import com.medora.app.dto.ReviewDTO;
import com.medora.app.dto.SlotDTO;
import com.medora.app.entity.Review;
import com.medora.app.entity.Slot;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring", uses={DoctorMapper.class})
public interface SlotMapper {
    Slot mapToEntity(SlotDTO dto);
    SlotDTO mapToDTO(Slot slot);
}
