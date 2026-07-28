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

@WebMvcTest(PharmacistController.class)
class PharmacistControllerApiTest {

    @Autowired private MockMvc mockMvc;
    @MockitoBean private PharmacistService pharmacistService;

    @Test void createPharmacist_Success_Returns200() throws Exception {
        User u = new User(); u.setId(2503001L); u.setName("John");
        when(pharmacistService.createPharmacist(any(User.class))).thenReturn(u);
        mockMvc.perform(post("/api/pharmacists").contentType(MediaType.APPLICATION_JSON).content("{\"name\":\"John\",\"email\":\"ph@test.com\",\"password\":\"pass\"}"))
            .andExpect(status().isOk()).andExpect(jsonPath("$.name").value("John"));
    }

    @Test void getPharmacistById_Found_Returns200() throws Exception {
        User u = new User(); u.setId(2503001L);
        when(pharmacistService.getPharmacistById(2503001L)).thenReturn(Optional.of(u));
        mockMvc.perform(get("/api/pharmacists/2503001")).andExpect(status().isOk());
    }

    @Test void loginPharmacist_Success_Returns200() throws Exception {
        User u = new User(); u.setId(2503001L); u.setName("John");
        when(pharmacistService.getPharmacistByEmailAndPassword("ph@test.com", "pass")).thenReturn(Optional.of(u));
        mockMvc.perform(post("/api/pharmacists/by-email").contentType(MediaType.APPLICATION_JSON).content("{\"email\":\"ph@test.com\",\"password\":\"pass\"}"))
            .andExpect(status().isOk()).andExpect(jsonPath("$.success").value(true));
    }

    @Test void loginPharmacist_WrongPassword_Returns401() throws Exception {
        when(pharmacistService.getPharmacistByEmailAndPassword("ph@test.com", "wrong")).thenReturn(Optional.empty());
        mockMvc.perform(post("/api/pharmacists/by-email").contentType(MediaType.APPLICATION_JSON).content("{\"email\":\"ph@test.com\",\"password\":\"wrong\"}"))
            .andExpect(status().isUnauthorized()).andExpect(jsonPath("$.success").value(false));
    }

    @Test void loginPharmacist_MissingEmail_Returns400() throws Exception {
        mockMvc.perform(post("/api/pharmacists/by-email").contentType(MediaType.APPLICATION_JSON).content("{\"password\":\"pass\"}"))
            .andExpect(status().isBadRequest());
    }

    @Test void updatePharmacist_Success_Returns200() throws Exception {
        User u = new User(); u.setId(2503001L);
        when(pharmacistService.updatePharmacist(eq(2503001L), any())).thenReturn(u);
        mockMvc.perform(put("/api/pharmacists/2503001").contentType(MediaType.APPLICATION_JSON).content("{\"name\":\"Updated\"}"))
            .andExpect(status().isOk());
    }

    @Test void deletePharmacist_Success_Returns200() throws Exception {
        when(pharmacistService.deletePharmacist(2503001L)).thenReturn(true);
        mockMvc.perform(delete("/api/pharmacists/2503001")).andExpect(status().isOk()).andExpect(jsonPath("$.success").value(true));
    }

    @Test void deletePharmacist_NotFound_Returns404() throws Exception {
        when(pharmacistService.deletePharmacist(999L)).thenReturn(false);
        mockMvc.perform(delete("/api/pharmacists/999")).andExpect(status().isNotFound()).andExpect(jsonPath("$.success").value(false));
    }

    // BUG B16: GET /api/pharmacists/{id} 404 branch casts Map to (User) — ClassCastException
    // BUG B17: POST /api/pharmacists/by-email catch uses Map.of("error", e.getMessage()) where e.getMessage() can be null
}
