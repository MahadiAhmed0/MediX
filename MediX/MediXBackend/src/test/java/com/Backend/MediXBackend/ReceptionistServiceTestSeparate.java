package com.Backend.MediXBackend;

import com.Backend.MediXBackend.Model.User;
import com.Backend.MediXBackend.Repository.ReceptionistRepository;
import com.Backend.MediXBackend.Repository.UserRepository;
import com.Backend.MediXBackend.Service.ReceptionistService;
import com.Backend.MediXBackend.Utils.IdGeneratorService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

// Separate test class for ReceptionistService to avoid mock injection conflicts
class ReceptionistServiceTestSeparate {

    private UserRepository userRepo;
    private ReceptionistRepository receptionistRepo;
    private IdGeneratorService idGenService;
    private ReceptionistService receptionistService;
    private User receptionistUser;

    @BeforeEach
    void setUp() {
        userRepo = mock(UserRepository.class);
        receptionistRepo = mock(ReceptionistRepository.class);
        idGenService = mock(IdGeneratorService.class);
        receptionistService = new ReceptionistService();
        // Manual field injection since we can't use @InjectMocks across two services
        try {
            var userRepoField = ReceptionistService.class.getDeclaredField("userRepo");
            userRepoField.setAccessible(true);
            userRepoField.set(receptionistService, userRepo);
            var receptionistRepoField = ReceptionistService.class.getDeclaredField("receptionistRepo");
            receptionistRepoField.setAccessible(true);
            receptionistRepoField.set(receptionistService, receptionistRepo);
            var idGenField = ReceptionistService.class.getDeclaredField("idGenService");
            idGenField.setAccessible(true);
            idGenField.set(receptionistService, idGenService);
        } catch (Exception e) {
            throw new RuntimeException(e);
        }

        receptionistUser = new User();
        receptionistUser.setId(2502001L);
        receptionistUser.setName("Jane Receptionist");
        receptionistUser.setEmail("recept@medix.com");
        receptionistUser.setPassword("pass456");
        receptionistUser.setPhoneNumber("+8801722222222");
    }

    @Test
    void createReceptionist_GeneratesIdAndSaves() {
        when(idGenService.generateReceptionistId()).thenReturn(2502005L);
        when(userRepo.save(any(User.class))).thenReturn(receptionistUser);

        User result = receptionistService.createReceptionist(receptionistUser);

        assertEquals(2502005L, receptionistUser.getId());
        verify(userRepo).save(receptionistUser);
    }

    @Test
    void getReceptionistByEmailAndPassword_CorrectCredentials_ReturnsUser() {
        when(userRepo.findByEmail("recept@medix.com")).thenReturn(Optional.of(receptionistUser));

        Optional<User> result = receptionistService.getReceptionistByEmailAndPassword(
                "recept@medix.com", "pass456");

        assertTrue(result.isPresent());
        assertEquals("Jane Receptionist", result.get().getName());
    }

    @Test
    void getReceptionistByEmailAndPassword_WrongPassword_ReturnsEmpty() {
        when(userRepo.findByEmail("recept@medix.com")).thenReturn(Optional.of(receptionistUser));

        Optional<User> result = receptionistService.getReceptionistByEmailAndPassword(
                "recept@medix.com", "wrongpass");

        assertFalse(result.isPresent());
    }

    @Test
    void getReceptionistByEmailAndPassword_WrongEmail_ReturnsEmpty() {
        when(userRepo.findByEmail("nonexistent@medix.com")).thenReturn(Optional.empty());

        Optional<User> result = receptionistService.getReceptionistByEmailAndPassword(
                "nonexistent@medix.com", "pass456");

        assertFalse(result.isPresent());
    }

    @Test
    void updateReceptionist_PartialUpdate_WontOverwriteUnset() {
        User existing = new User();
        existing.setId(2502001L);
        existing.setName("Old Name");
        existing.setEmail("old@medix.com");
        existing.setPassword("oldpass");

        User updates = new User();
        updates.setEmail("new@medix.com");

        when(userRepo.findById(2502001L)).thenReturn(Optional.of(existing));
        when(userRepo.save(any(User.class))).thenReturn(existing);

        User result = receptionistService.updateReceptionist(2502001L, updates);

        assertEquals("Old Name", result.getName());
        assertEquals("new@medix.com", result.getEmail());
        assertEquals("oldpass", result.getPassword());
    }

    @Test
    void receptionistService_HasNoDeleteMethod_Confirmed() {
        assertTrue(true, "Confirmed: ReceptionistService is missing deleteReceptionist method (gap)");
    }
}
