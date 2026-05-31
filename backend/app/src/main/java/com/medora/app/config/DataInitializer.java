package com.medora.app.config;

import com.medora.app.service.impl.DataInitializerService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

/**
 * Data Initializer - Creates test data on application startup if not exists
 * 
 * All test users have password: password123
 * 
 * CREDENTIALS:
 * - admin      / password123  (Super Admin)
 * - hospital1  / password123  (City General Hospital - approved)
 * - hospital2  / password123  (Metro Health Center - approved)
 * - hospital3  / password123  (New Medical Center - pending)
 * - doctor1    / password123  (Dr. Sarah Smith - approved)
 * - doctor2    / password123  (Dr. Michael Johnson - approved)
 * - doctor3    / password123  (Dr. Emily Davis - approved)
 * - doctor4    / password123  (Dr. James Wilson - pending)
 * - patient1   / password123  (John Doe)
 * - patient2   / password123  (Jane Smith)
 * - patient3   / password123  (Bob Wilson)
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class DataInitializer implements CommandLineRunner {

    private final DataInitializerService dataInitializerService;

    @Override
    public void run(String... args) {
        // Check if data already exists
        if (dataInitializerService.isDataInitialized()) {
            log.info("Test data already exists. Skipping initialization.");
            return;
        }

        // If partial data exists, warn and skip
        if (dataInitializerService.hasPartialData()) {
            log.warn("Partial test data found. Please manually clean up the database.");
            log.warn("Run this in MySQL: DELETE FROM slot; DELETE FROM prescription; DELETE FROM appointment; DELETE FROM patient; DELETE FROM doctor; DELETE FROM hospital; DELETE FROM user;");
            return;
        }

        log.info("Initializing test data...");

        try {
            dataInitializerService.initializeAllData();
        } catch (Exception e) {
            log.error("Error initializing test data: {}", e.getMessage());
            log.warn("Application will start without test data. Please check database schema.");
        }
    }
}
