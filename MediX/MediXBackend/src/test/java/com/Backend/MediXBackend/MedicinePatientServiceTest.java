package com.Backend.MediXBackend;

import com.Backend.MediXBackend.Model.Medicine;
import com.Backend.MediXBackend.Model.Patient;
import com.Backend.MediXBackend.Repository.MedicineRepository;
import com.Backend.MediXBackend.Repository.PatientRepository;
import com.Backend.MediXBackend.Service.MedicineService;
import com.Backend.MediXBackend.Service.PatientService;
import com.Backend.MediXBackend.Utils.IdGeneratorService;
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
}
