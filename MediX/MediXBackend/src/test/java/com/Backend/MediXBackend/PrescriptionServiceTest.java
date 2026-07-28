package com.Backend.MediXBackend;

import com.Backend.MediXBackend.Model.Prescription;
import com.Backend.MediXBackend.Model.PrescriptionMedicine;
import com.Backend.MediXBackend.Model.Patient;
import com.Backend.MediXBackend.Model.PrescriptionWithPatientDetails;
import com.Backend.MediXBackend.Repository.PrescriptionRepository;
import com.Backend.MediXBackend.Repository.PrescriptionMedicineRepository;
import com.Backend.MediXBackend.Service.PrescriptionService;
import com.Backend.MediXBackend.Service.PatientService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.mockito.ArgumentCaptor;

import java.time.LocalDate;
import java.util.*;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class PrescriptionServiceTest {

    @Mock
    private PrescriptionRepository prescriptionRepo;
    @Mock
    private PrescriptionMedicineRepository prescriptionMedicineRepo;
    @Mock
    private PatientService patientService;

    @InjectMocks
    private PrescriptionService prescriptionService;

    private Prescription testPrescription;
    private Prescription savedPrescription;

    @BeforeEach
    void setUp() {
        testPrescription = new Prescription();
        testPrescription.setPatientId(1L);
        testPrescription.setDoctorId(2501001L);
        testPrescription.setPrescriptionDate(LocalDate.now());
        testPrescription.setChiefComplaint("Headache");
        testPrescription.setOnExamination("Normal");
        testPrescription.setInvestigations("Blood test");
        testPrescription.setAdvice("Rest");

        PrescriptionMedicine med = new PrescriptionMedicine();
        med.setMedicineName("Napa");
        med.setMorningDose(1);
        med.setAfternoonDose(0);
        med.setEveningDose(1);
        med.setNumberOfDays(5);
        med.setComment("After meal");
        med.setPrescription(testPrescription);
        testPrescription.setMedicines(List.of(med));

        savedPrescription = new Prescription();
        savedPrescription.setId(1L);
        savedPrescription.setPatientId(1L);
        savedPrescription.setDoctorId(2501001L);
        savedPrescription.setPrescriptionDate(LocalDate.now());
        savedPrescription.setChiefComplaint("Headache");
        savedPrescription.setOnExamination("Normal");
        savedPrescription.setInvestigations("Blood test");
        savedPrescription.setAdvice("Rest");
        savedPrescription.setMedicines(new ArrayList<>());
    }

    @Test
    void createPrescription_SavesPrescriptionWithMedicines() {
        when(prescriptionRepo.save(any(Prescription.class))).thenReturn(savedPrescription);
        when(prescriptionMedicineRepo.save(any(PrescriptionMedicine.class))).thenAnswer(inv -> inv.getArgument(0));
        when(prescriptionRepo.findPrescriptionWithMedicines(anyLong())).thenReturn(testPrescription);

        Prescription result = prescriptionService.createPrescription(testPrescription);

        assertNotNull(result);
        assertEquals("Headache", result.getChiefComplaint());
        verify(prescriptionRepo, times(1)).save(any(Prescription.class));
        verify(prescriptionMedicineRepo, atLeastOnce()).save(any(PrescriptionMedicine.class));
    }

    @Test
    void createPrescription_SetsDefaultDateWhenNull() {
        testPrescription.setPrescriptionDate(null);
        // Reset medicines to empty to avoid NPE from medicine save mock
        testPrescription.setMedicines(new ArrayList<>());
        when(prescriptionRepo.save(any(Prescription.class))).thenReturn(savedPrescription);
        when(prescriptionRepo.findPrescriptionWithMedicines(anyLong())).thenReturn(testPrescription);

        prescriptionService.createPrescription(testPrescription);

        ArgumentCaptor<Prescription> captor = ArgumentCaptor.forClass(Prescription.class);
        verify(prescriptionRepo).save(captor.capture());
        assertNotNull(captor.getValue().getPrescriptionDate());
        assertEquals(LocalDate.now(), captor.getValue().getPrescriptionDate());
    }

    @Test
    void createPrescription_SkipsMedicinesWithEmptyName() {
        PrescriptionMedicine emptyMed = new PrescriptionMedicine();
        emptyMed.setMedicineName("   ");
        emptyMed.setMorningDose(1);
        PrescriptionMedicine validMed = new PrescriptionMedicine();
        validMed.setMedicineName("Napa");
        validMed.setMorningDose(1);
        testPrescription.setMedicines(List.of(emptyMed, validMed));

        when(prescriptionRepo.save(any(Prescription.class))).thenReturn(savedPrescription);
        when(prescriptionMedicineRepo.save(any(PrescriptionMedicine.class))).thenAnswer(inv -> inv.getArgument(0));
        when(prescriptionRepo.findPrescriptionWithMedicines(anyLong())).thenReturn(testPrescription);

        prescriptionService.createPrescription(testPrescription);

        verify(prescriptionMedicineRepo, times(1)).save(any(PrescriptionMedicine.class));
    }

    @Test
    void linkPrescriptionToAppointment_SetsAppointmentId() {
        Prescription existing = new Prescription();
        existing.setId(1L);
        existing.setPatientId(1L);
        existing.setDoctorId(2501001L);

        when(prescriptionRepo.findById(1L)).thenReturn(Optional.of(existing));
        when(prescriptionRepo.save(any(Prescription.class))).thenReturn(existing);

        Prescription result = prescriptionService.linkPrescriptionToAppointment(1L, 100L);

        assertEquals(100L, result.getAppointmentId());
        verify(prescriptionRepo).save(existing);
    }

    @Test
    void linkPrescriptionToAppointment_NotFound_ThrowsException() {
        when(prescriptionRepo.findById(999L)).thenReturn(Optional.empty());

        assertThrows(RuntimeException.class,
            () -> prescriptionService.linkPrescriptionToAppointment(999L, 100L));
    }

    @Test
    void unlinkPrescriptionFromAppointment_ClearsAppointmentId() {
        Prescription existing = new Prescription();
        existing.setId(1L);
        existing.setAppointmentId(100L);

        when(prescriptionRepo.findById(1L)).thenReturn(Optional.of(existing));
        when(prescriptionRepo.save(any(Prescription.class))).thenReturn(existing);

        Prescription result = prescriptionService.unlinkPrescriptionFromAppointment(1L);

        assertNull(result.getAppointmentId());
    }

    @Test
    void getPrescriptionsByDoctorIdWithPatientDetails_EnrichesWithPatientData() {
        Prescription prescription = new Prescription();
        prescription.setId(1L);
        prescription.setPatientId(5L);
        prescription.setDoctorId(2501001L);
        prescription.setPrescriptionDate(LocalDate.now());
        prescription.setChiefComplaint("Fever");

        Patient patient = new Patient();
        patient.setId(5L);
        patient.setName("John Doe");
        patient.setPhoneNumber("+8801711111111");

        when(prescriptionRepo.findByDoctorIdOrderByPrescriptionDateDesc(2501001L))
            .thenReturn(List.of(prescription));
        when(patientService.getPatientById(5L))
            .thenReturn(Optional.of(patient));

        List<PrescriptionWithPatientDetails> result =
            prescriptionService.getPrescriptionsByDoctorIdWithPatientDetails(2501001L);

        assertEquals(1, result.size());
        assertEquals("John Doe", result.get(0).getPatientName());
        assertEquals("+8801711111111", result.get(0).getPatientPhoneNumber());
    }

    @Test
    void getPrescriptionsByDoctorIdWithPatientDetails_SkipsWhenPatientNotFound() {
        Prescription prescription = new Prescription();
        prescription.setPatientId(999L);
        prescription.setDoctorId(2501001L);

        when(prescriptionRepo.findByDoctorIdOrderByPrescriptionDateDesc(2501001L))
            .thenReturn(List.of(prescription));
        when(patientService.getPatientById(999L)).thenReturn(Optional.empty());

        List<PrescriptionWithPatientDetails> result =
            prescriptionService.getPrescriptionsByDoctorIdWithPatientDetails(2501001L);

        assertTrue(result.isEmpty());
    }

    @Test
    void updatePrescription_UpdatesFieldsAndMedicines() {
        Prescription existing = new Prescription();
        existing.setId(1L);
        existing.setPatientId(1L);
        existing.setDoctorId(2501001L);
        existing.setChiefComplaint("Old complaint");
        existing.setMedicines(new ArrayList<>());

        Prescription updated = new Prescription();
        updated.setChiefComplaint("New complaint");
        updated.setOnExamination("Updated exam");

        PrescriptionMedicine newMed = new PrescriptionMedicine();
        newMed.setMedicineName("Seclo");
        newMed.setMorningDose(1);
        updated.setMedicines(List.of(newMed));

        when(prescriptionRepo.findById(1L)).thenReturn(Optional.of(existing));
        when(prescriptionRepo.save(any(Prescription.class))).thenReturn(existing);

        Prescription result = prescriptionService.updatePrescription(1L, updated);

        assertEquals("New complaint", result.getChiefComplaint());
        assertEquals("Updated exam", result.getOnExamination());
        verify(prescriptionMedicineRepo).deleteByPrescriptionId(1L);
        verify(prescriptionMedicineRepo, atLeastOnce()).save(any(PrescriptionMedicine.class));
    }

    @Test
    void updatePrescription_DefaultsNumberOfDaysTo1() {
        Prescription existing = new Prescription();
        existing.setId(1L);
        existing.setMedicines(new ArrayList<>());

        PrescriptionMedicine med = new PrescriptionMedicine();
        med.setMedicineName("Ace");
        med.setNumberOfDays(null);

        Prescription updated = new Prescription();
        updated.setMedicines(List.of(med));

        when(prescriptionRepo.findById(1L)).thenReturn(Optional.of(existing));
        when(prescriptionRepo.save(any(Prescription.class))).thenReturn(existing);

        prescriptionService.updatePrescription(1L, updated);

        ArgumentCaptor<PrescriptionMedicine> captor = ArgumentCaptor.forClass(PrescriptionMedicine.class);
        verify(prescriptionMedicineRepo, atLeastOnce()).save(captor.capture());
        assertEquals(1, captor.getValue().getNumberOfDays());
    }

    @Test
    void deletePrescription_DeletesExisting() {
        when(prescriptionRepo.existsById(1L)).thenReturn(true);

        assertDoesNotThrow(() -> prescriptionService.deletePrescription(1L));
        verify(prescriptionRepo).deleteById(1L);
    }

    @Test
    void deletePrescription_NotFound_ThrowsException() {
        when(prescriptionRepo.existsById(999L)).thenReturn(false);

        assertThrows(RuntimeException.class,
            () -> prescriptionService.deletePrescription(999L));
    }
}
