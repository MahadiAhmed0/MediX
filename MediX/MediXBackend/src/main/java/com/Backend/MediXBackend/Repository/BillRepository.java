package com.Backend.MediXBackend.Repository;

import com.Backend.MediXBackend.Model.Bill;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface BillRepository extends JpaRepository<Bill, Long> {
    List<Bill> findByDate(LocalDate date);
    List<Bill> findByCustomerNameContainingIgnoreCase(String customerName);
    List<Bill> findByPhoneNumber(String phoneNumber);
    @Query("SELECT COALESCE(SUM(b.total), 0) FROM Bill b WHERE DATE(b.date) = CURRENT_DATE")
    Double getTodayRevenue();

    @Query("SELECT COALESCE(SUM(b.total), 0) FROM Bill b WHERE b.date >= :startOfWeek AND b.date <= :endOfWeek")
    Double getWeeklyRevenue(@Param("startOfWeek") LocalDate startOfWeek, @Param("endOfWeek") LocalDate endOfWeek);

    @Query("SELECT COALESCE(SUM(b.total), 0) FROM Bill b WHERE YEAR(b.date) = YEAR(CURRENT_DATE) AND MONTH(b.date) = MONTH(CURRENT_DATE)")
    Double getMonthlyRevenue();

    @Query("SELECT b FROM Bill b ORDER BY b.date DESC, b.billID DESC")
    List<Bill> findAllBillsOrderByDateDesc();

    @Query("SELECT b, p.patientId, pt.phoneNumber " +
            "FROM Bill b " +
            "LEFT JOIN Prescription p ON b.prescriptionId = p.id " +
            "LEFT JOIN Patient pt ON p.patientId = pt.id " +
            "ORDER BY b.date DESC, b.billID DESC")
    List<Object[]> findAllBillsWithPatientInfo();
}