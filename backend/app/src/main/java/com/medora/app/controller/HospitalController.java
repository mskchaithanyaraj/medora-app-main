package com.medora.app.controller;

import java.util.HashMap;
import java.util.List;

import com.medora.app.constants.AuthStatus;
import com.medora.app.dto.*;
import com.medora.app.service.*;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/hospital")
public class HospitalController {

    private final DoctorService doctorService;
    private final UserService userService;
    private final AppointmentService appointmentService;
    private final QueryService queryService;
    private final ReplyService replyService;
    private final HospitalService hospitalService;
    private final SlotService slotService;

    public HospitalController(DoctorService doctorService, UserService userService, AppointmentService appointmentService, QueryService queryService, ReplyService replyService, HospitalService hospitalService, SlotService slotService) {
        this.doctorService = doctorService;
        this.userService = userService;
        this.appointmentService = appointmentService;
        this.queryService = queryService;
        this.replyService = replyService;
        this.hospitalService = hospitalService;
        this.slotService = slotService;
    }

 //    profile
    @GetMapping("/profile")
    public ResponseEntity<HospitalDTO> getProfile(){
        return ResponseEntity.ok(hospitalService.viewProfile());
    }

    @PutMapping("/profile")
    public ResponseEntity<HospitalDTO> updateProfile(@RequestBody HospitalDTO hospitalDTO){
        return ResponseEntity.ok(hospitalService.updateHospital(hospitalDTO));
    }

    @PatchMapping("/password")
    public ResponseEntity<?> changePassword(@RequestBody ChangePasswordDTO changePasswordDTO){
        if(userService.changePassword(changePasswordDTO)){
            return ResponseEntity.ok("Password changed Successfully");
        }else {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Wrong old Password");
        }
    }

    //    doctors
    @GetMapping("/doctors")
    public ResponseEntity<List<DoctorDTO>> getAllDoctorsOfHospital(){
        long hospitalId=userService.getUserByUsernameDTO(SecurityContextHolder
                .getContext().getAuthentication().getName()).getId();
        return ResponseEntity.ok(doctorService.getDoctorsByHospital(hospitalId));
    }

    @GetMapping("/doctors/approved")
    public ResponseEntity<List<DoctorDTO>> getApprovedDoctors() {
        return ResponseEntity.ok(doctorService.getDoctorsByHospitalAndAuthStatus(AuthStatus.APPROVED));
    }

    @GetMapping("/doctors/pending")
    public ResponseEntity<List<DoctorDTO>> getPendingDoctors() {
        return ResponseEntity.ok(doctorService.getDoctorsByHospitalAndAuthStatus(AuthStatus.PENDING));
    }

    @GetMapping("/doctors/rejected")
    public ResponseEntity<List<DoctorDTO>> getRejectedDoctors() {
        return ResponseEntity.ok(doctorService.getDoctorsByHospitalAndAuthStatus(AuthStatus.REJECTED));
    }

    @GetMapping("/doctors/suspended")
    public ResponseEntity<List<DoctorDTO>> getSuspendedDoctors() {
        return ResponseEntity.ok(doctorService.getDoctorsByHospitalAndAuthStatus(AuthStatus.SUSPENDED));
    }

    @GetMapping("/doctors/fraud")
    public ResponseEntity<List<DoctorDTO>> getFraudDoctors() {
        return ResponseEntity.ok(doctorService.getDoctorsByHospitalAndAuthStatus(AuthStatus.FRAUD));
    }

    @PatchMapping("/doctors/{doctorId}/approve")
    public ResponseEntity<DoctorDTO> approveDoctor(@PathVariable long doctorId){
        slotService.provideSlots(doctorId);
        return ResponseEntity.ok(doctorService.approveDoctor(doctorId));
    }

    @PatchMapping("/doctors/{doctorId}/reject")
    public ResponseEntity<DoctorDTO> rejectDoctor(@PathVariable long doctorId, @RequestBody DoctorDTO dto){
        return ResponseEntity.ok(doctorService.updateAuthStatus(doctorId, AuthStatus.REJECTED, dto));
    }

    @PatchMapping("/doctors/{doctorId}/suspend")
    public ResponseEntity<DoctorDTO> suspendDoctor(@PathVariable long doctorId, @RequestBody DoctorDTO dto){
        return ResponseEntity.ok(doctorService.updateAuthStatus(doctorId, AuthStatus.SUSPENDED, dto));
    }

    @PatchMapping("/doctors/{doctorId}/fraud")
    public ResponseEntity<DoctorDTO> markDoctorFraud(@PathVariable long doctorId, @RequestBody DoctorDTO dto){
        return ResponseEntity.ok(doctorService.updateAuthStatus(doctorId, AuthStatus.FRAUD, dto));
    }

//    appointments
    @GetMapping("/appointments")
    public ResponseEntity<List<AppointmentDTO>> viewAppointments(){
        return ResponseEntity.ok(appointmentService.getHospitalAppointments());
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
