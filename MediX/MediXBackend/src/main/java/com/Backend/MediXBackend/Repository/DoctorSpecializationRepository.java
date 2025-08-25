// DoctorSpecializationRepository.java
package com.Backend.MediXBackend.Repository;

import com.Backend.MediXBackend.Model.DoctorSpecialization;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.transaction.annotation.Transactional;

public interface DoctorSpecializationRepository extends JpaRepository<DoctorSpecialization, Long> {
    
    @Modifying
    @Transactional
    @Query("DELETE FROM DoctorSpecialization ds WHERE ds.doctor.doctorId = :doctorId")
    void deleteByDoctorDoctorId(@Param("doctorId") Long doctorId);
}