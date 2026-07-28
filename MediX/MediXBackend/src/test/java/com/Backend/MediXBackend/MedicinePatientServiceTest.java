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

    @Test
    void deleteMedicine_Existing_ReturnsTrue() {
        when(medicineRepository.existsById(1L)).thenReturn(true);
        assertTrue(medicineService.deleteMedicine(1L));
        verify(medicineRepository).deleteById(1L);
    }

    @Test
    void deleteMedicine_NotFound_ReturnsFalse() {
        when(medicineRepository.existsById(999L)).thenReturn(false);
        assertFalse(medicineService.deleteMedicine(999L));
        verify(medicineRepository, never()).deleteById(anyLong());
    }

    @Test
    void getExpiredMedicines_FindsPastExpiry() {
        Medicine expired = new Medicine();
        expired.setId(1L);
        expired.setExpiryDate(LocalDate.now().minusDays(1));

        when(medicineRepository.findByExpiryDateBefore(any(LocalDate.class)))
            .thenReturn(List.of(expired));

        List<Medicine> result = medicineService.getExpiredMedicines();

        assertEquals(1, result.size());
        assertTrue(result.get(0).getExpiryDate().isBefore(LocalDate.now()));
    }

    @Test
    void getExpiredMedicines_ExcludesToday() {
        when(medicineRepository.findByExpiryDateBefore(LocalDate.now()))
            .thenReturn(new ArrayList<>());

        List<Medicine> result = medicineService.getExpiredMedicines();
        assertTrue(result.isEmpty());
    }

    @Test
    void createBasicPatient_GeneratesIdAndSetsNamePhoneOnly() {
        when(idGenService.generatePatientId()).thenReturn(100L);
        when(patientRepo.save(any(Patient.class))).thenAnswer(inv -> inv.getArgument(0));

        Patient result = patientService.createBasicPatient("John", "+8801711111111");

        assertEquals(100L, result.getId());
        assertEquals("John", result.getName());
        assertEquals("+8801711111111", result.getPhoneNumber());
        assertNull(result.getAge());
        assertNull(result.getGender());
        assertNull(result.getWeight());
        assertNull(result.getBloodPressure());
    }

    @Test
    void updatePatientDetails_PartialUpdate_OnlyUpdatesNonNull() {
        Patient existing = new Patient();
        existing.setId(1L);
        existing.setName("John");
        existing.setAge(30);
        existing.setGender("Male");
        existing.setWeight(70.0);
        existing.setBloodPressure("120/80");

        Patient updates = new Patient();
        updates.setAge(35);
        updates.setWeight(75.0);

        when(patientRepo.findById(1L)).thenReturn(Optional.of(existing));
        when(patientRepo.save(any(Patient.class))).thenReturn(existing);

        Patient result = patientService.updatePatientDetails(1L, updates);

        assertEquals(35, result.getAge());
        assertEquals(75.0, result.getWeight());
        assertEquals("Male", result.getGender());
        assertEquals("120/80", result.getBloodPressure());
        assertEquals("John", result.getName());
    }

    @Test
    void updatePatientDetails_NotFound_ThrowsException() {
        when(patientRepo.findById(999L)).thenReturn(Optional.empty());

        assertThrows(RuntimeException.class,
            () -> patientService.updatePatientDetails(999L, new Patient()));
    }

    @Test
    void updatePatientDetails_AllNullUpdates_PreservesAllData() {
        Patient existing = new Patient();
        existing.setId(1L);
        existing.setName("John");
        existing.setAge(25);
        existing.setBloodPressure("110/70");

        Patient updates = new Patient();

        when(patientRepo.findById(1L)).thenReturn(Optional.of(existing));
        when(patientRepo.save(any(Patient.class))).thenReturn(existing);

        Patient result = patientService.updatePatientDetails(1L, updates);

        assertEquals(25, result.getAge());
        assertEquals("110/70", result.getBloodPressure());
    }
}
