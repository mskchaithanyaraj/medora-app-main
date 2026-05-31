package com.medora.app.service;

import com.medora.app.dto.ChangePasswordDTO;
import com.medora.app.dto.RegistrationDTO;
import com.medora.app.dto.UserDTO;
import com.medora.app.entity.User;

import java.util.HashMap;

public interface UserService {
    UserDTO getUserByUsernameDTO(String username);
    User getUserByUsername(String username);
    UserDTO getUserDTO(long userId);
    User getUser(long userId);
    User addUser(RegistrationDTO registrationDTO);
    boolean changePassword(ChangePasswordDTO changePasswordDTO);
    UserDTO profile();
}
