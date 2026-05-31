package com.medora.app.controller;

import com.medora.app.config.AuthService;
import com.medora.app.dto.RegistrationDTO;
import com.medora.app.dto.UserDTO;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody RegistrationDTO registrationDTO){
        return ResponseEntity.ok(authService.register(registrationDTO));
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody UserDTO user){
        return ResponseEntity.ok(authService.login(user));
    }

    @PostMapping("/logout")
    public ResponseEntity<?> logout(){
        if(authService.logout()) {
            return ResponseEntity.ok("Logged out successfully");
        }else{
            return ResponseEntity.ok("Already Logged out");
        }
    }

    @GetMapping("/hospitals")
    public ResponseEntity<List<String>> getHospitals(){
        return ResponseEntity.ok(authService.getHospitalNames());
    }
}
