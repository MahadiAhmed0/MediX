package com.Backend.MediXBackend.Repository;

import com.Backend.MediXBackend.Model.Doctor;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.Optional;

public interface DoctorRepository extends JpaRepository<Doctor, Long> {
    @Query("SELECT MAX(d.doctorId) FROM Doctor d")
    Optional<Long> findMaxDoctorId();

    @Query("SELECT d FROM Doctor d JOIN d.user u WHERE u.email = :email")
    Optional<Doctor> findByUserEmail(String email);
}