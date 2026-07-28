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

@WebMvcTest(PrescriptionController.class)
class PrescriptionControllerApiTest {

    @Autowired
    private MockMvc mockMvc;
    @Autowired
    private ObjectMapper mapper;
    @MockitoBean
    private PrescriptionService prescriptionService;

    @Test
    void createPrescription_MissingPatientId_Returns400() throws Exception {
        String json = mapper.writeValueAsString(Map.of("doctorId", 2501001L));
        mockMvc.perform(post("/api/prescriptions")
                .contentType(MediaType.APPLICATION_JSON).content(json))
            .andExpect(status().isBadRequest())
            .andExpect(jsonPath("$.error").value("Patient ID and Doctor ID are required"));
    }

    @Test
    void createPrescription_MissingDoctorId_Returns400() throws Exception {
        String json = mapper.writeValueAsString(Map.of("patientId", 1L));
        mockMvc.perform(post("/api/prescriptions")
                .contentType(MediaType.APPLICATION_JSON).content(json))
            .andExpect(status().isBadRequest())
            .andExpect(jsonPath("$.error").value("Patient ID and Doctor ID are required"));
    }

    @Test
    void createPrescription_Success_Returns200() throws Exception {
        Prescription saved = new Prescription();
        saved.setId(1L);
        saved.setPatientId(1L);
        saved.setDoctorId(2501001L);
        when(prescriptionService.createPrescription(any())).thenReturn(saved);

        String json = mapper.writeValueAsString(Map.of(
            "patientId", 1L, "doctorId", 2501001L,
            "prescriptionDate", "2026-07-28",
            "chiefComplaint", "Headache"
        ));
        mockMvc.perform(post("/api/prescriptions")
                .contentType(MediaType.APPLICATION_JSON).content(json))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.success").value(true))
            .andExpect(jsonPath("$.message").value("Prescription created successfully"));
    }
}
