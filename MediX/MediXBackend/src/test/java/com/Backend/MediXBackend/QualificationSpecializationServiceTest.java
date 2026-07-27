package com.Backend.MediXBackend;

import com.Backend.MediXBackend.Model.Qualification;
import com.Backend.MediXBackend.Model.DoctorQualification;
import com.Backend.MediXBackend.Model.DoctorQualificationId;
import com.Backend.MediXBackend.Model.Specialization;
import com.Backend.MediXBackend.Model.DoctorSpecialization;
import com.Backend.MediXBackend.Model.DoctorSpecializationId;
import com.Backend.MediXBackend.Repository.*;
import com.Backend.MediXBackend.Service.QualificationService;
import com.Backend.MediXBackend.Service.SpecializationService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.*;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class QualificationSpecializationServiceTest {

    // Qualification tests
    @Mock
    private QualificationRepository qualificationRepository;
    @Mock
    private DoctorQualificationRepository doctorQualificationRepository;

    @InjectMocks
    private QualificationService qualificationService;

    // Specialization tests
    @Mock
    private SpecializationRepository specializationRepository;
    @Mock
    private DoctorSpecializationRepository doctorSpecializationRepository;

    @InjectMocks
    private SpecializationService specializationService;

    private Qualification qual;
    private Specialization spec;

    @BeforeEach
    void setUp() {
        qual = new Qualification();
        qual.setId(1);
        qual.setName("MBBS");

        spec = new Specialization();
        spec.setId(1);
        spec.setName("Cardiology");
    }

    // QUALIFICATION TESTS

    @Test
    void createQualification_AutoGeneratesId() {
        when(qualificationRepository.findAll()).thenReturn(new ArrayList<>());
        when(qualificationRepository.save(any(Qualification.class))).thenAnswer(inv -> {
            Qualification q = inv.getArgument(0);
            return q;  // Return what was passed, including the auto-generated ID
        });

        Qualification input = new Qualification();
        input.setName("FCPS");
        Qualification result = qualificationService.createQualification(input);

        assertEquals(1, result.getId());
        assertEquals("FCPS", result.getName());
    }

    @Test
    void createQualification_IncrementsIdFromMax() {
        Qualification existing = new Qualification();
        existing.setId(5);
        existing.setName("MBBS");

        when(qualificationRepository.findAll()).thenReturn(List.of(existing));
        when(qualificationRepository.save(any(Qualification.class))).thenAnswer(inv -> inv.getArgument(0));

        Qualification input = new Qualification();
        input.setName("FCPS");
        Qualification result = qualificationService.createQualification(input);

        assertEquals(6, result.getId());
    }

    @Test
    void deleteQualification_FailsWhenAssignedToDoctor() {
        when(qualificationRepository.existsById(1)).thenReturn(true);

        DoctorQualification dq = new DoctorQualification();
        DoctorQualificationId dqId = new DoctorQualificationId();
        dqId.setQualificationId(1);
        dq.setId(dqId);

        when(doctorQualificationRepository.findAll()).thenReturn(List.of(dq));

        RuntimeException ex = assertThrows(RuntimeException.class,
            () -> qualificationService.deleteQualification(1));

        assertTrue(ex.getMessage().contains("Cannot delete qualification"));
        verify(qualificationRepository, never()).deleteById(anyInt());
    }

    @Test
    void deleteQualification_SucceedsWhenNotAssigned() {
        when(qualificationRepository.existsById(1)).thenReturn(true);
        when(doctorQualificationRepository.findAll()).thenReturn(new ArrayList<>());

        assertDoesNotThrow(() -> qualificationService.deleteQualification(1));
        verify(qualificationRepository).deleteById(1);
    }

    @Test
    void deleteQualification_NotFound_ThrowsException() {
        when(qualificationRepository.existsById(99)).thenReturn(false);

        assertThrows(RuntimeException.class,
            () -> qualificationService.deleteQualification(99));
    }

    @Test
    void existsByName_FindsCaseInsensitiveMatch() {
        when(qualificationRepository.findAll()).thenReturn(List.of(qual));

        assertTrue(qualificationService.existsByName("mbbs"));
        assertTrue(qualificationService.existsByName("MBBS"));
        assertTrue(qualificationService.existsByName("  MBBS  "));
        assertFalse(qualificationService.existsByName("FCPS"));
    }

    @Test
    void updateQualification_UpdatesNameOnly() {
        Qualification existing = new Qualification();
        existing.setId(1);
        existing.setName("OldName");

        Qualification update = new Qualification();
        update.setName("NewName");

        when(qualificationRepository.findById(1)).thenReturn(Optional.of(existing));
        when(qualificationRepository.save(any(Qualification.class))).thenReturn(existing);

        Qualification result = qualificationService.updateQualification(1, update);

        assertEquals("NewName", result.getName());
    }

    @Test
    void updateQualification_NotFound_ThrowsException() {
        when(qualificationRepository.findById(99)).thenReturn(Optional.empty());

        assertThrows(RuntimeException.class,
            () -> qualificationService.updateQualification(99, new Qualification()));
    }

    // SPECIALIZATION TESTS

    @Test
    void deleteSpecialization_FailsWhenAssignedToDoctor() {
        when(specializationRepository.existsById(1)).thenReturn(true);

        DoctorSpecialization ds = new DoctorSpecialization();
        DoctorSpecializationId dsId = new DoctorSpecializationId();
        dsId.setSpecializationId(1);
        ds.setId(dsId);

        when(doctorSpecializationRepository.findAll()).thenReturn(List.of(ds));

        RuntimeException ex = assertThrows(RuntimeException.class,
            () -> specializationService.deleteSpecialization(1));

        assertTrue(ex.getMessage().contains("Cannot delete specialization"));
        verify(specializationRepository, never()).deleteById(anyInt());
    }

    @Test
    void deleteSpecialization_SucceedsWhenNotAssigned() {
        when(specializationRepository.existsById(1)).thenReturn(true);
        when(doctorSpecializationRepository.findAll()).thenReturn(new ArrayList<>());

        assertDoesNotThrow(() -> specializationService.deleteSpecialization(1));
        verify(specializationRepository).deleteById(1);
    }

    @Test
    void existsByName_WorksForSpecialization() {
        when(specializationRepository.findAll()).thenReturn(List.of(spec));

        assertTrue(specializationService.existsByName("cardiology"));
        assertTrue(specializationService.existsByName("CARDIOLOGY"));
        assertFalse(specializationService.existsByName("Neurology"));
    }
}
