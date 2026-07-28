package com.Backend.MediXBackend;

import com.Backend.MediXBackend.Model.Doctor;
import com.Backend.MediXBackend.Repository.*;
import com.Backend.MediXBackend.Utils.IdGeneratorService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class IdGeneratorServiceTest {

    @Mock
    private DoctorRepository doctorRepo;
    @Mock
    private PatientRepository patientRepo;
    @Mock
    private AppointmentRepository appointmentRepo;
    @Mock
    private ReceptionistRepository receptionistRepo;
    @Mock
    private PharmacistRepository pharmacistRepository;

    @InjectMocks
    private IdGeneratorService idGenService;

    @BeforeEach
    void setUp() {
    }

    // Verify first doctor gets a 7-digit ID with correct year prefix and serial 001
    @Test
    void generateDoctorUserId_FirstDoctor_GetsCorrectFormat() {
        when(doctorRepo.findMaxDoctorId()).thenReturn(Optional.empty());

        Long id = idGenService.generateDoctorUserId(1);

        String idStr = String.valueOf(id);
        assertEquals(7, idStr.length());

        int year = java.time.Year.now().getValue() % 100;
        String expectedPrefix = String.format("%02d01", year);
        assertEquals(expectedPrefix, idStr.substring(0, 4));
        assertEquals("001", idStr.substring(4));
    }

    // Verify doctor ID serial increments from the existing max within the current year
    @Test
    void generateDoctorUserId_IncrementsSerial() {
        int year = java.time.Year.now().getValue() % 100;
        long existingId = Long.parseLong(String.format("%02d01005", year));
        when(doctorRepo.findMaxDoctorId()).thenReturn(Optional.of(existingId));

        Long id = idGenService.generateDoctorUserId(1);

        long expected = Long.parseLong(String.format("%02d01006", year));
        assertEquals(expected, id);
    }

    // Verify doctor ID generation works with different profession codes
    @Test
    void generateDoctorUserId_HandlesDifferentProfessionCode() {
        when(doctorRepo.findMaxDoctorId()).thenReturn(Optional.empty());

        Long id = idGenService.generateDoctorUserId(2);

        String idStr = String.valueOf(id);
        assertEquals(7, idStr.length());
        assertTrue(idStr.contains("02"));
    }

    // Verify first patient in the system gets ID 1
    @Test
    void generatePatientId_FirstPatient_Returns1() {
        when(patientRepo.findMaxPatientId()).thenReturn(Optional.empty());

        assertEquals(1L, idGenService.generatePatientId());
    }

    // Verify patient ID increments from the existing maximum
    @Test
    void generatePatientId_IncrementsFromMax() {
        when(patientRepo.findMaxPatientId()).thenReturn(Optional.of(10L));

        assertEquals(11L, idGenService.generatePatientId());
    }

    // Verify first receptionist gets the base ID 2502001
    @Test
    void generateReceptionistId_FirstReceptionist_Returns2502001() {
        when(receptionistRepo.findMaxReceptionistId()).thenReturn(Optional.empty());

        assertEquals(2502001L, idGenService.generateReceptionistId());
    }

    // Verify receptionist ID clamps to minimum 2502001 when max is below range
    @Test
    void generateReceptionistId_MaxBelow2502001_Returns2502001() {
        when(receptionistRepo.findMaxReceptionistId()).thenReturn(Optional.of(1000L));

        assertEquals(2502001L, idGenService.generateReceptionistId());
    }

    // Verify receptionist ID increments correctly within the 2502001-2502999 range
    @Test
    void generateReceptionistId_IncrementsWithinRange() {
        when(receptionistRepo.findMaxReceptionistId()).thenReturn(Optional.of(2502005L));

        assertEquals(2502006L, idGenService.generateReceptionistId());
    }

    // Verify exception is thrown when receptionist ID pool is exhausted at 2502999
    @Test
    void generateReceptionistId_AtMaxBoundary_ThrowsException() {
        when(receptionistRepo.findMaxReceptionistId()).thenReturn(Optional.of(2502999L));

        assertThrows(RuntimeException.class,
            () -> idGenService.generateReceptionistId(),
            "Maximum number of receptionists (2502999) reached");
    }

    // Verify first pharmacist gets the base ID 2503001
    @Test
    void generatePharmacistId_FirstPharmacist_Returns2503001() {
        when(pharmacistRepository.findMaxPharmacistId()).thenReturn(Optional.empty());

        assertEquals(2503001L, idGenService.generatePharmacistId());
    }

    // Verify pharmacist ID increments correctly within the 2503001-2503999 range
    @Test
    void generatePharmacistId_IncrementsWithinRange() {
        when(pharmacistRepository.findMaxPharmacistId()).thenReturn(Optional.of(2503010L));

        assertEquals(2503011L, idGenService.generatePharmacistId());
    }

    // Verify exception is thrown when pharmacist ID pool is exhausted at 2503999
    @Test
    void generatePharmacistId_AtMaxBoundary_ThrowsException() {
        when(pharmacistRepository.findMaxPharmacistId()).thenReturn(Optional.of(2503999L));

        assertThrows(RuntimeException.class,
            () -> idGenService.generatePharmacistId(),
            "Maximum pharmacist limit reached");
    }

    // Verify doctor ID generation correctly handles a malformed existing max with fewer than 7 digits
    @Test
    void generateDoctorUserId_HandlesMaxIdWithLessThan7Digits() {
        when(doctorRepo.findMaxDoctorId()).thenReturn(Optional.of(123L));

        Long id = idGenService.generateDoctorUserId(1);

        int year = java.time.Year.now().getValue() % 100;
        String expected = String.format("%02d01001", year);
        assertEquals(Long.parseLong(expected), id);
    }
}
