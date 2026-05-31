package com.medora.app.service.impl;


import com.medora.app.constants.BookingStatus;
import com.medora.app.constants.SlotStatus;
import com.medora.app.constants.SlotType;
import com.medora.app.dto.AppointmentDTO;
import com.medora.app.entity.*;
import com.medora.app.mapper.AppointmentMapper;
import com.medora.app.repository.AppointmentRepository;
import com.medora.app.service.*;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class AppointmentServiceImpl implements AppointmentService {

    private final AppointmentRepository appointmentRepository;

    private final DoctorService doctorService;

    private final UserService userService;

    private final PatientService patientService;

    private final SlotService slotService;

    private final AppointmentMapper appointmentMapper;

    public AppointmentServiceImpl(AppointmentRepository appointmentRepository, DoctorService doctorService, UserService userService, PatientService patientService, SlotService slotService, AppointmentMapper appointmentMapper) {
        this.appointmentRepository = appointmentRepository;
        this.doctorService = doctorService;
        this.userService = userService;
        this.patientService = patientService;
        this.slotService = slotService;
        this.appointmentMapper = appointmentMapper;
    }

    @Override
    public List<AppointmentDTO> getAllAppointments(){
        return appointmentRepository.findAll().stream()
                .map(appointment -> appointmentMapper.mapToDTO(appointment))
                .collect(Collectors.toList());
    }

    @Override
    public AppointmentDTO bookAppointment(Long doctorId, AppointmentDTO appointmentDTO) {
        Appointment appointment=appointmentMapper.mapToEntity(appointmentDTO);

        long patientId=userService.getUserByUsername(SecurityContextHolder.getContext().getAuthentication().getName()).getId();

        Slot slot=slotService.bookSlot(
                doctorId,
                appointment.getAppointmentDate(),
                appointment.getSlotType()
        );


        Doctor doctor = doctorService.getDoctor(doctorId);
        Patient patient = patientService.getPatient(patientId);

        if(slot==null){
            appointment.setBookingStatus(BookingStatus.WAITING_LIST);
        }else{
            appointment.setBookingStatus(BookingStatus.BOOKED);
        }
        appointment.setDoctor(doctor);
        appointment.setPatient(patient);

        return appointmentMapper.mapToDTO(appointmentRepository.save(appointment));

    }

    @Override
    public Appointment saveAppointment(Appointment appointment){
        return appointmentRepository.save(appointment);
    }

    @Override
    public List<AppointmentDTO> getDoctorAppointments() {
        User user=userService.getUserByUsername(SecurityContextHolder.getContext().getAuthentication().getName());
        return appointmentRepository.findByDoctorIdOrderByAppointmentDateAsc(user.getId()).stream()
                .map(appointment -> appointmentMapper.mapToDTO(appointment))
                .collect(Collectors.toList());
    }

    @Override
    public List<AppointmentDTO> getPatientAppointments() {
        User user=userService.getUserByUsername(SecurityContextHolder.getContext().getAuthentication().getName());
        return appointmentRepository.findByPatientIdOrderByAppointmentDateDesc(user.getId()).stream()
                .map(appointment -> appointmentMapper.mapToDTO(appointment))
                .collect(Collectors.toList());
    }

    @Override
    public AppointmentDTO updateBookingStatus(long appointmentId, String status) {
        Appointment appointment = getAppointment(appointmentId);

        appointment.setBookingStatus(BookingStatus.valueOf(status.toUpperCase()));

        return appointmentMapper.mapToDTO(appointmentRepository.save(appointment));
    }

    @Override
    public AppointmentDTO cancelAppointment(long appointmentId) {
        Appointment appointment = getAppointment(appointmentId);
        appointment.setBookingStatus(BookingStatus.CANCELLED);

        LocalTime slotEndTime = slotService.getSlotEndTime(appointment.getSlotType());
        LocalTime now =LocalTime.now();
        LocalDate today=LocalDate.now();
        // If slot isn't begin
        if (today.isBefore(appointment.getAppointmentDate()) || now.isBefore(slotEndTime.minusHours(2))) {
            slotService.freeSlot(appointment.getDoctor().getId(),
                    appointment.getAppointmentDate(),
                    appointment.getSlotType());
        }
        return appointmentMapper.mapToDTO(appointmentRepository.save(appointment));
    }

    @Override
    public AppointmentDTO getAppointmentDTO(long id) {
        return appointmentMapper.mapToDTO(getAppointment(id));
    }

    @Override
    public Appointment getAppointment(long id) {
        return appointmentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Appointment not found"));
    }

    @Override
    public List<AppointmentDTO> getDoctorAppointmentsByDate(LocalDate date) {
        long doctorId=userService.getUserByUsername(SecurityContextHolder
                .getContext().getAuthentication().getName()).getId();
        return appointmentRepository.findByDoctorIdAndAppointmentDate(doctorId, date).stream()
                .map(appointment -> appointmentMapper.mapToDTO(appointment))
                .collect(Collectors.toList());
    }

    @Override
    public List<Appointment> findByDoctorIdAndAppointmentDate(Long doctorId, LocalDate date){
        return appointmentRepository.findByDoctorIdAndAppointmentDate(doctorId, date);
    }

    @Override
    public List<Appointment> findByAppointmentDateAndBookingStatus(LocalDate date, BookingStatus bookingStatus){
        return appointmentRepository.findByAppointmentDateAndBookingStatus(LocalDate.now(),bookingStatus);
    }

    @Override
    public List<AppointmentDTO> getPatientAppointmentsByBookingStatus(BookingStatus bookingStatus) {
        User user=userService.getUserByUsername(SecurityContextHolder.getContext().getAuthentication().getName());
        return appointmentRepository.findByPatientIdOrderByAppointmentDateDesc(user.getId()).stream()
                .filter(appointment -> appointment.getBookingStatus().equals(bookingStatus))
                .map(appointment -> appointmentMapper.mapToDTO(appointment))
                .collect(Collectors.toList());
    }

    @Override
    public List<AppointmentDTO> getDoctorAppointmentsByBookingStatus(BookingStatus bookingStatus) {
        User user=userService.getUserByUsername(SecurityContextHolder.getContext().getAuthentication().getName());
        return appointmentRepository.findByDoctorIdOrderByAppointmentDateAsc(user.getId()).stream()
                .filter(appointment -> appointment.getBookingStatus().equals(bookingStatus))
                .map(appointment -> appointmentMapper.mapToDTO(appointment))
                .collect(Collectors.toList());
    }

    @Override
    public List<AppointmentDTO> getHospitalAppointments(){
        User user=userService.getUserByUsername(SecurityContextHolder.getContext().getAuthentication().getName());
        return getAllAppointments().stream()
                .filter(appointment -> appointment
                        .getDoctor().getHospital().getId() == user.getId())
                .collect(Collectors.toList());
    }

    @Scheduled(fixedRate = 300000)
    public void updateAppointments() {

        LocalDate today = LocalDate.now();
        LocalTime now = LocalTime.now();

        List<Appointment> appointments = findByAppointmentDateAndBookingStatus(today, BookingStatus.BOOKED);

        for (Appointment appointment : appointments) {

            LocalTime slotEndTime = slotService.getSlotEndTime(appointment.getSlotType());

            // If slot time is over
            if (now.isAfter(slotEndTime)) {

                // Mark appointment completed
                appointment.setBookingStatus(BookingStatus.COMPLETED);
                saveAppointment(appointment);

            }
        }
    }

    @Scheduled(fixedRate = 300000)
    public void scheduleWaitingList() {

        List<Appointment> waitingList =
                appointmentRepository.findByBookingStatus(BookingStatus.WAITING_LIST);

        for (Appointment appointment : waitingList) {

            Long doctorId = appointment.getDoctor().getId();
            LocalDate date = appointment.getAppointmentDate();

            boolean assigned = false;
            SlotType selectedSlot = null;

            while (!assigned && date.isBefore(LocalDate.now().plusDays(30))) {

                Slot slot = slotService.getAvailableSlots(doctorId, date);

                if (slot != null) {

                    if (slot.getMorning() == SlotStatus.AVAILABLE) {
                        selectedSlot = SlotType.MORNING;
                        slot.setMorning(SlotStatus.BOOKED);
                        assigned = true;
                    }
                    else if (slot.getPreNoon() == SlotStatus.AVAILABLE) {
                        selectedSlot = SlotType.PRE_NOON;
                        slot.setPreNoon(SlotStatus.BOOKED);
                        assigned = true;
                    }
                    else if (slot.getAfterNoon() == SlotStatus.AVAILABLE) {
                        selectedSlot = SlotType.AFTER_NOON;
                        slot.setAfterNoon(SlotStatus.BOOKED);
                        assigned = true;
                    }
                    else if (slot.getEvening() == SlotStatus.AVAILABLE) {
                        selectedSlot = SlotType.EVENING;
                        slot.setEvening(SlotStatus.BOOKED);
                        assigned = true;
                    }
                    else if (slot.getNight() == SlotStatus.AVAILABLE) {
                        selectedSlot = SlotType.NIGHT;
                        slot.setNight(SlotStatus.BOOKED);
                        assigned = true;
                    }

                    if (assigned) {
                        slotService.saveSlot(slot);
                    }
                }

                // If no slot available, move to next day
                if (!assigned) {
                    date = date.plusDays(1);
                }
            }

            // Update appointment
            appointment.setAppointmentDate(date);
            appointment.setSlotType(selectedSlot);
            appointment.setBookingStatus(BookingStatus.BOOKED);

            saveAppointment(appointment);
        }
    }

}

