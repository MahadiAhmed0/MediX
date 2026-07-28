package com.Backend.MediXBackend;

import com.Backend.MediXBackend.Model.*;
import com.Backend.MediXBackend.Repository.*;
import com.Backend.MediXBackend.Service.PrescriptionService;
import com.Backend.MediXBackend.Service.PatientService;
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
class PrescriptionEdgeCaseTests {

    @Mock
    private PrescriptionRepository prescriptionRepo;
    @Mock
    private PrescriptionMedicineRepository prescriptionMedicineRepo;
    @Mock
    private PatientService patientService;

    @InjectMocks
    private PrescriptionService prescriptionService;

    @Test
    void createPrescription_WithNullMedicines_DoesNotCrash() {
        Prescription p = new Prescription();
        p.setPatientId(1L);
        p.setDoctorId(2501001L);

        when(prescriptionRepo.save(any(Prescription.class))).thenAnswer(inv -> {
            Prescription saved = inv.getArgument(0);
            saved.setId(1L);
            return saved;
        });
        when(prescriptionRepo.findPrescriptionWithMedicines(anyLong())).thenReturn(p);

        assertDoesNotThrow(() -> prescriptionService.createPrescription(p));
    }

    @Test
    void createPrescription_WithEmptyMedicines_DoesNotCrash() {
        Prescription p = new Prescription();
        p.setPatientId(1L);
        p.setDoctorId(2501001L);
        p.setMedicines(new ArrayList<>());

        when(prescriptionRepo.save(any(Prescription.class))).thenAnswer(inv -> {
            Prescription saved = inv.getArgument(0);
            saved.setId(1L);
            return saved;
        });
        when(prescriptionRepo.findPrescriptionWithMedicines(anyLong())).thenReturn(p);

        assertDoesNotThrow(() -> prescriptionService.createPrescription(p));
    }

    @Test
    void createPrescription_EmptyMedicineName_Skipped() {
        Prescription p = new Prescription();
        p.setPatientId(1L);
        p.setDoctorId(2501001L);

        PrescriptionMedicine bad = new PrescriptionMedicine();
        bad.setMedicineName(null);
        bad.setMorningDose(1);

        PrescriptionMedicine good = new PrescriptionMedicine();
        good.setMedicineName("Napa");
        good.setMorningDose(1);

        p.setMedicines(List.of(bad, good));

        when(prescriptionRepo.save(any(Prescription.class))).thenAnswer(inv -> {
            Prescription saved = inv.getArgument(0);
            saved.setId(1L);
            return saved;
        });
        when(prescriptionMedicineRepo.save(any(PrescriptionMedicine.class))).thenAnswer(inv -> inv.getArgument(0));
        when(prescriptionRepo.findPrescriptionWithMedicines(anyLong())).thenReturn(p);

        prescriptionService.createPrescription(p);
        verify(prescriptionMedicineRepo, times(1)).save(any(PrescriptionMedicine.class));
    }

    @Test
    void updatePrescription_WithNullMedicines_PreservesExistingMedicines() {
        Prescription existing = new Prescription();
        existing.setId(1L);
        existing.setPatientId(1L);
        existing.setDoctorId(2501001L);
        existing.setChiefComplaint("Old");

        Prescription updated = new Prescription();
        updated.setChiefComplaint("New");

        when(prescriptionRepo.findById(1L)).thenReturn(Optional.of(existing));
        when(prescriptionRepo.save(any(Prescription.class))).thenReturn(existing);

        Prescription result = prescriptionService.updatePrescription(1L, updated);

        assertEquals("New", result.getChiefComplaint());
        verify(prescriptionMedicineRepo, never()).deleteByPrescriptionId(anyLong());
    }
}
