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

@WebMvcTest(DoctorController.class)
class DoctorControllerApiTest {

    @Autowired private MockMvc mockMvc;
    @MockitoBean private DoctorService doctorService;

    @Test void getAllDoctors_Returns200() throws Exception {
        when(doctorService.getAllDoctors()).thenReturn(List.of());
        mockMvc.perform(get("/api/doctors")).andExpect(status().isOk());
    }

    @Test void getDoctorById_Found_Returns200() throws Exception {
        Doctor doc = new Doctor(); doc.setDoctorId(2501001L);
        when(doctorService.getDoctorById(2501001L)).thenReturn(Optional.of(doc));
        mockMvc.perform(get("/api/doctors/2501001")).andExpect(status().isOk()).andExpect(jsonPath("$.doctorId").value(2501001));
    }

    @Test void getDoctorByEmail_Found_Returns200() throws Exception {
        Doctor doc = new Doctor(); doc.setDoctorId(2501001L);
        when(doctorService.getDoctorByEmail("dr@medix.com")).thenReturn(Optional.of(doc));
        mockMvc.perform(get("/api/doctors/email/dr@medix.com")).andExpect(status().isOk());
    }

    @Test void createDoctor_Success_Returns200() throws Exception {
        Doctor doc = new Doctor(); doc.setDoctorId(2501001L);
        when(doctorService.createDoctorWithUser(any(), any(), any(), any())).thenReturn(doc);
        String json = "{\"user\":{\"name\":\"Dr. Smith\",\"email\":\"dr@test.com\",\"password\":\"pass\"},\"doctor\":{\"yearsOfExperience\":10,\"licenseNumber\":\"A-123456\"},\"qualificationIds\":[1],\"specializationIds\":[1]}";
        mockMvc.perform(post("/api/doctors").contentType(MediaType.APPLICATION_JSON).content(json)).andExpect(status().isOk());
    }

    @Test void createDoctor_ServiceFails_Returns500() throws Exception {
        when(doctorService.createDoctorWithUser(any(), any(), any(), any())).thenThrow(new RuntimeException("Qualification not found"));
        String json = "{\"user\":{\"name\":\"Dr. Smith\",\"email\":\"dr@test.com\",\"password\":\"pass\"},\"doctor\":{\"yearsOfExperience\":10},\"qualificationIds\":[99],\"specializationIds\":[]}";
        mockMvc.perform(post("/api/doctors").contentType(MediaType.APPLICATION_JSON).content(json)).andExpect(status().isInternalServerError());
    }

    @Test void updateDoctor_Success_Returns200() throws Exception {
        Doctor doc = new Doctor(); doc.setDoctorId(2501001L);
        when(doctorService.updateDoctor(anyLong(), any(), any(), any(), any())).thenReturn(doc);
        mockMvc.perform(put("/api/doctors/2501001").contentType(MediaType.APPLICATION_JSON).content("{\"doctor\":{\"yearsOfExperience\":15}}")).andExpect(status().isOk());
    }

    @Test void updateDoctor_NotFound_Returns404() throws Exception {
        when(doctorService.updateDoctor(anyLong(), any(), any(), any(), any())).thenThrow(new RuntimeException("Doctor not found"));
        mockMvc.perform(put("/api/doctors/999").contentType(MediaType.APPLICATION_JSON).content("{}")).andExpect(status().isNotFound());
    }

    @Test void addQualifications_Success_Returns200() throws Exception {
        Doctor doc = new Doctor(); doc.setDoctorId(2501001L);
        when(doctorService.addQualifications(eq(2501001L), anySet())).thenReturn(doc);
        mockMvc.perform(post("/api/doctors/2501001/qualifications").contentType(MediaType.APPLICATION_JSON).content("[1,2]")).andExpect(status().isOk());
    }

    @Test void addSpecializations_Success_Returns200() throws Exception {
        Doctor doc = new Doctor(); doc.setDoctorId(2501001L);
        when(doctorService.addSpecializations(eq(2501001L), anySet())).thenReturn(doc);
        mockMvc.perform(post("/api/doctors/2501001/specializations").contentType(MediaType.APPLICATION_JSON).content("[1]")).andExpect(status().isOk());
    }

    // BUG B13: GET /api/doctors/{id} and GET /api/doctors/email/{email} 404 branches cast Map to (Doctor)
    // Causes ClassCastException -> 500 instead of 404
}
