package com.Backend.MediXBackend;

import com.Backend.MediXBackend.Model.User;
import com.Backend.MediXBackend.Repository.*;
import com.Backend.MediXBackend.Service.*;
import org.junit.jupiter.api.Test;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class AuthEdgeCaseTests {

    // Verify NullPointerException is thrown when stored password is null
    @Test
    void pharmacistLogin_NullPasswordInDB_NonNullInput_NPE() {
        PharmacistService svc = new PharmacistService();
        UserRepository userRepo = mock(UserRepository.class);
        try {
            var f = PharmacistService.class.getDeclaredField("userRepo");
            f.setAccessible(true); f.set(svc, userRepo);
        } catch (Exception e) { fail("Reflection failed"); }

        User u = new User();
        u.setEmail("ph@test.com");
        u.setPassword(null);
        when(userRepo.findByEmail("ph@test.com")).thenReturn(Optional.of(u));

        assertThrows(NullPointerException.class, () ->
            svc.getPharmacistByEmailAndPassword("ph@test.com", "input"));
    }

    // Verify null input password is handled gracefully without NullPointerException
    @Test
    void pharmacistLogin_NullInputPassword_DoesNotNPE() {
        PharmacistService svc = new PharmacistService();
        UserRepository userRepo = mock(UserRepository.class);
        try {
            var f = PharmacistService.class.getDeclaredField("userRepo");
            f.setAccessible(true); f.set(svc, userRepo);
        } catch (Exception e) { fail(); }

        User u = new User();
        u.setEmail("ph@test.com");
        u.setPassword("realpass");
        when(userRepo.findByEmail("ph@test.com")).thenReturn(Optional.of(u));

        Optional<User> result = svc.getPharmacistByEmailAndPassword("ph@test.com", null);
        assertFalse(result.isPresent());
    }

    // Verify NullPointerException is thrown during receptionist login when stored password is null
    @Test
    void receptionistLogin_NullPasswordInDB_NonNullInput_NPE() {
        ReceptionistService svc = new ReceptionistService();
        UserRepository userRepo = mock(UserRepository.class);
        try {
            var f = ReceptionistService.class.getDeclaredField("userRepo");
            f.setAccessible(true); f.set(svc, userRepo);
        } catch (Exception e) { fail(); }

        User u = new User();
        u.setEmail("r@test.com");
        u.setPassword(null);
        when(userRepo.findByEmail("r@test.com")).thenReturn(Optional.of(u));

        assertThrows(NullPointerException.class, () ->
            svc.getReceptionistByEmailAndPassword("r@test.com", "input"));
    }

    // Verify login returns empty Optional when email is not found in the database
    @Test
    void pharmacistLogin_WrongEmail_ReturnsEmpty() {
        PharmacistService svc = new PharmacistService();
        UserRepository userRepo = mock(UserRepository.class);
        try {
            var f = PharmacistService.class.getDeclaredField("userRepo");
            f.setAccessible(true); f.set(svc, userRepo);
        } catch (Exception e) { fail(); }

        when(userRepo.findByEmail("no@one.com")).thenReturn(Optional.empty());
        assertFalse(svc.getPharmacistByEmailAndPassword("no@one.com", "any").isPresent());
    }
}
