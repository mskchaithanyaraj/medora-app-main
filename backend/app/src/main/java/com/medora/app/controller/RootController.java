package com.medora.app.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/")
public class RootController {

    @GetMapping
    public ResponseEntity<?> rootStatus(){
        Map<String, String> response = new HashMap<>();
        response.put("message", "Medora API is running");
        response.put("status", "active");
        return ResponseEntity.ok(response);
    }
}
