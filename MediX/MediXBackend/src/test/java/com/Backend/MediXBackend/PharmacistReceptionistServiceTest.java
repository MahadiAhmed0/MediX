package com.Backend.MediXBackend;

import com.Backend.MediXBackend.Model.User;
import com.Backend.MediXBackend.Repository.PharmacistRepository;
import com.Backend.MediXBackend.Repository.UserRepository;
import com.Backend.MediXBackend.Service.PharmacistService;
import com.Backend.MediXBackend.Utils.IdGeneratorService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class PharmacistReceptionistServiceTest {

    @Mock
    private UserRepository userRepo;
    @Mock
    private PharmacistRepository pharmacistRepo;
    @Mock
    private IdGeneratorService idGenService;

    @InjectMocks
    private PharmacistService pharmacistService;

    private User pharmaUser;

    @BeforeEach
    void setUp() {
        pharmaUser = new User();
        pharmaUser.setId(2503001L);
        pharmaUser.setName("John Pharmacist");
        pharmaUser.setEmail("pharma@medix.com");
        pharmaUser.setPassword("pass123");
        pharmaUser.setPhoneNumber("+8801711111111");
    }

    @Test
    void createPharmacist_GeneratesIdAndSaves() {
        when(idGenService.generatePharmacistId()).thenReturn(2503005L);
        when(userRepo.save(any(User.class))).thenReturn(pharmaUser);

        User result = pharmacistService.createPharmacist(pharmaUser);

        verify(userRepo).save(pharmaUser);
        assertEquals(2503005L, pharmaUser.getId());
    }

    @Test
    void getPharmacistByEmailAndPassword_CorrectCredentials_ReturnsUser() {
        when(userRepo.findByEmail("pharma@medix.com")).thenReturn(Optional.of(pharmaUser));

        Optional<User> result = pharmacistService.getPharmacistByEmailAndPassword(
            "pharma@medix.com", "pass123");

        assertTrue(result.isPresent());
        assertEquals("John Pharmacist", result.get().getName());
    }

    @Test
    void getPharmacistByEmailAndPassword_WrongPassword_ReturnsEmpty() {
        when(userRepo.findByEmail("pharma@medix.com")).thenReturn(Optional.of(pharmaUser));

        Optional<User> result = pharmacistService.getPharmacistByEmailAndPassword(
            "pharma@medix.com", "wrongpass");

        assertFalse(result.isPresent());
    }

    @Test
    void getPharmacistByEmailAndPassword_WrongEmail_ReturnsEmpty() {
        when(userRepo.findByEmail("nonexistent@medix.com")).thenReturn(Optional.empty());

        Optional<User> result = pharmacistService.getPharmacistByEmailAndPassword(
            "nonexistent@medix.com", "pass123");

        assertFalse(result.isPresent());
    }

    @Test
    void updatePharmacist_PartialUpdate_WontOverwriteUnset() {
        User existing = new User();
        existing.setId(2503001L);
        existing.setName("Old Name");
        existing.setEmail("old@medix.com");
        existing.setPassword("oldpass");
        existing.setPhoneNumber("+8801700000000");

        User updates = new User();
        updates.setName("New Name");

        when(userRepo.findById(2503001L)).thenReturn(Optional.of(existing));
        when(userRepo.save(any(User.class))).thenReturn(existing);

        User result = pharmacistService.updatePharmacist(2503001L, updates);

        assertEquals("New Name", result.getName());
        assertEquals("old@medix.com", result.getEmail());
        assertEquals("+8801700000000", result.getPhoneNumber());
    }

    @Test
    void deletePharmacist_ExistingUser_ReturnsTrue() {
        when(userRepo.findById(2503001L)).thenReturn(Optional.of(pharmaUser));

        boolean result = pharmacistService.deletePharmacist(2503001L);

        assertTrue(result);
        verify(userRepo).deleteById(2503001L);
    }

    @Test
    void deletePharmacist_NotFound_ReturnsFalse() {
        when(userRepo.findById(999L)).thenReturn(Optional.empty());

        boolean result = pharmacistService.deletePharmacist(999L);

        assertFalse(result);
        verify(userRepo, never()).deleteById(anyLong());
    }
}

