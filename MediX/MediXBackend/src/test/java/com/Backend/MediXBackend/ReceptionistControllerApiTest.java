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

@WebMvcTest(ReceptionistController.class)
class ReceptionistControllerApiTest {

    @Autowired private MockMvc mockMvc;
    @MockitoBean private ReceptionistService receptionistService;

    @Test void createReceptionist_Success_Returns200() throws Exception {
        User u = new User(); u.setId(2502001L); u.setName("Jane");
        when(receptionistService.createReceptionist(any(User.class))).thenReturn(u);
        mockMvc.perform(post("/api/receptionists").contentType(MediaType.APPLICATION_JSON).content("{\"name\":\"Jane\",\"email\":\"r@test.com\",\"password\":\"pass\"}"))
            .andExpect(status().isOk()).andExpect(jsonPath("$.name").value("Jane"));
    }

    @Test void getReceptionistById_Found_Returns200() throws Exception {
        User u = new User(); u.setId(2502001L);
        when(receptionistService.getReceptionistById(2502001L)).thenReturn(Optional.of(u));
        mockMvc.perform(get("/api/receptionists/2502001")).andExpect(status().isOk());
    }

    @Test void loginReceptionist_Success_Returns200() throws Exception {
        User u = new User(); u.setId(2502001L); u.setName("Jane");
        when(receptionistService.getReceptionistByEmailAndPassword("r@test.com", "pass")).thenReturn(Optional.of(u));
        mockMvc.perform(post("/api/receptionists/by-email").contentType(MediaType.APPLICATION_JSON).content("{\"email\":\"r@test.com\",\"password\":\"pass\"}"))
            .andExpect(status().isOk()).andExpect(jsonPath("$.success").value(true));
    }

    @Test void loginReceptionist_WrongPassword_Returns401() throws Exception {
        when(receptionistService.getReceptionistByEmailAndPassword("r@test.com", "wrong")).thenReturn(Optional.empty());
        mockMvc.perform(post("/api/receptionists/by-email").contentType(MediaType.APPLICATION_JSON).content("{\"email\":\"r@test.com\",\"password\":\"wrong\"}"))
            .andExpect(status().isUnauthorized()).andExpect(jsonPath("$.success").value(false));
    }

    @Test void loginReceptionist_MissingEmail_Returns400() throws Exception {
        mockMvc.perform(post("/api/receptionists/by-email").contentType(MediaType.APPLICATION_JSON).content("{\"password\":\"pass\"}"))
            .andExpect(status().isBadRequest());
    }

    @Test void updateReceptionist_Success_Returns200() throws Exception {
        User u = new User(); u.setId(2502001L);
        when(receptionistService.updateReceptionist(eq(2502001L), any())).thenReturn(u);
        mockMvc.perform(put("/api/receptionists/2502001").contentType(MediaType.APPLICATION_JSON).content("{\"name\":\"Updated\"}"))
            .andExpect(status().isOk());
    }

    @Test void updateReceptionist_NotFound_Returns404() throws Exception {
        when(receptionistService.updateReceptionist(eq(999L), any())).thenThrow(new RuntimeException("Receptionist not found"));
        mockMvc.perform(put("/api/receptionists/999").contentType(MediaType.APPLICATION_JSON).content("{}"))
            .andExpect(status().isNotFound());
    }

    @Test void noDeleteEndpoint_Returns405() throws Exception {
        mockMvc.perform(delete("/api/receptionists/2502001")).andExpect(status().is4xxClientError());
    }

    // BUG B18: GET /api/receptionists/{id} 404 branch casts Map to (User) — ClassCastException
}
