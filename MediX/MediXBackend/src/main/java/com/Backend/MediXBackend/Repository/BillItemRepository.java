package com.Backend.MediXBackend.Repository;

import com.Backend.MediXBackend.Model.BillItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface BillItemRepository extends JpaRepository<BillItem, Long> {
    List<BillItem> findByBill_BillID(Long billId);
}