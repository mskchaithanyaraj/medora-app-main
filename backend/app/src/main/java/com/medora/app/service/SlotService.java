package com.medora.app.service;

import com.medora.app.constants.SlotType;
import com.medora.app.dto.SlotDTO;
import com.medora.app.entity.Slot;

import java.time.LocalDate;
import java.time.LocalTime;

public interface SlotService {

    // doctor will provide this
    boolean provideSlots(Long doctorId);

    // For patient to book appointment
    SlotDTO getAvailableSlotsDTO(Long doctorId, LocalDate date);

    Slot saveSlot(Slot slot);

    // calls when appointment booking
    Slot bookSlot(Long doctorId, LocalDate date, SlotType slotType);

    Slot getAvailableSlots(Long doctorId, LocalDate date);

    // calls when updating slots
    LocalTime getSlotEndTime(SlotType slotType);

    // calls when appointment cancellation
    void freeSlot(long doctorId, LocalDate date, SlotType type);
}
