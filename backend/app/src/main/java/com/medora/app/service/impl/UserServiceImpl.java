package com.medora.app.service.impl;

import com.medora.app.dto.ChangePasswordDTO;
import com.medora.app.dto.RegistrationDTO;
import com.medora.app.dto.UserDTO;
import com.medora.app.entity.User;
import com.medora.app.exception.UserAlreadyExistsException;
import com.medora.app.exception.UserNotFoundException;
import com.medora.app.mapper.UserMapper;
import com.medora.app.repository.UserRepository;
import com.medora.app.service.UserService;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;

    private final BCryptPasswordEncoder pwdEncoder;

    private final UserMapper userMapper;

    public UserServiceImpl(UserRepository userRepository, BCryptPasswordEncoder pwdEncoder, UserMapper userMapper) {
        this.userRepository = userRepository;
        this.pwdEncoder = pwdEncoder;
        this.userMapper = userMapper;
    }

    @Override
    public UserDTO getUserByUsernameDTO(String username){
        User user=getUserByUsername(username);
        return userMapper.mapToDTO(user);
    }

    @Override
    public User getUserByUsername(String username){
        return userRepository.getUserByUsername(username).orElseThrow(() -> new UserNotFoundException("User not found"));
    }

    @Override
    public UserDTO getUserDTO(long userId){
        return userMapper.mapToDTO(getUser(userId));
    }

    @Override
    public User getUser(long userId){
        return userRepository.findById(userId).orElseThrow(() -> new UserNotFoundException("User not found"));
    }

    @Override
    public User addUser(RegistrationDTO registrationDTO) {
        if(userRepository.existsByUsername(registrationDTO.getUsername())){
            throw new UserAlreadyExistsException("Username Already Exists");
        }
        User user =new User();
        user.setUsername(registrationDTO.getUsername());
        user.setPassword(registrationDTO.getPassword());
        user.setRoles(registrationDTO.getRoles());
        return userRepository.save(user);

    }



    @Override
    public boolean changePassword(ChangePasswordDTO changePasswordDTO){
        User user=getUserByUsername(SecurityContextHolder.getContext().getAuthentication().getName());
        if(pwdEncoder.matches(changePasswordDTO.getOldPassword(), user.getPassword())){
            String newPassword=pwdEncoder.encode(changePasswordDTO.getNewPassword());
            user.setPassword(newPassword);
            userRepository.save(user);
            return true;
        }
        return false;
    }

    @Override
    public UserDTO profile() {
        String username= SecurityContextHolder.getContext().getAuthentication().getName();
        return userMapper.mapToDTO(getUserByUsername(username));
    }


}
