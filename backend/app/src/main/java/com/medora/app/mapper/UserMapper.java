package com.medora.app.mapper;

import com.medora.app.dto.UserDTO;
import com.medora.app.entity.User;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface UserMapper {
    User mapToEntity(UserDTO dto);
    UserDTO mapToDTO(User user);
}
