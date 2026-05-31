package com.medora.app.mapper;

import com.medora.app.dto.QueryDTO;
import com.medora.app.entity.Query;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring", uses={PatientMapper.class, ReplyMapper.class})
public interface QueryMapper {
    Query mapToEntity(QueryDTO dto);
    QueryDTO mapToDTO(Query query);
}
