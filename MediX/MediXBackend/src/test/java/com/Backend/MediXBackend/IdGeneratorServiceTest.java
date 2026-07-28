package com.Backend.MediXBackend;

import com.Backend.MediXBackend.Model.Doctor;
import com.Backend.MediXBackend.Model.User;
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
}
