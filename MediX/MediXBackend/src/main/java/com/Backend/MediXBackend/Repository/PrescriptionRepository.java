package com.Backend.MediXBackend.Repository;

import com.Backend.MediXBackend.Model.Prescription;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PrescriptionRepository extends JpaRepository<Prescription, Long> {
    
    // Find prescriptions by patient ID
    List<Prescription> findByPatientIdOrderByPrescriptionDateDesc(Long patientId);
    
    // Find prescriptions by doctor ID
    List<Prescription> findByDoctorIdOrderByPrescriptionDateDesc(Long doctorId);
    
    // Find prescriptions by patient ID and doctor ID
    List<Prescription> findByPatientIdAndDoctorIdOrderByPrescriptionDateDesc(Long patientId, Long doctorId);
    
    // Find prescriptions by appointment ID
    List<Prescription> findByAppointmentIdOrderByPrescriptionDateDesc(Long appointmentId);
    
    // Custom query to get prescription with medicines
    @Query("SELECT p FROM Prescription p LEFT JOIN FETCH p.medicines WHERE p.id = :prescriptionId")
    Prescription findPrescriptionWithMedicines(@Param("prescriptionId") Long prescriptionId);
}
