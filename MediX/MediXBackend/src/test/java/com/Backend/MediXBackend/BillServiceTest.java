package com.Backend.MediXBackend;

import com.Backend.MediXBackend.Model.Bill;
import com.Backend.MediXBackend.Model.BillItem;
import com.Backend.MediXBackend.Model.Medicine;
import com.Backend.MediXBackend.Repository.BillRepository;
import com.Backend.MediXBackend.Repository.BillItemRepository;
import com.Backend.MediXBackend.Repository.MedicineRepository;
import com.Backend.MediXBackend.Service.BillService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDate;
import java.util.*;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class BillServiceTest {

    @Mock
    private BillRepository billRepository;
    @Mock
    private BillItemRepository billItemRepository;
    @Mock
    private MedicineRepository medicineRepository;

    @InjectMocks
    private BillService billService;

    private Bill bill;
    private BillItem billItem;
    private Medicine napa;

    @BeforeEach
    void setUp() {
        bill = new Bill();
        bill.setCustomerName("John Doe");
        bill.setPhoneNumber("+8801711111111");
        bill.setDate(LocalDate.now());
        bill.setSubTotal(12.0);
        bill.setTax(1.8);
        bill.setTotal(13.8);
        bill.setSellType(false);

        billItem = new BillItem();
        billItem.setMedicineName("Napa");
        billItem.setQuantity(2);
        billItem.setUnitPrice(6.0);
        billItem.setDiscount(0.0);
        billItem.setTotal(12.0);

        bill.setBillItems(new ArrayList<>(List.of(billItem)));

        napa = new Medicine();
        napa.setId(1L);
        napa.setMedicineName("Napa");
        napa.setQuantity(10);
        napa.setUnitCost(5.0);
        napa.setUnitPrice(6.0);
        napa.setExpiryDate(LocalDate.now().plusYears(1));
    }

    @Test
    void createBill_DeductsInventoryCorrectly() {
        Bill savedBill = new Bill();
        savedBill.setBillID(1L);

        when(billRepository.save(any(Bill.class))).thenReturn(savedBill);
        when(medicineRepository.findByMedicineName("Napa")).thenReturn(Optional.of(napa));
        when(medicineRepository.save(any(Medicine.class))).thenReturn(napa);
        when(billItemRepository.save(any(BillItem.class))).thenReturn(billItem);

        Bill result = billService.createBill(bill);

        assertNotNull(result);
        assertEquals(8, napa.getQuantity()); // 10 - 2 = 8
        verify(medicineRepository).save(napa);
    }

    @Test
    void createBill_InsufficientQuantity_ThrowsException() {
        napa.setQuantity(1); // only 1 in stock, need 2

        Bill savedBill = new Bill();
        savedBill.setBillID(1L);

        when(billRepository.save(any(Bill.class))).thenReturn(savedBill);
        when(medicineRepository.findByMedicineName("Napa")).thenReturn(Optional.of(napa));
        when(billItemRepository.save(any(BillItem.class))).thenReturn(billItem);

        RuntimeException ex = assertThrows(RuntimeException.class,
            () -> billService.createBill(bill));

        assertTrue(ex.getMessage().contains("Insufficient quantity for medicine"));
        // Verify we didn't save the inventory update
        verify(medicineRepository, never()).save(any(Medicine.class));
        // The bill was saved, but the item was already persisted before the exception
        // CRITICAL: This confirms partial state — bill and item saved, but inventory not committed
        // The @Transactional annotation should rollback, but we're in a mock test
    }

    @Test
    void createBill_MultiItem_SecondItemFails_FirstInventoryStillDeducted() {
        // This test verifies the critical finding from PROJECT_OVERVIEW.md:
        // createBill has @Transactional but within a mocked test context we can observe
        // the sequential nature. We'll test this properly with SpringBootTest.
        
        // Setup: Napa (10 qty) and Seclo (1 qty), need 2 of each
        Medicine seclo = new Medicine();
        seclo.setId(2L);
        seclo.setMedicineName("Seclo");
        seclo.setQuantity(1);
        seclo.setUnitPrice(25.0);

        BillItem item1 = new BillItem();
        item1.setMedicineName("Napa");
        item1.setQuantity(2);
        BillItem item2 = new BillItem();
        item2.setMedicineName("Seclo");
        item2.setQuantity(2);

        bill.setBillItems(new ArrayList<>(List.of(item1, item2)));

        Bill savedBill = new Bill();
        savedBill.setBillID(1L);

        when(billRepository.save(any(Bill.class))).thenReturn(savedBill);
        when(medicineRepository.findByMedicineName("Napa")).thenReturn(Optional.of(napa));
        when(medicineRepository.findByMedicineName("Seclo")).thenReturn(Optional.of(seclo));
        when(billItemRepository.save(any(BillItem.class))).thenAnswer(inv -> inv.getArgument(0));

        // Napa has 10, deducting 2 leaves 8 — should succeed
        // Seclo has 1, deducting 2 should throw

        assertThrows(RuntimeException.class, () -> billService.createBill(bill));

        // After exception: Napa was already reduced to 8 (inventory was saved)
        // This is the inventory corruption risk — first item deduction is committed
        assertEquals(8, napa.getQuantity());
    }

    @Test
    void createBill_MedicineNotFound_ThrowsException() {
        Bill savedBill = new Bill();
        savedBill.setBillID(1L);

        when(billRepository.save(any(Bill.class))).thenReturn(savedBill);
        when(medicineRepository.findByMedicineName("Napa")).thenReturn(Optional.empty());
        when(billItemRepository.save(any(BillItem.class))).thenReturn(billItem);

        RuntimeException ex = assertThrows(RuntimeException.class,
            () -> billService.createBill(bill));

        assertTrue(ex.getMessage().contains("Medicine not found"));
    }

    @Test
    void deleteBill_RestoresInventoryCorrectly() {
        Bill existingBill = new Bill();
        existingBill.setBillID(1L);
        existingBill.setTotal(13.8);

        BillItem existingItem = new BillItem();
        existingItem.setId(1L);
        existingItem.setMedicineName("Napa");
        existingItem.setQuantity(2);

        when(billRepository.existsById(1L)).thenReturn(true);
        when(billItemRepository.findByBill_BillID(1L)).thenReturn(List.of(existingItem));
        when(medicineRepository.findByMedicineName("Napa")).thenReturn(Optional.of(napa));
        napa.setQuantity(5); // Current stock is 5

        boolean result = billService.deleteBill(1L);

        assertTrue(result);
        assertEquals(7, napa.getQuantity()); // 5 + 2 = 7
        verify(medicineRepository).save(napa);
        verify(billItemRepository).deleteAll(anyList());
        verify(billRepository).deleteById(1L);
    }

    @Test
    void deleteBill_NotFound_ReturnsFalse() {
        when(billRepository.existsById(999L)).thenReturn(false);

        boolean result = billService.deleteBill(999L);

        assertFalse(result);
        verify(billRepository, never()).deleteById(anyLong());
    }
}
