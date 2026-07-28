package com.Backend.MediXBackend;

import com.Backend.MediXBackend.Controller.*;
import com.Backend.MediXBackend.Model.*;
import com.Backend.MediXBackend.Service.*;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import java.time.LocalDate;
import java.util.*;

import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(MedicineController.class)
class MedicineControllerApiTest {

    @Autowired
    private MockMvc mockMvc;
    @Autowired
    private ObjectMapper mapper;
    @MockitoBean
    private MedicineService medicineService;

    // Verify GET /api/medicines returns 200 OK when service returns an empty list
    @Test
    void getAllMedicines_Returns200() throws Exception {
        when(medicineService.getAllMedicines()).thenReturn(List.of());
        mockMvc.perform(get("/api/medicines")).andExpect(status().isOk());
    }

    // Verify GET /api/medicines/{id} returns 200 with medicine data when ID exists
    @Test
    void getMedicineById_Found_Returns200() throws Exception {
        Medicine med = new Medicine();
        med.setId(1L);
        med.setMedicineName("Napa");
        when(medicineService.getMedicineById(1L)).thenReturn(Optional.of(med));

        mockMvc.perform(get("/api/medicines/1"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.medicineName").value("Napa"));
    }

    // Verify GET /api/medicines/{id} returns 404 when medicine does not exist
    @Test
    void getMedicineById_NotFound_Returns404() throws Exception {
        when(medicineService.getMedicineById(999L)).thenReturn(Optional.empty());
        mockMvc.perform(get("/api/medicines/999")).andExpect(status().isNotFound());
    }

    // Verify GET /api/medicines/name/{name} returns 200 when medicine name is found
    @Test
    void getMedicineByName_Found_Returns200() throws Exception {
        Medicine med = new Medicine();
        med.setId(1L);
        med.setMedicineName("Napa");
        when(medicineService.getMedicineByName("Napa")).thenReturn(Optional.of(med));

        mockMvc.perform(get("/api/medicines/name/Napa"))
            .andExpect(status().isOk());
    }

    // Verify GET /api/medicines/name/{name} returns 404 when medicine name is not found
    @Test
    void getMedicineByName_NotFound_Returns404() throws Exception {
        when(medicineService.getMedicineByName("Unknown")).thenReturn(Optional.empty());
        mockMvc.perform(get("/api/medicines/name/Unknown")).andExpect(status().isNotFound());
    }

    // Verify POST /api/medicines returns 200 with created medicine details
    @Test
    void createMedicine_Success_Returns200() throws Exception {
        Medicine med = new Medicine("Square", "Napa", "Paracetamol", 100, 5.0, 6.0, LocalDate.now().plusYears(1));
        when(medicineService.createMedicine(any(Medicine.class))).thenReturn(med);

        String json = """
            {"company":"Square","medicineName":"Napa","genericName":"Paracetamol",
             "quantity":100,"unitCost":5.0,"unitPrice":6.0,"expiryDate":"2027-07-28"}""";
        mockMvc.perform(post("/api/medicines")
                .contentType(MediaType.APPLICATION_JSON).content(json))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.medicineName").value("Napa"));
    }

    // Verify PUT /api/medicines/{id} returns 200 with updated medicine details
    @Test
    void updateMedicine_Success_Returns200() throws Exception {
        Medicine updated = new Medicine();
        updated.setId(1L);
        updated.setMedicineName("Napa Extra");
        when(medicineService.updateMedicine(eq(1L), any(Medicine.class))).thenReturn(updated);

        String json = """
            {"company":"Beximco","medicineName":"Napa Extra","genericName":"Para",
             "quantity":50,"unitCost":3.0,"unitPrice":5.0,"expiryDate":"2027-01-01"}""";
        mockMvc.perform(put("/api/medicines/1")
                .contentType(MediaType.APPLICATION_JSON).content(json))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.medicineName").value("Napa Extra"));
    }

    // Verify PUT /api/medicines/{id} returns 404 when updating a non-existent medicine
    @Test
    void updateMedicine_NotFound_Returns404() throws Exception {
        when(medicineService.updateMedicine(eq(999L), any(Medicine.class))).thenReturn(null);

        String json = """
            {"company":"Beximco","medicineName":"Napa","genericName":"Para",
             "quantity":50,"unitCost":3.0,"unitPrice":5.0,"expiryDate":"2027-01-01"}""";
        mockMvc.perform(put("/api/medicines/999")
                .contentType(MediaType.APPLICATION_JSON).content(json))
            .andExpect(status().isNotFound());
    }

    // Verify DELETE /api/medicines/{id} returns 200 when medicine is successfully deleted
    @Test
    void deleteMedicine_Success_Returns200() throws Exception {
        when(medicineService.deleteMedicine(1L)).thenReturn(true);
        mockMvc.perform(delete("/api/medicines/1")).andExpect(status().isOk());
    }

    // Verify DELETE /api/medicines/{id} returns 404 when medicine does not exist
    @Test
    void deleteMedicine_NotFound_Returns404() throws Exception {
        when(medicineService.deleteMedicine(999L)).thenReturn(false);
        mockMvc.perform(delete("/api/medicines/999")).andExpect(status().isNotFound());
    }

    // Verify GET /api/medicines/company/{company} returns 200 with medicines filtered by company
    @Test
    void getMedicinesByCompany_Returns200() throws Exception {
        when(medicineService.getMedicinesByCompany("Square")).thenReturn(List.of());
        mockMvc.perform(get("/api/medicines/company/Square")).andExpect(status().isOk());
    }

    // Verify GET /api/medicines/generic/{genericName} returns 200 with medicines filtered by generic name
    @Test
    void getMedicinesByGenericName_Returns200() throws Exception {
        when(medicineService.getMedicinesByGenericName("Paracetamol")).thenReturn(List.of());
        mockMvc.perform(get("/api/medicines/generic/Paracetamol")).andExpect(status().isOk());
    }

    // Verify GET /api/medicines/expired returns 200 with the list of expired medicines
    @Test
    void getExpiredMedicines_Returns200() throws Exception {
        when(medicineService.getExpiredMedicines()).thenReturn(List.of());
        mockMvc.perform(get("/api/medicines/expired")).andExpect(status().isOk());
    }
}
