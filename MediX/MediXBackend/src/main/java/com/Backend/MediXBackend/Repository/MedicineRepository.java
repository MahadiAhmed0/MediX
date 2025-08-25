package com.Backend.MediXBackend.Repository;

import com.Backend.MediXBackend.Model.Medicine;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface MedicineRepository extends JpaRepository<Medicine, Long> {

    Optional<Medicine> findByMedicineName(String medicineName);

    List<Medicine> findByCompany(String company);

    List<Medicine> findByGenericName(String genericName);

    List<Medicine> findByExpiryDateBefore(java.time.LocalDate date);
}