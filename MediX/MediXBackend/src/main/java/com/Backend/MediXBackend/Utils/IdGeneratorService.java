package com.Backend.MediXBackend.Utils;

import com.Backend.MediXBackend.Repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.Year;
import java.util.Optional;

@Service
public class IdGeneratorService {

    @Autowired
    private DoctorRepository doctorRepo;
    @Autowired
    private PatientRepository patientRepo;

    @Autowired
    private AppointmentRepository appointmentRepo;
    @Autowired
    private ReceptionistRepository receptionistRepo;
    @Autowired
    private PharmacistRepository pharmacistRepository;

    public synchronized Long generateDoctorUserId(int professionCode) {
        int year = Year.now().getValue() % 100;  // e.g., 2025 → 25

        // Get max existing doctor ID
        Long maxId = doctorRepo.findMaxDoctorId().orElse(0L);

        // Extract the serial part from the max ID (last 3 digits)
        int nextSerial = 1;
        if (maxId != 0L) {
            String maxIdStr = String.valueOf(maxId);
            if (maxIdStr.length() >= 7) {
                int serial = Integer.parseInt(maxIdStr.substring(maxIdStr.length() - 3));
                nextSerial = serial + 1;
            }
        }

        // Build ID: yy + professionCode + serial (e.g., 25 + 01 + 001)
        return Long.parseLong(String.format("%02d%02d%03d", year, professionCode, nextSerial));
    }

    public synchronized Long generatePatientId() {
        // Get the current max patient ID
        Long maxId = patientRepo.findMaxPatientId().orElse(0L);
        return maxId + 1;
    }

    // Add this method to IdGeneratorService.java
    public synchronized Long generateAppointmentId() {
        // Get the current max appointment ID
        Long maxId = appointmentRepo.findMaxAppointmentId().orElse(0L);
        return maxId + 1;
    }

    // Add this method to IdGeneratorService.java
    public synchronized Long generateReceptionistId() {
        // Get max existing receptionist ID in the range 2502001-2502999
        Long maxId = receptionistRepo.findMaxReceptionistId().orElse(2502000L);

        // If no receptionist exists yet, start with 2502001
        if (maxId < 2502001) {
            return 2502001L;
        }

        // If we haven't reached the limit (2502999), increment
        if (maxId < 2502999) {
            return maxId + 1;
        }

        // If we've reached the limit, throw an exception
        throw new RuntimeException("Maximum number of receptionists (2502999) reached");
    }
    // Add this method to your existing IdGeneratorService class
    public Long generatePharmacistId() {
        Optional<Long> maxId = pharmacistRepository.findMaxPharmacistId();
        Long nextId = maxId.orElse(2503000L) + 1;

        // Ensure the ID stays within the pharmacist range
        if (nextId < 2503001) {
            nextId = 2503001L;
        } else if (nextId > 2503999) {
            throw new RuntimeException("Maximum pharmacist limit reached");
        }

        return nextId;
    }

}
