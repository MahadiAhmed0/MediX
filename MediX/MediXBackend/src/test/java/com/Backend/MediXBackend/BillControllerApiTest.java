package com.Backend.MediXBackend;

import com.Backend.MediXBackend.Controller.*;
import com.Backend.MediXBackend.Model.*;
import com.Backend.MediXBackend.DTO.*;
import com.Backend.MediXBackend.Service.*;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import java.time.LocalDate;
import java.util.*;

import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(BillController.class)
class BillControllerApiTest {

    @Autowired
    private MockMvc mockMvc;
    @Autowired
    private ObjectMapper mapper;
    @MockitoBean
    private BillService billService;

    @Test
    void getAllBills_Returns200() throws Exception {
        when(billService.getAllBills()).thenReturn(List.of());
        mockMvc.perform(get("/api/bills")).andExpect(status().isOk());
    }

    @Test
    void getBillById_Found_Returns200() throws Exception {
        Bill bill = new Bill();
        bill.setBillID(1L);
        bill.setTotal(100.0);
        when(billService.getBillById(1L)).thenReturn(Optional.of(bill));

        mockMvc.perform(get("/api/bills/1"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.total").value(100.0));
    }

    @Test
    void getBillById_NotFound_Returns404() throws Exception {
        when(billService.getBillById(999L)).thenReturn(Optional.empty());
        mockMvc.perform(get("/api/bills/999")).andExpect(status().isNotFound());
    }

    @Test
    void getBillsByDate_Returns200() throws Exception {
        when(billService.getBillsByDate(any(LocalDate.class))).thenReturn(List.of());
        mockMvc.perform(get("/api/bills/date/2026-07-28")).andExpect(status().isOk());
    }

    @Test
    void getBillsByCustomerName_Returns200() throws Exception {
        when(billService.getBillsByCustomerName("John")).thenReturn(List.of());
        mockMvc.perform(get("/api/bills/customer/John")).andExpect(status().isOk());
    }

    @Test
    void getBillsByPhone_Returns200() throws Exception {
        when(billService.getBillsByPhoneNumber("+880")).thenReturn(List.of());
        mockMvc.perform(get("/api/bills/phone/+880")).andExpect(status().isOk());
    }

    @Test
    void getBillItems_Returns200() throws Exception {
        when(billService.getBillItemsByBillId(1L)).thenReturn(List.of());
        mockMvc.perform(get("/api/bills/1/items")).andExpect(status().isOk());
    }

    @Test
    void createBill_Success_Returns200() throws Exception {
        Bill bill = new Bill();
        bill.setBillID(1L);
        bill.setCustomerName("John");
        bill.setPhoneNumber("+880");
        bill.setDate(LocalDate.now());
        bill.setTotal(100.0);
        bill.setSubTotal(90.0);
        bill.setTax(10.0);
        when(billService.createBill(any(Bill.class))).thenReturn(bill);

        String json = """
            {"customerName":"John","phoneNumber":"+880","date":"2026-07-28",
             "subTotal":90.0,"tax":10.0,"total":100.0,"sellType":false,
             "billItems":[{"medicineName":"Napa","quantity":2,"unitPrice":5.0,"discount":0.0,"total":10.0}]}""";
        mockMvc.perform(post("/api/bills")
                .contentType(MediaType.APPLICATION_JSON).content(json))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.billID").value(1));
    }

    @Test
    void deleteBill_Success_Returns200() throws Exception {
        when(billService.deleteBill(1L)).thenReturn(true);
        mockMvc.perform(delete("/api/bills/1")).andExpect(status().isOk());
    }

    @Test
    void deleteBill_NotFound_Returns404() throws Exception {
        when(billService.deleteBill(999L)).thenReturn(false);
        mockMvc.perform(delete("/api/bills/999")).andExpect(status().isNotFound());
    }

    @Test
    void getRevenueAnalytics_Returns200() throws Exception {
        RevenueResponse revenue = new RevenueResponse(1000.0, 5000.0, 20000.0);
        when(billService.getRevenueAnalytics()).thenReturn(revenue);

        mockMvc.perform(get("/api/bills/revenue/analytics"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.todayRevenue").value(1000.0))
            .andExpect(jsonPath("$.weeklyRevenue").value(5000.0))
            .andExpect(jsonPath("$.monthlyRevenue").value(20000.0));
    }

    @Test
    void getBillHistory_Returns200() throws Exception {
        when(billService.getBillHistory()).thenReturn(List.of());
        mockMvc.perform(get("/api/bills/history")).andExpect(status().isOk());
    }
}
