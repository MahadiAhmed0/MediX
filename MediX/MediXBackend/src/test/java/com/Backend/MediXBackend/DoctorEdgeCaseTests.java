package com.Backend.MediXBackend;

import com.Backend.MediXBackend.Model.*;
import com.Backend.MediXBackend.Repository.*;
import com.Backend.MediXBackend.Service.DoctorService;
import com.Backend.MediXBackend.Utils.IdGeneratorService;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.*;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class DoctorEdgeCaseTests {

    @Mock
    private DoctorRepository doctorRepo;
    @Mock
    private UserRepository userRepo;
    @Mock
    private QualificationRepository qualificationRepo;
    @Mock
    private SpecializationRepository specializationRepo;
    @Mock
    private DoctorQualificationRepository doctorQualificationRepo;
    @Mock
    private DoctorSpecializationRepository doctorSpecializationRepo;
    @Mock
    private IdGeneratorService idGenService;

    @InjectMocks
    private DoctorService doctorService;

    @Test
    void addQualifications_InvalidQualificationId_Throws() {
        Doctor doctor = new Doctor();
        doctor.setDoctorId(2501001L);
        when(doctorRepo.findById(2501001L)).thenReturn(Optional.of(doctor));
        when(qualificationRepo.findById(99)).thenReturn(Optional.empty());

        assertThrows(RuntimeException.class,
            () -> doctorService.addQualifications(2501001L, Set.of(99)));
    }
}
