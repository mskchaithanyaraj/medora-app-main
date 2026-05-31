package com.medora.app.controller;

import com.medora.app.constants.AuthStatus;
import com.medora.app.dto.*;
import com.medora.app.service.*;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.HashMap;
import java.util.List;

@RestController
@RequestMapping("/api/patient")
public class PatientController {

    private final PrescriptionService prescriptionService;

    private final AppointmentService appointmentService;

    private final PatientService patientService;

    private final UserService userService;

    private final SlotService slotService;

    private final ReviewService reviewService;

    private final FraudReportService fraudReportService;

    private final QueryService queryService;

    private final ReplyService replyService;

    private final DoctorService doctorService;

    public PatientController(PrescriptionService prescriptionService, AppointmentService appointmentService, PatientService patientService, UserService userService, SlotService slotService, ReviewService reviewService, FraudReportService fraudReportService, QueryService queryService, ReplyService replyService, DoctorService doctorService){
        this.prescriptionService = prescriptionService;
        this.appointmentService = appointmentService;
        this.patientService = patientService;
        this.userService = userService;
        this.slotService = slotService;
        this.reviewService = reviewService;
        this.fraudReportService = fraudReportService;
        this.queryService = queryService;
        this.replyService = replyService;
        this.doctorService = doctorService;
    }

    // view profile
    @GetMapping("/profile")
    public ResponseEntity<PatientDTO> viewProfile(){
        PatientDTO patientDTO = patientService.viewProfile();
        return new ResponseEntity<PatientDTO>(patientDTO, HttpStatus.OK);
    }

    @PutMapping("/profile")
    public ResponseEntity<PatientDTO> updateProfile(@RequestBody PatientDTO patientDTO){
        return ResponseEntity.ok(patientService.updatePatient(patientDTO));
    }

    @PatchMapping("/password")
    public ResponseEntity<?> changePassword(@RequestBody ChangePasswordDTO changePasswordDTO){
        if(userService.changePassword(changePasswordDTO)){
            return ResponseEntity.ok("Password changed Successfully");
        }else {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Wrong old Password");
        }
    }


    // delete profile
    @DeleteMapping("/{patientId}")
    public void deletePatient(@PathVariable long patientId){
        patientService.deletePatient(patientId);
    }

    //Slots
    @GetMapping("/doctors/{doctorId}/slots/{date}")
    public ResponseEntity<SlotDTO> getDoctorAvailability(@PathVariable long doctorId, @PathVariable LocalDate date){
        return ResponseEntity.ok(slotService.getAvailableSlotsDTO(doctorId, date));
    }

    //doctors
    @GetMapping("/doctors")
    public ResponseEntity<List<DoctorDTO>> getAllDoctors(){
        return ResponseEntity.ok(doctorService.getDoctorsByAuthStatus(AuthStatus.APPROVED));
    }


    // appointments
    @GetMapping("/appointments")
    public ResponseEntity<List<AppointmentDTO>> getBookedAppointments(){
        return ResponseEntity.ok(appointmentService.getPatientAppointments());
    }

    @PostMapping("/doctors/{doctorId}/appointments")
    public ResponseEntity<AppointmentDTO> bookAppointment(@PathVariable long doctorId, @RequestBody AppointmentDTO appointmentDTO){
        return ResponseEntity.ok(appointmentService.bookAppointment(doctorId, appointmentDTO));
    }

    @PatchMapping("/appointments/{appointmentId}")
    public ResponseEntity<AppointmentDTO> cancelAppointment(@PathVariable long appointmentId){
        return ResponseEntity.ok(appointmentService.cancelAppointment(appointmentId));
    }


    // reviews
    @GetMapping("/reviews")
    public ResponseEntity<List<ReviewDTO>> getAllReviews(){
        return ResponseEntity.ok(reviewService.getPatientReviews());
    }

    @GetMapping("/doctors/{doctorId}/reviews")
    public ResponseEntity<List<ReviewDTO>> getDoctorReviews(@PathVariable long doctorId){
        return ResponseEntity.ok(reviewService.getDoctorReviews(doctorId));
    }

    @GetMapping("/reviews/{reviewId}")
    public ResponseEntity<ReviewDTO> getReview(@PathVariable long reviewId){
        return ResponseEntity.ok(reviewService.getReviewDTO(reviewId));
    }

    @PostMapping("/doctors/{doctorId}/reviews")
    public ResponseEntity<ReviewDTO> postReviews(@RequestBody ReviewDTO reviewDTO, @PathVariable long doctorId){
        return ResponseEntity.ok(reviewService.addReview(reviewDTO, doctorId));
    }

    @DeleteMapping("/reviews/{reviewId}")
    public ResponseEntity<?> deleteReview(@PathVariable long reviewId){
        return ResponseEntity.ok(reviewService.deleteReview(reviewId));
    }

    // prescriptions
    @GetMapping("/prescriptions")
    public ResponseEntity<List<PrescriptionDTO>> getPatientPrescriptions(){
        long patientId = userService.getUserByUsername(SecurityContextHolder.getContext()
                .getAuthentication().getName()).getId();
        return ResponseEntity.ok(prescriptionService.getPatientPrescriptions(patientId));
    }

    @GetMapping("/prescriptions/{prescriptionId}")
    public ResponseEntity<PrescriptionDTO> getPrescription(@PathVariable long prescriptionId){
        return ResponseEntity.ok(prescriptionService.getPrescriptionDTO(prescriptionId));
    }

    //fraud-reports
    @GetMapping("/fraud-reports")
    public ResponseEntity<List<FraudReportDTO>> getAllFraudReports(){
        return ResponseEntity.ok(fraudReportService.getPatientFraudReports());
    }

    @PostMapping("/doctors/{doctorId}/fraud-reports")
    public ResponseEntity<FraudReportDTO> postFraudReport(@RequestBody FraudReportDTO fraudReportDTO, @PathVariable long doctorId){
        return ResponseEntity.ok(fraudReportService.addFraudReport(fraudReportDTO, doctorId));
    }

    // queries
    @GetMapping("/queries")
    public ResponseEntity<List<QueryDTO>> getAllQueries(){
        return ResponseEntity.ok(queryService.getPatientQueries());
    }

    @PostMapping("/queries")
    public ResponseEntity<QueryDTO> postQuery(@RequestBody QueryDTO queryDTO){
        return ResponseEntity.ok(queryService.addQuery(queryDTO));
    }

    @DeleteMapping("/queries/{queryId}")
    public ResponseEntity<?> deleteQuery(@PathVariable long queryId){
        return ResponseEntity.ok(queryService.deleteQuery(queryId));
    }

    // replies
    @GetMapping("/queries/{queryId}/replies")
    public ResponseEntity<List<ReplyDTO>> getQueryReplies(@PathVariable long queryId){
        return ResponseEntity.ok(replyService.getQueryReplies(queryId));
    }

    // notifications

}