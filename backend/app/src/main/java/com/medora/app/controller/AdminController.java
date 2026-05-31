package com.medora.app.controller;

import com.medora.app.constants.AuthStatus;
import com.medora.app.constants.ReportStatus;
import com.medora.app.dto.*;
import com.medora.app.service.*;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin")
public class AdminController {

    private final DoctorService doctorService;

    private final HospitalService hospitalService;

    private final PatientService patientService;

    private final UserService userService;

    private final FraudReportService fraudReportService;

    private final QueryService queryService;

    private final ReplyService replyService;

    public AdminController(DoctorService doctorService, HospitalService hospitalService, PatientService patientService, UserService userService, FraudReportService fraudReportService, QueryService queryService, ReplyService replyService){
        this.doctorService = doctorService;
        this.hospitalService = hospitalService;
        this.patientService = patientService;
        this.userService = userService;
        this.fraudReportService = fraudReportService;
        this.queryService = queryService;
        this.replyService = replyService;
    }

    // profile
    @GetMapping("/profile")
    public ResponseEntity<UserDTO> getProfile(){
        return ResponseEntity.ok(userService.profile());
    }

    //    users
    @GetMapping("/users/{userId}")
    public ResponseEntity<UserDTO> getUser(@PathVariable long userId){
        return ResponseEntity.ok(userService.getUserDTO(userId));
    }

//    hospitals
    @GetMapping("/hospitals")
    public ResponseEntity<List<HospitalDTO>> getHospitals(){
        return ResponseEntity.ok(hospitalService.getAllHospitals());
    }

    @GetMapping("/hospitals/approved")
    public ResponseEntity<List<HospitalDTO>> getApprovedHospitals(){
        return ResponseEntity.ok(hospitalService.getAllHospitalByAuthStatus(AuthStatus.APPROVED));
    }

    @GetMapping("/hospitals/rejected")
    public ResponseEntity<List<HospitalDTO>> getRejectedHospitals(){
        return ResponseEntity.ok(hospitalService.getAllHospitalByAuthStatus(AuthStatus.REJECTED));
    }
    @GetMapping("/hospitals/suspended")
    public ResponseEntity<List<HospitalDTO>> getSuspendedHospitals(){
        return ResponseEntity.ok(hospitalService.getAllHospitalByAuthStatus(AuthStatus.SUSPENDED));
    }
    @GetMapping("/hospitals/fraud")
    public ResponseEntity<List<HospitalDTO>> getFraudHospitals(){
        return ResponseEntity.ok(hospitalService.getAllHospitalByAuthStatus(AuthStatus.FRAUD));
    }

    @GetMapping("/hospitals/{hospitalId}")
    public ResponseEntity<HospitalDTO> getHospital(@PathVariable long hospitalId){
        return ResponseEntity.ok(hospitalService.getHospitalDTO(hospitalId));
    }

    @PatchMapping("/hospitals/{hospitalId}/approve")
    public ResponseEntity<HospitalDTO> approveHospitals(@PathVariable Long hospitalId){
        return ResponseEntity.ok(hospitalService.approveHospital(hospitalId));
    }

    @PatchMapping("/hospitals/{hospitalId}/reject")
    public ResponseEntity<HospitalDTO> rejectHospitals(@PathVariable Long hospitalId, @RequestBody HospitalDTO dto){
        return ResponseEntity.ok(hospitalService.updateAuthStatus(hospitalId, AuthStatus.REJECTED, dto));
    }

    @PatchMapping("/hospitals/{hospitalId}/suspend")
    public ResponseEntity<HospitalDTO> suspendHospitals(@PathVariable Long hospitalId, @RequestBody HospitalDTO dto){
        return ResponseEntity.ok(hospitalService.updateAuthStatus(hospitalId, AuthStatus.SUSPENDED, dto));
    }

    @PatchMapping("/hospitals/{hospitalId}/fraud")
    public ResponseEntity<HospitalDTO> markHospitalFraud(@PathVariable Long hospitalId, @RequestBody HospitalDTO dto){
        return ResponseEntity.ok(hospitalService.updateAuthStatus(hospitalId, AuthStatus.FRAUD, dto));
    }

//    fraud-reports
    @GetMapping("/fraud-reports")
    public ResponseEntity<List<FraudReportDTO>> getAllFraudReports(){
        return ResponseEntity.ok(fraudReportService.getAllFraudReports());
    }

    @GetMapping("/doctors/{doctorId}/fraud-reports")
    public ResponseEntity<List<FraudReportDTO>> getHospitalFraudReports(@PathVariable long doctorId){
        return ResponseEntity.ok(fraudReportService.getDoctorFraudReports(doctorId));
    }

    @GetMapping("/fraud-reports/{fraudReportId}")
    public ResponseEntity<FraudReportDTO> getFraudReport(@PathVariable long fraudReportId){
        return ResponseEntity.ok(fraudReportService.getFraudReportDTO(fraudReportId));
    }

    @GetMapping("/fraud-reports/opened")
    public ResponseEntity<List<FraudReportDTO>> getOpenReports(){
        return ResponseEntity.ok(fraudReportService.getAllFraudReportsByStatus(ReportStatus.OPEN));
    }

    @GetMapping("/fraud-reports/reviewed")
    public ResponseEntity<List<FraudReportDTO>> getReviewedReports(){
        return ResponseEntity.ok(fraudReportService.getAllFraudReportsByStatus(ReportStatus.REVIEWED));
    }

    @GetMapping("/fraud-reports/resolved")
    public ResponseEntity<List<FraudReportDTO>> getResolvedReports(){
        return ResponseEntity.ok(fraudReportService.getAllFraudReportsByStatus(ReportStatus.RESOLVED));
    }

    @PatchMapping("/fraud-reports/{fraudReportId}/review")
    public ResponseEntity<FraudReportDTO> reviewFraudReport(@PathVariable long fraudReportId){
        return ResponseEntity.ok(fraudReportService.updateReportStatus(fraudReportId, ReportStatus.REVIEWED));
    }

    @PatchMapping("/fraud-reports/{fraudReportId}/resolve")
    public ResponseEntity<FraudReportDTO> resolveFraudReport(@PathVariable long fraudReportId){
        return ResponseEntity.ok(fraudReportService.updateReportStatus(fraudReportId, ReportStatus.RESOLVED));
    }


//  patients
    @GetMapping("/patients")
    public ResponseEntity<List<PatientDTO>> getAllPatients(){
        return ResponseEntity.ok(patientService.getAllPatients());
    }

    @GetMapping("/patients/{patientId}")
    public ResponseEntity<PatientDTO> getPatient(@PathVariable long patientId){
        return ResponseEntity.ok(patientService.getPatientDTO(patientId));
    }


//    doctors
    @GetMapping("/doctors")
    public ResponseEntity<List<DoctorDTO>> getAllDoctors(){
        return ResponseEntity.ok(doctorService.getAllDoctors());
    }

    @GetMapping("/doctors/{doctorId}")
    public ResponseEntity<DoctorDTO> getDoctor(@PathVariable long doctorId){
        return ResponseEntity.ok(doctorService.getDoctorDTO(doctorId));
    }

    @GetMapping("/doctors/approved")
    public ResponseEntity<List<DoctorDTO>> getApprovedDoctors(){
        return ResponseEntity.ok(doctorService.getDoctorsByAuthStatus(AuthStatus.APPROVED));
    }

    @GetMapping("/doctors/rejected")
    public ResponseEntity<List<DoctorDTO>> getRejectedDoctors(){
        return ResponseEntity.ok(doctorService.getDoctorsByAuthStatus(AuthStatus.REJECTED));
    }

    @GetMapping("/doctors/suspended")
    public ResponseEntity<List<DoctorDTO>> getSuspendedDoctors(){
        return ResponseEntity.ok(doctorService.getDoctorsByAuthStatus(AuthStatus.SUSPENDED));
    }

    @GetMapping("/doctors/fraud")
    public ResponseEntity<List<DoctorDTO>> getFraudDoctors(){
        return ResponseEntity.ok(doctorService.getDoctorsByAuthStatus(AuthStatus.FRAUD));
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
