package com.Backend.MediXBackend;

import com.Backend.MediXBackend.Model.Medicine;
import com.Backend.MediXBackend.Model.Patient;
import com.Backend.MediXBackend.Repository.MedicineRepository;
import com.Backend.MediXBackend.Repository.PatientRepository;
import com.Backend.MediXBackend.Service.MedicineService;
import com.Backend.MediXBackend.Service.PatientService;
import com.Backend.MediXBackend.Utils.IdGeneratorService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDate;
import java.util.*;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class MedicinePatientServiceTest {

    @Mock
    private MedicineRepository medicineRepository;
    @InjectMocks
    private MedicineService medicineService;

    @Mock
    private PatientRepository patientRepo;
    @Mock
    private IdGeneratorService idGenService;
    @InjectMocks
    private PatientService patientService;

    @Test
    void createMedicine_SetsIdViaAutoIncrement() {
        Medicine med = new Medicine();
        med.setMedicineName("Napa");
        med.setCompany("Square");
        med.setGenericName("Paracetamol");
        med.setQuantity(100);
        med.setUnitCost(5.0);
        med.setUnitPrice(6.0);
        med.setExpiryDate(LocalDate.now().plusYears(1));

        when(medicineRepository.save(med)).thenReturn(med);
        Medicine result = medicineService.createMedicine(med);
        assertEquals("Napa", result.getMedicineName());
    }

    @Test
    void updateMedicine_OverwritesAllFields() {
        Medicine existing = new Medicine();
        existing.setId(1L);
        existing.setMedicineName("Napa");
        existing.setCompany("Square");
        existing.setQuantity(100);

        Medicine updates = new Medicine();
        updates.setMedicineName("Napa Extra");
        updates.setCompany("Beximco");
        updates.setGenericName("Paracetamol Extra");
        updates.setQuantity(50);
        updates.setUnitCost(3.0);
        updates.setUnitPrice(5.0);
        updates.setExpiryDate(LocalDate.now().plusMonths(6));

        when(medicineRepository.findById(1L)).thenReturn(Optional.of(existing));
        when(medicineRepository.save(any(Medicine.class))).thenReturn(existing);

        Medicine result = medicineService.updateMedicine(1L, updates);

        assertEquals("Napa Extra", result.getMedicineName());
        assertEquals("Beximco", result.getCompany());
        assertEquals("Paracetamol Extra", result.getGenericName());
        assertEquals(50, result.getQuantity());
        assertEquals(3.0, result.getUnitCost());
        assertEquals(5.0, result.getUnitPrice());
    }

    @Test
    void updateMedicine_NotFound_ReturnsNull() {
        when(medicineRepository.findById(999L)).thenReturn(Optional.empty());

        Medicine result = medicineService.updateMedicine(999L, new Medicine());

        assertNull(result);
    }
}
