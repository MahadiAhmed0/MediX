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

@WebMvcTest(QualificationController.class)
class QualificationControllerApiTest {

    @Autowired
    private MockMvc mockMvc;
    @Autowired
    private ObjectMapper mapper;
    @MockitoBean
    private QualificationService qualificationService;

    @Test
    void createQualification_Success_Returns201() throws Exception {
        Qualification q = new Qualification();
        q.setId(1);
        q.setName("MBBS");
        when(qualificationService.createQualification(any())).thenReturn(q);

        String json = "{\"name\":\"MBBS\"}";
        mockMvc.perform(post("/api/qualifications")
                .contentType(MediaType.APPLICATION_JSON).content(json))
            .andExpect(status().isCreated())
            .andExpect(jsonPath("$.name").value("MBBS"));
    }

    @Test
    void createQualification_EmptyName_Returns400() throws Exception {
        String json = "{\"name\":\"\"}";
        mockMvc.perform(post("/api/qualifications")
                .contentType(MediaType.APPLICATION_JSON).content(json))
            .andExpect(status().isBadRequest());
    }

    @Test
    void createQualification_Duplicate_Returns409() throws Exception {
        when(qualificationService.existsByName("MBBS")).thenReturn(true);

        String json = "{\"name\":\"MBBS\"}";
        mockMvc.perform(post("/api/qualifications")
                .contentType(MediaType.APPLICATION_JSON).content(json))
            .andExpect(status().isConflict())
            .andExpect(jsonPath("$.error").value("Qualification with this name already exists"));
    }

    @Test
    void getAllQualifications_Returns200() throws Exception {
        when(qualificationService.getAllQualifications()).thenReturn(List.of());
        mockMvc.perform(get("/api/qualifications")).andExpect(status().isOk());
    }

    @Test
    void getQualificationById_Found_Returns200() throws Exception {
        Qualification q = new Qualification();
        q.setId(1);
        q.setName("MBBS");
        when(qualificationService.getQualificationById(1)).thenReturn(Optional.of(q));

        mockMvc.perform(get("/api/qualifications/1"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.name").value("MBBS"));
    }

    @Test
    void getQualificationById_NotFound_Returns404() throws Exception {
        when(qualificationService.getQualificationById(99)).thenReturn(Optional.empty());

        mockMvc.perform(get("/api/qualifications/99"))
            .andExpect(status().isNotFound());
    }

    @Test
    void updateQualification_Success_Returns200() throws Exception {
        Qualification q = new Qualification();
        q.setId(1);
        q.setName("FCPS");
        when(qualificationService.updateQualification(eq(1), any())).thenReturn(q);

        String json = "{\"name\":\"FCPS\"}";
        mockMvc.perform(put("/api/qualifications/1")
                .contentType(MediaType.APPLICATION_JSON).content(json))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.name").value("FCPS"));
    }

    @Test
    void deleteQualification_Blocked_Returns409() throws Exception {
        doThrow(new RuntimeException("Cannot delete qualification because it is currently assigned to one or more doctors"))
            .when(qualificationService).deleteQualification(1);

        mockMvc.perform(delete("/api/qualifications/1"))
            .andExpect(status().isConflict())
            .andExpect(jsonPath("$.error").value(
                "Cannot delete qualification because it is currently assigned to one or more doctors"));
    }

    @Test
    void deleteQualification_Success_Returns200() throws Exception {
        doNothing().when(qualificationService).deleteQualification(1);

        mockMvc.perform(delete("/api/qualifications/1"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.message").value("Qualification deleted successfully"));
    }

    @Test
    void existsByName_True_Returns200() throws Exception {
        when(qualificationService.existsByName("MBBS")).thenReturn(true);

        mockMvc.perform(get("/api/qualifications/exists/MBBS"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.exists").value(true));
    }
}
