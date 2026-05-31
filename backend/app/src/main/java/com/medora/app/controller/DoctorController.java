package com.medora.app.controller;

import com.medora.app.constants.BookingStatus;
import com.medora.app.dto.*;
import com.medora.app.service.*;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("api/doctor")
public class DoctorController {

    private final DoctorService doctorService;

    private final PrescriptionService prescriptionService;

    private final SlotService slotService;

    private final AppointmentService appointmentService;

    private final ReviewService reviewService;

    private final UserService userService;

    private final QueryService queryService;

    private final ReplyService replyService;

    public DoctorController(DoctorService doctorService, PrescriptionService prescriptionService, SlotService slotService, AppointmentService appointmentService, ReviewService reviewService, UserService userService, QueryService queryService, ReplyService replyService) {
        this.doctorService = doctorService;
        this.prescriptionService = prescriptionService;
        this.slotService = slotService;
        this.appointmentService = appointmentService;
        this.reviewService = reviewService;
        this.userService = userService;
        this.queryService = queryService;
        this.replyService = replyService;
    }

//    profile
    @GetMapping("/profile")
    public ResponseEntity<DoctorDTO> viewProfile(){
        return ResponseEntity.ok(doctorService.viewProfile());
    }

    @PutMapping("/profile")
    public ResponseEntity<DoctorDTO> updateProfile(@RequestBody DoctorDTO doctorDTO){
        return ResponseEntity.ok(doctorService.updateDoctor(doctorDTO));
    }

    @PatchMapping("/password")
    public ResponseEntity<?> changePassword(@RequestBody ChangePasswordDTO changePasswordDTO){
        if(userService.changePassword(changePasswordDTO)){
            return ResponseEntity.ok("Password changed Successfully");
        }else {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Wrong old Password");
        }
    }


//     slots
    @PostMapping("/{doctorId}/slots")
    public ResponseEntity<?> provideSlots(@PathVariable long doctorId){
        return ResponseEntity.ok(slotService.provideSlots(doctorId));
    }

//      prescriptions
    @PostMapping("/appointments/{appointmentId}/prescriptions")
    public ResponseEntity<PrescriptionDTO> createPrescription(@RequestBody PrescriptionDTO dto, @PathVariable long appointmentId){
        return ResponseEntity.ok(prescriptionService.addPrescription(dto, appointmentId));
    }

    @GetMapping("/prescriptions/{prescriptionId}")
    public ResponseEntity<PrescriptionDTO> getPrescription(@PathVariable long prescriptionId){
        return ResponseEntity.ok(prescriptionService.getPrescriptionDTO(prescriptionId));
    }

    @GetMapping("/prescriptions/patients/{patientId}")
    public ResponseEntity<List<PrescriptionDTO>> getPatientPrescriptions(@PathVariable long patientId){
        return ResponseEntity.ok(prescriptionService.getPatientPrescriptions(patientId));
    }

    @PutMapping("/prescriptions/{prescriptionId}")
    public ResponseEntity<PrescriptionDTO> updatePrescription(@PathVariable long prescriptionId, @RequestBody PrescriptionDTO prescriptionDTO){
        return ResponseEntity.ok(prescriptionService.updatePrescription(prescriptionId, prescriptionDTO));
    }

    @DeleteMapping("/prescriptions/{patientId}")
    public ResponseEntity<?> deletePrescription(@PathVariable long patientId){
        return ResponseEntity.ok(prescriptionService.deletePrescription(patientId));
    }

    // appointments
    @GetMapping("/appointments")
    public ResponseEntity<List<AppointmentDTO>> getAllAppointments(){
        return ResponseEntity.ok(appointmentService.getDoctorAppointments());
    }

    @GetMapping("/appointments/{appointmentId}")
    public ResponseEntity<AppointmentDTO> getAppointment(@PathVariable long appointmentId){
        return ResponseEntity.ok(appointmentService.getAppointmentDTO(appointmentId));
    }

    @GetMapping("/appointments/booked")
    public ResponseEntity<List<AppointmentDTO>> getBookedAppointments(){
        return ResponseEntity.ok(appointmentService.getDoctorAppointmentsByBookingStatus(BookingStatus.BOOKED));
    }

    @GetMapping("/appointments/completed")
    public ResponseEntity<List<AppointmentDTO>> getCompletedAppointments(){
        return ResponseEntity.ok(appointmentService.getDoctorAppointmentsByBookingStatus(BookingStatus.COMPLETED));
    }

    @GetMapping("/appointments/cancelled")
    public ResponseEntity<List<AppointmentDTO>> getCancelledAppointments(){
        return ResponseEntity.ok(appointmentService.getDoctorAppointmentsByBookingStatus(BookingStatus.CANCELLED));
    }

    //reviews
    @GetMapping("/reviews")
    public ResponseEntity<List<ReviewDTO>> getAllReviews(){
        long doctorId= userService.getUserByUsername(SecurityContextHolder
                .getContext().getAuthentication().getName()).getId();
        return ResponseEntity.ok(reviewService.getDoctorReviews(doctorId));
    }

    // replies
    @GetMapping("/queries/{queryId}/replies")
    public ResponseEntity<List<ReplyDTO>> getQueryReplies(@PathVariable long queryId){
        return ResponseEntity.ok(replyService.getQueryReplies(queryId));
    }

    @PostMapping("/queries/{queryId}/replies")
    public ResponseEntity<ReplyDTO> postReply(@RequestBody ReplyDTO replyDTO, @PathVariable long queryId){
        return ResponseEntity.ok(replyService.addReply(replyDTO, queryId));
    }

    @DeleteMapping("/replies/{replyId}")
    public ResponseEntity<?> deleteReply(@PathVariable long replyId){
        return ResponseEntity.ok(replyService.deleteReply(replyId));
    }

    // queries
    @GetMapping("/queries")
    public ResponseEntity<List<QueryDTO>> getAllQueries(){
        return ResponseEntity.ok(queryService.getAllQueries());
    }

    // notifications

}
