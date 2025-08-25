package com.Backend.MediXBackend.Controller;

import com.Backend.MediXBackend.DTO.BillHistoryResponse;
import com.Backend.MediXBackend.DTO.RevenueResponse;
import com.Backend.MediXBackend.Model.Bill;
import com.Backend.MediXBackend.Model.BillItem;
import com.Backend.MediXBackend.Service.BillService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/bills")
@CrossOrigin(origins = "*")
public class BillController {

    @Autowired
    private BillService billService;

    // Get all bills
    @GetMapping
    public List<Bill> getAllBills() {
        return billService.getAllBills();
    }

    // Get bill by ID
    @GetMapping("/{id}")
    public ResponseEntity<Bill> getBillById(@PathVariable Long id) {
        Optional<Bill> bill = billService.getBillById(id);
        return bill.map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    // Get bills by date
    @GetMapping("/date/{date}")
    public List<Bill> getBillsByDate(@PathVariable LocalDate date) {
        return billService.getBillsByDate(date);
    }

    // Get bills by customer name
    @GetMapping("/customer/{customerName}")
    public List<Bill> getBillsByCustomerName(@PathVariable String customerName) {
        return billService.getBillsByCustomerName(customerName);
    }

    // Get bills by phone number
    @GetMapping("/phone/{phoneNumber}")
    public List<Bill> getBillsByPhoneNumber(@PathVariable String phoneNumber) {
        return billService.getBillsByPhoneNumber(phoneNumber);
    }

    // Get bill items by bill ID
    @GetMapping("/{id}/items")
    public List<BillItem> getBillItemsByBillId(@PathVariable Long id) {
        return billService.getBillItemsByBillId(id);
    }

    // Create new bill
    @PostMapping
    public Bill createBill(@Valid @RequestBody Bill bill) {
        return billService.createBill(bill);
    }

    // Delete bill
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteBill(@PathVariable Long id) {
        boolean deleted = billService.deleteBill(id);
        if (deleted) {
            return ResponseEntity.ok().build();
        }
        return ResponseEntity.notFound().build();
    }

    // Revenue analytics endpoint
    @GetMapping("/revenue/analytics")
    public ResponseEntity<RevenueResponse> getRevenueAnalytics() {
        RevenueResponse revenue = billService.getRevenueAnalytics();
        return ResponseEntity.ok(revenue);
    }

    // Bill history endpoint
    @GetMapping("/history")
    public ResponseEntity<List<BillHistoryResponse>> getBillHistory() {
        List<BillHistoryResponse> billHistory = billService.getBillHistory();
        return ResponseEntity.ok(billHistory);
    }
}