package com.Backend.MediXBackend;

import com.Backend.MediXBackend.Controller.*;
import com.Backend.MediXBackend.Model.*;
import com.Backend.MediXBackend.Repository.*;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import java.util.*;

import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(UserController.class)
class UserControllerApiTest {

    @Autowired
    private MockMvc mockMvc;
    @MockitoBean
    private UserRepository userRepo;

    @Test
    void getAllUsers_Returns200() throws Exception {
        when(userRepo.findAll()).thenReturn(List.of());
        mockMvc.perform(get("/api/users")).andExpect(status().isOk());
    }

    @Test
    void getAllUsers_ReturnsUsers() throws Exception {
        User u1 = new User();
        u1.setId(1L);
        u1.setName("Test");
        u1.setEmail("test@test.com");
        when(userRepo.findAll()).thenReturn(List.of(u1));

        mockMvc.perform(get("/api/users"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$[0].name").value("Test"))
            .andExpect(jsonPath("$[0].email").value("test@test.com"));
    }
}
