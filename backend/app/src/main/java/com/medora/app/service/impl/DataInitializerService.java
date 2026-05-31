package com.medora.app.service.impl;

import com.medora.app.constants.AuthStatus;
import com.medora.app.constants.Role;
import com.medora.app.constants.SlotStatus;
import com.medora.app.entity.*;
import com.medora.app.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.Set;

/**
 * Service for initializing test data
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class DataInitializerService {

    private final UserRepository userRepository;
    private final HospitalRepository hospitalRepository;
    private final DoctorRepository doctorRepository;
    private final PatientRepository patientRepository;
    private final PasswordEncoder passwordEncoder;

    public boolean isDataInitialized() {
        return userRepository.existsByUsername("admin") && userRepository.existsByUsername("patient1");
    }

    public boolean hasPartialData() {
        return userRepository.existsByUsername("admin") && !userRepository.existsByUsername("patient1");
    }

    @Transactional
    public void initializeAllData() {
        log.info("Starting data initialization...");

        // 1. Create Admin User
        User adminUser = createUser("admin", "pass", Set.of(Role.ADMIN));
        log.info("Created admin user: admin / pass");

        // 2. Create Hospitals
        User hospital1User = createUser("hospital1", "pass", Set.of(Role.HOSPITAL));
        Hospital hospital1 = createHospital(hospital1User, "City General Hospital", 
            "123 Main Street, Boston, MA 02115", "+1-567-0100", AuthStatus.APPROVED);

        User hospital2User = createUser("hospital2", "pass", Set.of(Role.HOSPITAL));
        Hospital hospital2 = createHospital(hospital2User, "Metro Health Center", 
            "456 Oak Avenue, Boston, MA 02116", "+1-539-0200", AuthStatus.APPROVED);

        User hospital3User = createUser("hospital3", "pass", Set.of(Role.HOSPITAL));
        createHospital(hospital3User, "New Medical Center", 
            "789 Pine Road, Boston, MA 02117", "+1-958-0300", AuthStatus.PENDING);

        User hospital4User = createUser("hospital4", "pass", Set.of(Role.HOSPITAL));
        Hospital hospital4 = createHospital(hospital4User, "Govt Hospital",
                "472 peak road, madrid, MA 151523", "+1-822-0200", AuthStatus.APPROVED);

        User hospital5User = createUser("hospital5", "pass", Set.of(Role.HOSPITAL));
        Hospital hospital5=createHospital(hospital5User, "Private Hospital",
                "789 nine line, berlin, MA 235434", "+1-113-0300", AuthStatus.APPROVED);


        log.info("Created 5 hospital users: hospital1, hospital2, hospital3.....hospital5");

        // 3. Create Doctors
        User doctor1User = createUser("doctor1", "pass", Set.of(Role.DOCTOR));
        createDoctor(doctor1User, "Sarah Smith", "LIC001",
            "MBBS, MD (Internal Medicine)", 10, "Boston, MA", AuthStatus.APPROVED, hospital1);

        User doctor2User = createUser("doctor2", "pass", Set.of(Role.DOCTOR));
        createDoctor(doctor2User, "Michael Johnson", "LIC002",
                "MBBS, MS (Surgery)", 15, "Boston, MA", AuthStatus.APPROVED, hospital2);

        User doctor3User = createUser("doctor3", "pass", Set.of(Role.DOCTOR));
        createDoctor(doctor3User, "Emily Davis", "LIC003",
                "MBBS, MD (Pediatrics)", 8, "Boston, MA", AuthStatus.PENDING, hospital1);

        User doctor4User = createUser("doctor4", "pass", Set.of(Role.DOCTOR));
        createDoctor(doctor4User, "James Wilson", "LIC004",
                "MBBS, MD (Cardiology)", 12, "Boston, MA", AuthStatus.APPROVED, hospital4);

        User doctor5User = createUser("doctor5", "pass", Set.of(Role.DOCTOR));
        createDoctor(doctor5User, "Olivia Brown", "LIC005",
                "MBBS, MD (Dermatology)", 7, "Boston, MA", AuthStatus.PENDING, hospital5);

        User doctor6User = createUser("doctor6", "pass", Set.of(Role.DOCTOR));
        createDoctor(doctor6User, "William Taylor", "LIC006",
                "MBBS, MD (Neurology)", 14, "Boston, MA", AuthStatus.APPROVED, hospital1);

        User doctor7User = createUser("doctor7", "pass", Set.of(Role.DOCTOR));
        createDoctor(doctor7User, "Sophia Anderson", "LIC007",
                "MBBS, MD (Gynecology)", 9, "Boston, MA", AuthStatus.PENDING, hospital2);

        User doctor8User = createUser("doctor8", "pass", Set.of(Role.DOCTOR));
        createDoctor(doctor8User, "Daniel Thomas", "LIC008",
                "MBBS, MS (Orthopedics)", 13, "Boston, MA", AuthStatus.PENDING, hospital4);

        User doctor9User = createUser("doctor9", "pass", Set.of(Role.DOCTOR));
        createDoctor(doctor9User, "Isabella Martinez", "LIC009",
                "MBBS, MD (Psychiatry)", 11, "Boston, MA", AuthStatus.APPROVED, hospital4);

        User doctor10User = createUser("doctor10", "pass", Set.of(Role.DOCTOR));
        createDoctor(doctor10User, "Benjamin Lee", "LIC010",
                "MBBS, MD (Oncology)", 16, "Boston, MA", AuthStatus.PENDING, hospital5);

        User doctor11User = createUser("doctor11", "pass", Set.of(Role.DOCTOR));
        createDoctor(doctor11User, "Charlotte White", "LIC011",
                "MBBS, MD (ENT)", 6, "Boston, MA", AuthStatus.APPROVED, hospital1);

        User doctor12User = createUser("doctor12", "pass", Set.of(Role.DOCTOR));
        createDoctor(doctor12User, "Henry Harris", "LIC012",
                "MBBS, MD (Gastroenterology)", 10, "Boston, MA", AuthStatus.APPROVED, hospital2);

        User doctor13User = createUser("doctor13", "pass", Set.of(Role.DOCTOR));
        createDoctor(doctor13User, "Amelia Clark", "LIC013",
                "MBBS, MD (Endocrinology)", 8, "Boston, MA", AuthStatus.APPROVED, hospital5);

        User doctor14User = createUser("doctor14", "pass", Set.of(Role.DOCTOR));
        createDoctor(doctor14User, "Lucas Lewis", "LIC014",
                "MBBS, MS (Urology)", 12, "Boston, MA", AuthStatus.APPROVED, hospital4);

        User doctor15User = createUser("doctor15", "pass", Set.of(Role.DOCTOR));
        createDoctor(doctor15User, "Mia Walker", "LIC015",
                "MBBS, MD (Ophthalmology)", 7, "Boston, MA", AuthStatus.APPROVED, hospital5);

        log.info("Created 15 doctor users: doctor1, doctor2, doctor3, doctor4.......doctor15");

        // 4. Create Patients
        User patient1User = createUser("patient1", "pass", Set.of(Role.PATIENT));
        createPatient(patient1User, "John Doe", 35, "Male", "+1-555-1001", "Boston, MA");

        User patient2User = createUser("patient2", "pass", Set.of(Role.PATIENT));
        createPatient(patient2User, "Jane Smith", 28, "Female", "+1-555-1002", "Cambridge, MA");

        User patient3User = createUser("patient3", "pass", Set.of(Role.PATIENT));
        createPatient(patient3User, "Bob Wilson", 45, "Male", "+1-555-1003", "Somerville, MA");

        User patient4User = createUser("patient4", "pass", Set.of(Role.PATIENT));
        createPatient(patient4User, "Alice Johnson", 30, "Female", "+1-555-1004", "Boston, MA");

        User patient5User = createUser("patient5", "pass", Set.of(Role.PATIENT));
        createPatient(patient5User, "Michael Brown", 42, "Male", "+1-555-1005", "Cambridge, MA");

        User patient6User = createUser("patient6", "pass", Set.of(Role.PATIENT));
        createPatient(patient6User, "Emma Davis", 25, "Female", "+1-555-1006", "Somerville, MA");

        User patient7User = createUser("patient7", "pass", Set.of(Role.PATIENT));
        createPatient(patient7User, "David Miller", 50, "Male", "+1-555-1007", "Boston, MA");

        User patient8User = createUser("patient8", "pass", Set.of(Role.PATIENT));
        createPatient(patient8User, "Sophia Wilson", 22, "Female", "+1-555-1008", "Cambridge, MA");

        User patient9User = createUser("patient9", "pass", Set.of(Role.PATIENT));
        createPatient(patient9User, "James Moore", 37, "Male", "+1-555-1009", "Somerville, MA");

        User patient10User = createUser("patient10", "pass", Set.of(Role.PATIENT));
        createPatient(patient10User, "Olivia Taylor", 29, "Female", "+1-555-1010", "Boston, MA");

        User patient11User = createUser("patient11", "pass", Set.of(Role.PATIENT));
        createPatient(patient11User, "Daniel Anderson", 41, "Male", "+1-555-1011", "Cambridge, MA");

        User patient12User = createUser("patient12", "pass", Set.of(Role.PATIENT));
        createPatient(patient12User, "Isabella Thomas", 33, "Female", "+1-555-1012", "Somerville, MA");

        User patient13User = createUser("patient13", "pass", Set.of(Role.PATIENT));
        createPatient(patient13User, "William Jackson", 48, "Male", "+1-555-1013", "Boston, MA");

        log.info("Created 13 patient users: patient1, patient2, patient3..........patient13");

        log.info("========================================");
        log.info("TEST DATA INITIALIZATION COMPLETE!");
        log.info("========================================");
        log.info("All users have password: pass");
        log.info("----------------------------------------");
        log.info("ADMIN:     admin");
        log.info("HOSPITALS: hospital1, hospital2, hospital3 (pending),....hospital5");
        log.info("DOCTORS:   doctor1, doctor2, doctor3, doctor4.........doctor15 all pending");
        log.info("PATIENTS:  patient1, patient2, patient3........patient13");
        log.info("========================================");
    }

    private User createUser(String username, String rawPassword, Set<Role> roles) {
        User user = new User();
        user.setUsername(username);
        user.setPassword(passwordEncoder.encode(rawPassword));
        user.setRoles(roles);
        return userRepository.save(user);
    }

    private Hospital createHospital(User user, String name, String address, String contact, AuthStatus status) {
        Hospital hospital = new Hospital();
        hospital.setUser(user);
        hospital.setName(name);
        hospital.setAddress(address);
        hospital.setContact(contact);
        hospital.setAuthStatus(status);
        hospital.setRejectionReason("");
        return hospitalRepository.save(hospital);
    }

    private Doctor createDoctor(User user, String name, String licenceNumber, String qualification,
            int experience, String location, AuthStatus status, Hospital hospital) {
        Doctor doctor = new Doctor();
        doctor.setUser(user);
        doctor.setName(name);
        doctor.setLicenceNumber(licenceNumber);
        doctor.setQualification(qualification);
        doctor.setExperience(experience);
        doctor.setLocation(location);
        doctor.setAuthStatus(status);
        doctor.setHospital(hospital);
        doctor.setRejectionReason("");
        return doctorRepository.save(doctor);
    }

    private Patient createPatient(User user, String name, int age, String gender, String phone, String location) {
        Patient patient = new Patient();
        patient.setUser(user);
        patient.setName(name);
        patient.setAge(age);
        patient.setGender(gender);
        patient.setPhone(phone);
        patient.setLocation(location);
        return patientRepository.save(patient);
    }


}
