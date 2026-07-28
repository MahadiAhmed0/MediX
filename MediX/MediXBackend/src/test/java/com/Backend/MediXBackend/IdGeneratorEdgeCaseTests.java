package com.Backend.MediXBackend;

import com.Backend.MediXBackend.Repository.*;
import com.Backend.MediXBackend.Utils.IdGeneratorService;
import org.junit.jupiter.api.Test;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class IdGeneratorEdgeCaseTests {

    @Test
    void generatePharmacistId_NotSynchronized_Confirmed() throws NoSuchMethodException {
        var method = IdGeneratorService.class.getDeclaredMethod("generatePharmacistId");
        boolean isSynchronized = java.lang.reflect.Modifier.isSynchronized(method.getModifiers());
        assertFalse(isSynchronized,
            "BUG: generatePharmacistId lacks 'synchronized' unlike generateReceptionistId");
    }

    @Test
    void generateReceptionistId_AtBoundary_ThrowsCorrectMessage() {
        IdGeneratorService svc = new IdGeneratorService();
        ReceptionistRepository mockRepo = mock(ReceptionistRepository.class);
        try {
            var field = IdGeneratorService.class.getDeclaredField("receptionistRepo");
            field.setAccessible(true);
            field.set(svc, mockRepo);
        } catch (Exception e) { fail("Reflection failed"); }

        when(mockRepo.findMaxReceptionistId()).thenReturn(Optional.of(2502999L));

        RuntimeException ex = assertThrows(RuntimeException.class, () -> svc.generateReceptionistId());
        assertTrue(ex.getMessage().contains("Maximum number of receptionists"));
    }

    @Test
    void generatePharmacistId_AtBoundary_ThrowsCorrectMessage() {
        IdGeneratorService svc = new IdGeneratorService();
        PharmacistRepository mockRepo = mock(PharmacistRepository.class);
        try {
            var field = IdGeneratorService.class.getDeclaredField("pharmacistRepository");
            field.setAccessible(true);
            field.set(svc, mockRepo);
        } catch (Exception e) { fail("Reflection failed"); }

        when(mockRepo.findMaxPharmacistId()).thenReturn(Optional.of(2503999L));

        RuntimeException ex = assertThrows(RuntimeException.class, () -> svc.generatePharmacistId());
        assertTrue(ex.getMessage().contains("Maximum pharmacist limit reached"));
    }
}
