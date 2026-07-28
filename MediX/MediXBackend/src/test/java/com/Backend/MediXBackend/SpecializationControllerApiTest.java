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

@WebMvcTest(SpecializationController.class)
class SpecializationControllerApiTest {

    @Autowired
    private MockMvc mockMvc;
    @Autowired
    private ObjectMapper mapper;
    @MockitoBean
    private SpecializationService specializationService;

    // Verify POST /api/specializations returns 201 Created with specialization data
    @Test
    void createSpecialization_Success_Returns201() throws Exception {
        Specialization s = new Specialization();
        s.setId(1);
        s.setName("Cardiology");
        when(specializationService.createSpecialization(any())).thenReturn(s);

        String json = "{\"name\":\"Cardiology\"}";
        mockMvc.perform(post("/api/specializations")
                .contentType(MediaType.APPLICATION_JSON).content(json))
            .andExpect(status().isCreated())
            .andExpect(jsonPath("$.name").value("Cardiology"));
    }

    // Verify POST /api/specializations with empty name returns 400 Bad Request
    @Test
    void createSpecialization_EmptyName_Returns400() throws Exception {
        String json = "{\"name\":\"\"}";
        mockMvc.perform(post("/api/specializations")
                .contentType(MediaType.APPLICATION_JSON).content(json))
            .andExpect(status().isBadRequest());
    }

    // Verify POST /api/specializations with duplicate name returns 409 Conflict
    @Test
    void createSpecialization_Duplicate_Returns409() throws Exception {
        when(specializationService.existsByName("Cardiology")).thenReturn(true);

        String json = "{\"name\":\"Cardiology\"}";
        mockMvc.perform(post("/api/specializations")
                .contentType(MediaType.APPLICATION_JSON).content(json))
            .andExpect(status().isConflict())
            .andExpect(jsonPath("$.error").value("Specialization with this name already exists"));
    }

    // Verify GET /api/specializations returns 200 OK with list of specializations
    @Test
    void getAllSpecializations_Returns200() throws Exception {
        when(specializationService.getAllSpecializations()).thenReturn(List.of());
        mockMvc.perform(get("/api/specializations")).andExpect(status().isOk());
    }

    // Verify GET /api/specializations/{id} returns 200 with specialization data when found
    @Test
    void getSpecializationById_Found_Returns200() throws Exception {
        Specialization s = new Specialization();
        s.setId(1);
        s.setName("Cardiology");
        when(specializationService.getSpecializationById(1)).thenReturn(Optional.of(s));

        mockMvc.perform(get("/api/specializations/1"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.name").value("Cardiology"));
    }

    // Verify GET /api/specializations/{id} returns 404 when specialization is not found
    @Test
    void getSpecializationById_NotFound_Returns404() throws Exception {
        when(specializationService.getSpecializationById(99)).thenReturn(Optional.empty());

        mockMvc.perform(get("/api/specializations/99"))
            .andExpect(status().isNotFound());
    }

    // Verify PUT /api/specializations/{id} returns 200 with updated specialization name
    @Test
    void updateSpecialization_Success_Returns200() throws Exception {
        Specialization s = new Specialization();
        s.setId(1);
        s.setName("Neurology");
        when(specializationService.updateSpecialization(eq(1), any())).thenReturn(s);

        String json = "{\"name\":\"Neurology\"}";
        mockMvc.perform(put("/api/specializations/1")
                .contentType(MediaType.APPLICATION_JSON).content(json))
            .andExpect(status().isOk());
    }

    // Verify DELETE /api/specializations/{id} returns 409 Conflict when specialization is assigned to doctors
    @Test
    void deleteSpecialization_Blocked_Returns409() throws Exception {
        doThrow(new RuntimeException("Cannot delete specialization because it is currently assigned to one or more doctors"))
            .when(specializationService).deleteSpecialization(1);

        mockMvc.perform(delete("/api/specializations/1"))
            .andExpect(status().isConflict());
    }

    // Verify DELETE /api/specializations/{id} returns 200 when specialization is successfully deleted
    @Test
    void deleteSpecialization_Success_Returns200() throws Exception {
        doNothing().when(specializationService).deleteSpecialization(1);

        mockMvc.perform(delete("/api/specializations/1"))
            .andExpect(status().isOk());
    }

    // Verify GET /api/specializations/exists/{name} returns 200 with exists=true when specialization name is found
    @Test
    void existsByName_True_Returns200() throws Exception {
        when(specializationService.existsByName("Cardiology")).thenReturn(true);

        mockMvc.perform(get("/api/specializations/exists/Cardiology"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.exists").value(true));
    }
}
