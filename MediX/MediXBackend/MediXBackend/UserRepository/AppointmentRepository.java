package com.Backend.MediXBackend.Repository;

import com.Backend.MediXBackend.Model.Appointment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.Optional;

public interface AppointmentRepository extends JpaRepository<Appointment, Long> {
    @Query("SELECT MAX(a.id) FROM Appointment a")
    Optional<Long> findMaxAppointmentId();
}