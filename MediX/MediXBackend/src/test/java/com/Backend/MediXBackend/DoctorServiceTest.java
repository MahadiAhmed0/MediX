package com.Backend.MediXBackend;

import com.Backend.MediXBackend.Model.*;
import com.Backend.MediXBackend.Repository.*;
import com.Backend.MediXBackend.Service.DoctorService;
import com.Backend.MediXBackend.Utils.IdGeneratorService;
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
class DoctorServiceTest {

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

    private User user;
    private Doctor doctor;
    private Qualification qual;
    private Specialization spec;

    @BeforeEach
    void setUp() {
        user = new User();
        user.setName("Dr. Smith");
        user.setEmail("dr.smith@medix.com");
        user.setPassword("pass123");
        user.setPhoneNumber("+8801711111111");

        doctor = new Doctor();
        doctor.setYearsOfExperience(10);
        doctor.setAvailableDays("Mon,Tue,Wed");
        doctor.setAvailableTimes("09:00-17:00");
        doctor.setLicenseNumber("A-123456");

        qual = new Qualification();
        qual.setId(1);
        qual.setName("MBBS");

        spec = new Specialization();
        spec.setId(1);
        spec.setName("Cardiology");
    }

    @Test
    void createDoctorWithUser_WithQualsAndSpecs() {
        Long generatedId = 2501001L;
        when(idGenService.generateDoctorUserId(1)).thenReturn(generatedId);
        when(userRepo.save(any(User.class))).thenReturn(user);
        when(doctorRepo.save(any(Doctor.class))).thenReturn(doctor);
        when(qualificationRepo.findById(1)).thenReturn(Optional.of(qual));
        when(specializationRepo.findById(1)).thenReturn(Optional.of(spec));

        Doctor result = doctorService.createDoctorWithUser(
            user, doctor, Set.of(1), Set.of(1));

        assertNotNull(result);
        verify(userRepo).save(user);
        verify(doctorRepo).save(doctor);
        verify(doctorQualificationRepo).save(any(DoctorQualification.class));
        verify(doctorSpecializationRepo).save(any(DoctorSpecialization.class));
        assertEquals(generatedId, user.getId());
        assertEquals(generatedId, doctor.getDoctorId());
    }

    @Test
    void createDoctorWithUser_WithNullSets_NoCrash() {
        Long generatedId = 2501001L;
        when(idGenService.generateDoctorUserId(1)).thenReturn(generatedId);
        when(userRepo.save(any(User.class))).thenReturn(user);
        when(doctorRepo.save(any(Doctor.class))).thenReturn(doctor);

        assertDoesNotThrow(() ->
            doctorService.createDoctorWithUser(user, doctor, null, null));

        verify(doctorQualificationRepo, never()).save(any());
        verify(doctorSpecializationRepo, never()).save(any());
    }

    @Test
    void createDoctorWithUser_WithEmptySets_NoCrash() {
        Long generatedId = 2501001L;
        when(idGenService.generateDoctorUserId(1)).thenReturn(generatedId);
        when(userRepo.save(any(User.class))).thenReturn(user);
        when(doctorRepo.save(any(Doctor.class))).thenReturn(doctor);

        assertDoesNotThrow(() ->
            doctorService.createDoctorWithUser(user, doctor, Set.of(), Set.of()));

        verify(doctorQualificationRepo, never()).save(any());
        verify(doctorSpecializationRepo, never()).save(any());
    }

    @Test
    void updateDoctor_WithQualifications_DeleteAllThenRecreate() {
        Doctor existingDoctor = new Doctor();
        existingDoctor.setDoctorId(2501001L);
        existingDoctor.setUser(user);
        existingDoctor.setYearsOfExperience(5);

        Qualification qual2 = new Qualification();
        qual2.setId(2);
        qual2.setName("FCPS");

        when(doctorRepo.findById(2501001L)).thenReturn(Optional.of(existingDoctor));
        when(qualificationRepo.findById(1)).thenReturn(Optional.of(qual));
        when(qualificationRepo.findById(2)).thenReturn(Optional.of(qual2));
        when(doctorRepo.save(any(Doctor.class))).thenReturn(existingDoctor);

        Doctor result = doctorService.updateDoctor(
            2501001L, null, null, Set.of(1, 2), null);

        verify(doctorQualificationRepo).deleteByDoctorDoctorId(2501001L);
        verify(doctorQualificationRepo, times(2)).save(any(DoctorQualification.class));
        verify(doctorRepo).save(existingDoctor);
    }

    @Test
    void updateDoctor_WithEmptyQualificationSet_DeletesAllWithoutRecreating() {
        Doctor existingDoctor = new Doctor();
        existingDoctor.setDoctorId(2501001L);
        existingDoctor.setUser(user);

        when(doctorRepo.findById(2501001L)).thenReturn(Optional.of(existingDoctor));
        when(doctorRepo.save(any(Doctor.class))).thenReturn(existingDoctor);

        Doctor result = doctorService.updateDoctor(
            2501001L, null, null, Set.of(), null);

        verify(doctorQualificationRepo).deleteByDoctorDoctorId(2501001L);
        verify(doctorQualificationRepo, never()).save(any(DoctorQualification.class));
    }

    @Test
    void updateDoctor_PartialUpdate_PreservesExistingData() {
        Doctor existingDoctor = new Doctor();
        existingDoctor.setDoctorId(2501001L);
        existingDoctor.setUser(user);
        existingDoctor.setYearsOfExperience(5);
        existingDoctor.setLicenseNumber("A-OLD123");

        Doctor updates = new Doctor();
        updates.setYearsOfExperience(10);
        // licenseNumber not set — should preserve old value

        when(doctorRepo.findById(2501001L)).thenReturn(Optional.of(existingDoctor));
        when(doctorRepo.save(any(Doctor.class))).thenReturn(existingDoctor);

        Doctor result = doctorService.updateDoctor(
            2501001L, null, updates, null, null);

        assertEquals(10, result.getYearsOfExperience());
        assertEquals("A-OLD123", result.getLicenseNumber());
    }

    @Test
    void updateDoctor_WithUserUpdates_UpdatesUserFields() {
        Doctor existingDoctor = new Doctor();
        existingDoctor.setDoctorId(2501001L);
        existingDoctor.setUser(user);

        User userUpdates = new User();
        userUpdates.setName("Dr. Jones");
        userUpdates.setPhoneNumber("+8801722222222");

        when(doctorRepo.findById(2501001L)).thenReturn(Optional.of(existingDoctor));
        when(doctorRepo.save(any(Doctor.class))).thenReturn(existingDoctor);

        Doctor result = doctorService.updateDoctor(
            2501001L, userUpdates, null, null, null);

        verify(userRepo).save(user);
        assertEquals("Dr. Jones", user.getName());
        assertEquals("+8801722222222", user.getPhoneNumber());
        // Email unchanged
        assertEquals("dr.smith@medix.com", user.getEmail());
    }

    @Test
    void addQualifications_AddsWithoutRemovingExisting() {
        Doctor existingDoctor = new Doctor();
        existingDoctor.setDoctorId(2501001L);
        existingDoctor.setUser(user);

        when(doctorRepo.findById(2501001L)).thenReturn(Optional.of(existingDoctor));
        when(qualificationRepo.findById(1)).thenReturn(Optional.of(qual));

        doctorService.addQualifications(2501001L, Set.of(1));

        // addQualifications should NOT delete existing quals
        verify(doctorQualificationRepo, never()).deleteByDoctorDoctorId(anyLong());
        verify(doctorQualificationRepo, times(1)).save(any(DoctorQualification.class));
    }

    @Test
    void getDoctorByEmail_ReturnsDoctor() {
        when(doctorRepo.findByUserEmail("dr.smith@medix.com")).thenReturn(Optional.of(doctor));

        Optional<Doctor> result = doctorService.getDoctorByEmail("dr.smith@medix.com");

        assertTrue(result.isPresent());
        assertEquals(doctor, result.get());
    }

    @Test
    void updateDoctor_NotFound_ThrowsException() {
        when(doctorRepo.findById(999L)).thenReturn(Optional.empty());

        assertThrows(RuntimeException.class,
            () -> doctorService.updateDoctor(999L, null, null, null, null));
    }
}
