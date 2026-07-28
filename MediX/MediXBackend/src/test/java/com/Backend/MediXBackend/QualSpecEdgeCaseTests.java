package com.Backend.MediXBackend;

import com.Backend.MediXBackend.Model.*;
import com.Backend.MediXBackend.Repository.*;
import com.Backend.MediXBackend.Service.*;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.*;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class QualSpecEdgeCaseTests {

    @Mock
    private QualificationRepository qualificationRepository;
    @Mock
    private DoctorQualificationRepository doctorQualificationRepository;

    @InjectMocks
    private QualificationService qualificationService;

    @Mock
    private SpecializationRepository specializationRepository;
    @Mock
    private DoctorSpecializationRepository doctorSpecializationRepository;

    @InjectMocks
    private SpecializationService specializationService;

    @Test
    void createQualification_WhenMultipleItemsExist_IncrementsMaxCorrectly() {
        Qualification q1 = new Qualification(); q1.setId(3);
        Qualification q2 = new Qualification(); q2.setId(7);
        Qualification q3 = new Qualification(); q3.setId(2);

        when(qualificationRepository.findAll()).thenReturn(List.of(q1, q2, q3));
        when(qualificationRepository.save(any(Qualification.class))).thenAnswer(inv -> inv.getArgument(0));

        Qualification input = new Qualification();
        input.setName("New");
        Qualification result = qualificationService.createQualification(input);
        assertEquals(8, result.getId());
    }

    @Test
    void updateQualification_EmptyName_DoesNotUpdate() {
        Qualification existing = new Qualification();
        existing.setId(1);
        existing.setName("MBBS");

        Qualification update = new Qualification();
        update.setName("");

        when(qualificationRepository.findById(1)).thenReturn(Optional.of(existing));
        when(qualificationRepository.save(any())).thenReturn(existing);

        Qualification result = qualificationService.updateQualification(1, update);
        assertEquals("MBBS", result.getName());
    }

    @Test
    void updateQualification_WhitespaceName_DoesNotUpdate() {
        Qualification existing = new Qualification();
        existing.setId(1);
        existing.setName("MBBS");

        Qualification update = new Qualification();
        update.setName("   ");

        when(qualificationRepository.findById(1)).thenReturn(Optional.of(existing));
        when(qualificationRepository.save(any())).thenReturn(existing);

        Qualification result = qualificationService.updateQualification(1, update);
        assertEquals("MBBS", result.getName());
    }

    @Test
    void createSpecialization_IncrementsFromMax() {
        Specialization s1 = new Specialization(); s1.setId(1);
        Specialization s2 = new Specialization(); s2.setId(5);

        when(specializationRepository.findAll()).thenReturn(List.of(s1, s2));
        when(specializationRepository.save(any(Specialization.class))).thenAnswer(inv -> inv.getArgument(0));

        Specialization input = new Specialization();
        input.setName("Radiology");
        Specialization result = specializationService.createSpecialization(input);
        assertEquals(6, result.getId());
    }

    @Test
    void updateSpecialization_EmptyName_DoesNotUpdate() {
        Specialization existing = new Specialization();
        existing.setId(1);
        existing.setName("Cardiology");

        Specialization update = new Specialization();
        update.setName("");

        when(specializationRepository.findById(1)).thenReturn(Optional.of(existing));
        when(specializationRepository.save(any())).thenReturn(existing);

        Specialization result = specializationService.updateSpecialization(1, update);
        assertEquals("Cardiology", result.getName());
    }
}
