package com.Backend.MediXBackend;

import com.Backend.MediXBackend.Model.*;
import com.Backend.MediXBackend.Repository.*;
import com.Backend.MediXBackend.Service.BillService;
import com.Backend.MediXBackend.Utils.IdGeneratorService;
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
class BillEdgeCaseTests {

    @Mock
    private BillRepository billRepository;
    @Mock
    private BillItemRepository billItemRepository;
    @Mock
    private MedicineRepository medicineRepository;

    @InjectMocks
    private BillService billService;

    @Test
    void createBill_WithNoItems_DoesNotCrash() {
        Bill bill = new Bill();
        bill.setCustomerName("Test");
        bill.setPhoneNumber("+880");
        bill.setDate(LocalDate.now());
        bill.setTotal(0.0);
        bill.setSubTotal(0.0);
        bill.setTax(0.0);
        bill.setBillItems(new ArrayList<>());

        Bill savedBill = new Bill();
        savedBill.setBillID(1L);
        when(billRepository.save(any(Bill.class))).thenReturn(savedBill);

        Bill result = billService.createBill(bill);
        assertNotNull(result);
        verify(medicineRepository, never()).findByMedicineName(anyString());
    }

    @Test
    void createBill_NullBillItems_ThrowsNPE() {
        Bill bill = new Bill();
        bill.setCustomerName("Test");
        bill.setPhoneNumber("+880");
        bill.setDate(LocalDate.now());
        bill.setTotal(0.0);
        bill.setSubTotal(0.0);
        bill.setTax(0.0);
        bill.setBillItems(null);

        Bill savedBill = new Bill();
        savedBill.setBillID(1L);
        when(billRepository.save(any(Bill.class))).thenReturn(savedBill);

        assertThrows(NullPointerException.class, () -> billService.createBill(bill));
    }

    @Test
    void deleteBill_RepeatedCalls_SecondReturnsFalse() {
        when(billRepository.existsById(1L)).thenReturn(true).thenReturn(false);
        when(billItemRepository.findByBill_BillID(1L)).thenReturn(new ArrayList<>());

        assertTrue(billService.deleteBill(1L));
        assertFalse(billService.deleteBill(1L));
        verify(billRepository, times(1)).deleteById(1L);
    }
}
