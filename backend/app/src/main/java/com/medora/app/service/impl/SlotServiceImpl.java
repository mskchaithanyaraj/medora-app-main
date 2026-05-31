package com.medora.app.service.impl;

import com.medora.app.constants.SlotStatus;
import com.medora.app.constants.SlotType;
import com.medora.app.dto.DoctorDTO;
import com.medora.app.dto.SlotDTO;
import com.medora.app.entity.Doctor;
import com.medora.app.entity.Slot;
import com.medora.app.mapper.DoctorMapper;
import com.medora.app.mapper.SlotMapper;
import com.medora.app.repository.SlotRepository;
import com.medora.app.service.DoctorService;
import com.medora.app.service.SlotService;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

@Service
public class SlotServiceImpl implements SlotService {

    private final SlotRepository slotRepository;

    private final SlotMapper slotMapper;

    private final DoctorService doctorService;

    private final DoctorMapper doctorMapper;

    public SlotServiceImpl(SlotRepository slotRepository, SlotMapper slotMapper, DoctorService doctorService, DoctorMapper doctorMapper) {
        this.slotRepository = slotRepository;
        this.slotMapper = slotMapper;
        this.doctorService = doctorService;
        this.doctorMapper = doctorMapper;
    }

    @Override
    public Slot saveSlot(Slot slot){
        return slotRepository.save(slot);
    }

    @Override
    public Slot bookSlot(Long doctorId, LocalDate date, SlotType slotType) {

        Slot slot = slotRepository
                .findByDoctorIdAndDate(doctorId, date)
                .orElseThrow(() -> new RuntimeException("No Slots available on "+date));

        switch (slotType) {

            case MORNING:
                if (slot.getMorning() == SlotStatus.BOOKED)
                    return null;
                slot.setMorning(SlotStatus.BOOKED);
                break;

            case PRE_NOON:
                if (slot.getPreNoon() == SlotStatus.BOOKED)
                    return null;
                slot.setPreNoon(SlotStatus.BOOKED);
                break;

            case AFTER_NOON:
                if (slot.getAfterNoon() == SlotStatus.BOOKED)
                    return null;
                slot.setAfterNoon(SlotStatus.BOOKED);
                break;

            case EVENING:
                if (slot.getEvening() == SlotStatus.BOOKED)
                    return null;
                slot.setEvening(SlotStatus.BOOKED);
                break;

            case NIGHT:
                if (slot.getNight() == SlotStatus.BOOKED)
                    return null;
                slot.setNight(SlotStatus.BOOKED);
                break;
        }

        return saveSlot(slot);
    }

    @Override
    public boolean provideSlots(Long doctorId) {

        Doctor doctor = doctorService.getDoctor(doctorId);

        for (int i = 0; i < 30; i++) {

            LocalDate date = LocalDate.now().plusDays(i);

            boolean exists = slotRepository
                    .findByDoctorIdAndDate(doctorId, date)
                    .isPresent();

            if (!exists) {

                Slot slot = new Slot();

                slot.setDoctor(doctor);
                slot.setDate(date);

                slot.setMorning(SlotStatus.AVAILABLE);
                slot.setPreNoon(SlotStatus.AVAILABLE);
                slot.setAfterNoon(SlotStatus.AVAILABLE);
                slot.setEvening(SlotStatus.AVAILABLE);
                slot.setNight(SlotStatus.AVAILABLE);

                saveSlot(slot);

            }
        }
        return true;
    }

    @Override
    public SlotDTO getAvailableSlotsDTO(Long doctorId, LocalDate date) {
        return slotMapper.mapToDTO(getAvailableSlots(doctorId, date));
    }

    @Override
    public Slot getAvailableSlots(Long doctorId, LocalDate date) {
        return slotRepository.findByDoctorIdAndDate(doctorId, date).orElseThrow(() -> new RuntimeException("No slots Available on "+date));
    }

    @Override
    public LocalTime getSlotEndTime(SlotType slotType) {
        switch (slotType) {
            case MORNING: return LocalTime.of(11, 0);
            case PRE_NOON: return LocalTime.of(13, 0);
            case AFTER_NOON: return LocalTime.of(16, 0);
            case EVENING: return LocalTime.of(18, 0);
            case NIGHT: return LocalTime.of(20, 0);
            default: throw new RuntimeException("Invalid slot");
        }
    }

    @Override
    public void freeSlot(long doctorId, LocalDate date, SlotType type) {

        Slot slot = slotRepository.findByDoctorIdAndDate(doctorId, date).orElse(null);

        if (slot != null) {

            switch (type) {
                case MORNING:
                    slot.setMorning(SlotStatus.AVAILABLE);
                    break;

                case PRE_NOON:
                    slot.setPreNoon(SlotStatus.AVAILABLE);
                    break;

                case AFTER_NOON:
                    slot.setAfterNoon(SlotStatus.AVAILABLE);
                    break;

                case EVENING:
                    slot.setEvening(SlotStatus.AVAILABLE);
                    break;

                case NIGHT:
                    slot.setNight(SlotStatus.AVAILABLE);
                    break;
            }

            saveSlot(slot);
        }
    }

    @Scheduled(cron = "0 0 0 * * ?")
    public void maintainSlotWindow() {

        LocalDate today = LocalDate.now();

        List<DoctorDTO> doctors = doctorService.getAllDoctors();

        for (DoctorDTO doctor : doctors) {

            Long doctorId = doctor.getId();

            // Delete yesterday slots
            LocalDate yesterday = today.minusDays(1);

            slotRepository.deleteByDoctorIdAndDate(doctorId, yesterday);

            //  Add new 30th day slot
            LocalDate newDay = today.plusDays(29); // maintains 30-day window

            boolean exists = slotRepository
                    .findByDoctorIdAndDate(doctorId, newDay)
                    .isPresent();

            if (!exists) {

                Slot newSlot = new Slot();

                newSlot.setDoctor(doctorMapper.mapToEntity(doctor));
                newSlot.setDate(newDay);

                newSlot.setMorning(SlotStatus.AVAILABLE);
                newSlot.setPreNoon(SlotStatus.AVAILABLE);
                newSlot.setAfterNoon(SlotStatus.AVAILABLE);
                newSlot.setEvening(SlotStatus.AVAILABLE);
                newSlot.setNight(SlotStatus.AVAILABLE);

                saveSlot(newSlot);
            }
        }
    }

}
