package com.Backend.MediXBackend.Service;

import com.Backend.MediXBackend.DTO.BillHistoryResponse;
import com.Backend.MediXBackend.DTO.RevenueResponse;
import com.Backend.MediXBackend.Model.*;
import com.Backend.MediXBackend.Repository.BillItemRepository;
import com.Backend.MediXBackend.Repository.BillRepository;
import com.Backend.MediXBackend.Repository.MedicineRepository;
import com.Backend.MediXBackend.Repository.PrescriptionRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class BillService {

    @Autowired
    private BillRepository billRepository;

    @Autowired
    private BillItemRepository billItemRepository;

    @Autowired
    private MedicineRepository medicineRepository;

    public List<Bill> getAllBills() {
        return billRepository.findAll();
    }

    public Optional<Bill> getBillById(Long id) {
        return billRepository.findById(id);
    }

    public List<Bill> getBillsByDate(LocalDate date) {
        return billRepository.findByDate(date);
    }

    public List<Bill> getBillsByCustomerName(String customerName) {
        return billRepository.findByCustomerNameContainingIgnoreCase(customerName);
    }

    public List<Bill> getBillsByPhoneNumber(String phoneNumber) {
        return billRepository.findByPhoneNumber(phoneNumber);
    }

    public List<BillItem> getBillItemsByBillId(Long billId) {
        return billItemRepository.findByBill_BillID(billId);
    }

    @Transactional
    public Bill createBill(Bill bill) {
        // Extract bill items first
        List<BillItem> billItems = bill.getBillItems();
        bill.setBillItems(null); // Clear items temporarily

        // First save the bill without items to get an ID
        Bill savedBill = billRepository.save(bill);

        // Process each bill item
        for (BillItem item : billItems) {
            item.setBill(savedBill); // Set the saved bill with ID
            billItemRepository.save(item);

            // Update medicine quantity
            Optional<Medicine> medicineOpt = medicineRepository.findByMedicineName(item.getMedicineName());
            if (medicineOpt.isPresent()) {
                Medicine medicine = medicineOpt.get();
                int newQuantity = medicine.getQuantity() - item.getQuantity();
                if (newQuantity < 0) {
                    throw new RuntimeException("Insufficient quantity for medicine: " + item.getMedicineName());
                }
                medicine.setQuantity(newQuantity);
                medicineRepository.save(medicine);
            } else {
                throw new RuntimeException("Medicine not found: " + item.getMedicineName());
            }
        }

        // Set the items back to the saved bill
        savedBill.setBillItems(billItems);
        return savedBill;
    }

    public boolean deleteBill(Long id) {
        if (billRepository.existsById(id)) {
            // First get all bill items
            List<BillItem> billItems = billItemRepository.findByBill_BillID(id);

            // Restore medicine quantities
            for (BillItem item : billItems) {
                Optional<Medicine> medicineOpt = medicineRepository.findByMedicineName(item.getMedicineName());
                if (medicineOpt.isPresent()) {
                    Medicine medicine = medicineOpt.get();
                    medicine.setQuantity(medicine.getQuantity() + item.getQuantity());
                    medicineRepository.save(medicine);
                }
            }

            // Delete bill items
            billItemRepository.deleteAll(billItems);

            // Delete the bill
            billRepository.deleteById(id);
            return true;
        }
        return false;
    }

    public RevenueResponse getRevenueAnalytics() {
        Double todayRevenue = billRepository.getTodayRevenue();

        // Calculate weekly revenue (current week)
        LocalDate now = LocalDate.now();
        LocalDate startOfWeek = now.with(DayOfWeek.MONDAY);
        LocalDate endOfWeek = now.with(DayOfWeek.SUNDAY);
        Double weeklyRevenue = billRepository.getWeeklyRevenue(startOfWeek, endOfWeek);

        Double monthlyRevenue = billRepository.getMonthlyRevenue();

        return new RevenueResponse(todayRevenue, weeklyRevenue, monthlyRevenue);
    }

    public List<BillHistoryResponse> getBillHistory() {
        List<Object[]> results = billRepository.findAllBillsWithPatientInfo();

        return results.stream().map(result -> {
            Bill bill = (Bill) result[0];
            Long patientId = (Long) result[1];
            String patientPhoneFromPatient = (String) result[2];

            String patientPhone = bill.getPhoneNumber();

            // Use patient phone from patient record if available, otherwise use bill phone
            if (patientPhoneFromPatient != null && !patientPhoneFromPatient.isEmpty()) {
                patientPhone = patientPhoneFromPatient;
            }

            return new BillHistoryResponse(
                    bill.getBillID(),
                    bill.getDate(),
                    bill.getPrescriptionId(),
                    patientId,
                    patientPhone,
                    bill.getSellType(),
                    bill.getTotal()
            );
        }).collect(Collectors.toList());
    }
}