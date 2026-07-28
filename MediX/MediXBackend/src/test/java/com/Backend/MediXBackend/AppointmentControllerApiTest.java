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

@WebMvcTest(AppointmentController.class)
class AppointmentControllerApiTest {

    @Autowired
    private MockMvc mockMvc;
    @Autowired
    private ObjectMapper mapper;
    @MockitoBean
    private AppointmentService appointmentService;

    @Test
    void createAppointment_Success_Returns200() throws Exception {
        Appointment apt = new Appointment();
        apt.setId(1L); apt.setPatientId(1L); apt.setDoctorId(2501001L); apt.setStatus("NOT_READY");
        when(appointmentService.createAppointment(anyLong(), anyLong(), any())).thenReturn(apt);
        String json = mapper.writeValueAsString(Map.of("patientId", 1, "doctorId", 2501001, "appointmentDate", "2026-07-28"));
        mockMvc.perform(post("/api/appointments").contentType(MediaType.APPLICATION_JSON).content(json))
            .andExpect(status().isOk()).andExpect(jsonPath("$.status").value("NOT_READY"));
    }

    @Test
    void createAppointment_ServiceFails_Returns500() throws Exception {
        when(appointmentService.createAppointment(anyLong(), anyLong(), any()))
            .thenThrow(new RuntimeException("Patient not found"));
        String json = mapper.writeValueAsString(Map.of("patientId", 1, "doctorId", 2501001, "appointmentDate", "2026-07-28"));
        mockMvc.perform(post("/api/appointments").contentType(MediaType.APPLICATION_JSON).content(json))
            .andExpect(status().isInternalServerError());
    }

    @Test
    void updateAppointmentStatus_Success_Returns200() throws Exception {
        Appointment apt = new Appointment(); apt.setId(1L); apt.setStatus("READY");
        when(appointmentService.updateAppointmentStatus(1L, "READY")).thenReturn(apt);
        mockMvc.perform(put("/api/appointments/1/status").contentType(MediaType.APPLICATION_JSON).content("{\"status\":\"READY\"}"))
            .andExpect(status().isOk()).andExpect(jsonPath("$.status").value("READY"));
    }

    @Test
    void updateAppointmentStatus_NotFound_Returns404() throws Exception {
        when(appointmentService.updateAppointmentStatus(999L, "READY"))
            .thenThrow(new RuntimeException("Appointment not found with id: 999"));
        mockMvc.perform(put("/api/appointments/999/status").contentType(MediaType.APPLICATION_JSON).content("{\"status\":\"READY\"}"))
            .andExpect(status().isNotFound());
    }

    @Test
    void getAllAppointments_Returns200() throws Exception {
        when(appointmentService.getAllAppointments()).thenReturn(List.of());
        mockMvc.perform(get("/api/appointments")).andExpect(status().isOk());
    }

    @Test
    void getAppointmentById_Found_Returns200() throws Exception {
        Appointment apt = new Appointment(); apt.setId(1L);
        when(appointmentService.getAppointmentById(1L)).thenReturn(Optional.of(apt));
        mockMvc.perform(get("/api/appointments/1")).andExpect(status().isOk());
    }

    @Test
    void getAppointmentsWithDetails_Returns200() throws Exception {
        when(appointmentService.getAppointmentsWithDetails()).thenReturn(List.of());
        mockMvc.perform(get("/api/appointments/with-details")).andExpect(status().isOk());
    }

    @Test
    void getAppointmentsByPatientId_Returns200() throws Exception {
        when(appointmentService.getAppointmentsByPatientId(1L)).thenReturn(List.of());
        mockMvc.perform(get("/api/appointments/patient/1")).andExpect(status().isOk());
    }

    // BUG B12: GET /api/appointments/{id} when not found casts Map to (Appointment) at line 74
    // Causes ClassCastException -> 500 instead of 404. Not testable via MockMvc.
}
