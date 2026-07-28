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

@WebMvcTest(PatientController.class)
class PatientControllerApiTest {

    @Autowired private MockMvc mockMvc;
    @MockitoBean private PatientService patientService;

    @Test void getAllPatients_Returns200() throws Exception {
        when(patientService.getAllPatients()).thenReturn(List.of());
        mockMvc.perform(get("/api/patients")).andExpect(status().isOk());
    }

    @Test void getPatientById_Found_Returns200() throws Exception {
        Patient p = new Patient(); p.setId(1L); p.setName("John");
        when(patientService.getPatientById(1L)).thenReturn(Optional.of(p));
        mockMvc.perform(get("/api/patients/1")).andExpect(status().isOk()).andExpect(jsonPath("$.name").value("John"));
    }

    @Test void createBasicPatient_Success_Returns200() throws Exception {
        Patient p = new Patient(); p.setId(1L); p.setName("John");
        when(patientService.createBasicPatient("John", "+880")).thenReturn(p);
        mockMvc.perform(post("/api/patients/basic").contentType(MediaType.APPLICATION_JSON).content("{\"name\":\"John\",\"phoneNumber\":\"+880\"}"))
            .andExpect(status().isOk()).andExpect(jsonPath("$.name").value("John"));
    }

    @Test void createBasicPatient_MissingName_Returns400() throws Exception {
        mockMvc.perform(post("/api/patients/basic").contentType(MediaType.APPLICATION_JSON).content("{\"phoneNumber\":\"+880\"}"))
            .andExpect(status().isBadRequest());
    }

    @Test void updatePatient_Success_Returns200() throws Exception {
        Patient p = new Patient(); p.setId(1L); p.setAge(30);
        when(patientService.updatePatientDetails(eq(1L), any())).thenReturn(p);
        mockMvc.perform(put("/api/patients/1").contentType(MediaType.APPLICATION_JSON).content("{\"age\":30,\"gender\":\"Male\"}"))
            .andExpect(status().isOk()).andExpect(jsonPath("$.age").value(30));
    }

    @Test void updatePatient_NotFound_Returns404() throws Exception {
        when(patientService.updatePatientDetails(eq(999L), any())).thenThrow(new RuntimeException("Patient not found"));
        mockMvc.perform(put("/api/patients/999").contentType(MediaType.APPLICATION_JSON).content("{}"))
            .andExpect(status().isNotFound());
    }

    @Test void getPatientByPhone_Found_Returns200() throws Exception {
        Patient p = new Patient(); p.setId(1L); p.setPhoneNumber("+8801711111111");
        when(patientService.getPatientByPhoneNumber("+8801711111111")).thenReturn(Optional.of(p));
        mockMvc.perform(get("/api/patients/by-phone?phoneNumber=+8801711111111")).andExpect(status().isOk());
    }

    @Test void getPatientByPhone_NotFound_Returns404() throws Exception {
        when(patientService.getPatientByPhoneNumber("+8809999999999")).thenReturn(Optional.empty());
        mockMvc.perform(get("/api/patients/by-phone?phoneNumber=+8809999999999")).andExpect(status().isNotFound());
    }

    @Test void findPatientByPhone_Success_Returns200() throws Exception {
        Patient p = new Patient(); p.setId(1L);
        when(patientService.getPatientByPhoneNumber("+8801711111111")).thenReturn(Optional.of(p));
        mockMvc.perform(post("/api/patients/find-by-phone").contentType(MediaType.APPLICATION_JSON).content("{\"phoneNumber\":\"+8801711111111\"}"))
            .andExpect(status().isOk()).andExpect(jsonPath("$.success").value(true));
    }

    // BUG B14: GET /api/patients/{id} 404 branch casts Map to (Patient) — ClassCastException
    // BUG B15: POST /api/patients/find-by-phone returns 400 with Map.of("data", null) — NPE from Map.of
}
