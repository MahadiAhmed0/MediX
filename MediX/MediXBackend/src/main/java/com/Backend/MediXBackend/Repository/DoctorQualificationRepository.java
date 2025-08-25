// DoctorQualificationRepository.java
package com.Backend.MediXBackend.Repository;

import com.Backend.MediXBackend.Model.DoctorQualification;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.transaction.annotation.Transactional;

public interface DoctorQualificationRepository extends JpaRepository<DoctorQualification, Long> {
    
    @Modifying
    @Transactional
    @Query("DELETE FROM DoctorQualification dq WHERE dq.doctor.doctorId = :doctorId")
    void deleteByDoctorDoctorId(@Param("doctorId") Long doctorId);
}