package com.medora.app.mapper;

import com.medora.app.dto.ReviewDTO;
import com.medora.app.entity.Review;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring", uses={DoctorMapper.class, PatientMapper.class})
public interface ReviewMapper {
    Review mapToEntity(ReviewDTO dto);
    ReviewDTO mapToDTO(Review review);
}
