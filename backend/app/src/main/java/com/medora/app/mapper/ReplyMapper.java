package com.medora.app.mapper;

import com.medora.app.dto.ReplyDTO;
import com.medora.app.entity.Reply;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring", uses={QueryMapper.class, UserMapper.class})
public interface ReplyMapper {
    Reply mapToEntity(ReplyDTO dto);
    ReplyDTO mapToDTO(Reply reply);
}
