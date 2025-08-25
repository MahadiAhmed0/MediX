// DoctorSpecialization.java
package com.Backend.MediXBackend.Model;

import com.fasterxml.jackson.annotation.JsonBackReference;
import jakarta.persistence.*;

@Entity
@Table(name = "doctor_specializations")
public class DoctorSpecialization {
    @EmbeddedId
    private DoctorSpecializationId id;

    @ManyToOne
    @MapsId("doctorId")
    @JoinColumn(name = "doctor_id")
    @JsonBackReference("doctor-specializations")  // Added
    private Doctor doctor;
    @ManyToOne
    @MapsId("specializationId")
    @JoinColumn(name = "specialization_id")
    private Specialization specialization;

    // Getters and setters
    public DoctorSpecializationId getId() {
        return id;
    }

    public void setId(DoctorSpecializationId id) {
        this.id = id;
    }

    public Doctor getDoctor() {
        return doctor;
    }

    public void setDoctor(Doctor doctor) {
        this.doctor = doctor;
    }

    public Specialization getSpecialization() {
        return specialization;
    }

    public void setSpecialization(Specialization specialization) {
        this.specialization = specialization;
    }
}