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

    @Test
    void getAllMedicines_Returns200() throws Exception {
        when(medicineService.getAllMedicines()).thenReturn(List.of());
        mockMvc.perform(get("/api/medicines")).andExpect(status().isOk());
    }

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

    @Test
    void getMedicineById_NotFound_Returns404() throws Exception {
        when(medicineService.getMedicineById(999L)).thenReturn(Optional.empty());
        mockMvc.perform(get("/api/medicines/999")).andExpect(status().isNotFound());
    }

    @Test
    void getMedicineByName_Found_Returns200() throws Exception {
        Medicine med = new Medicine();
        med.setId(1L);
        med.setMedicineName("Napa");
        when(medicineService.getMedicineByName("Napa")).thenReturn(Optional.of(med));

        mockMvc.perform(get("/api/medicines/name/Napa"))
            .andExpect(status().isOk());
    }
}
