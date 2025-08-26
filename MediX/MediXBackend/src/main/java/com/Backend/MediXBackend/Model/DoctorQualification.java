// DoctorQualification.java
package com.Backend.MediXBackend.Model;

import com.fasterxml.jackson.annotation.JsonBackReference;
import jakarta.persistence.*;

@Entity
@Table(name = "doctor_qualifications")
public class DoctorQualification {
    @EmbeddedId
    private DoctorQualificationId id;

    @ManyToOne
    @MapsId("doctorId")
    @JoinColumn(name = "doctor_id")
    @JsonBackReference("doctor-qualifications")  // Added
    private Doctor doctor;

    @ManyToOne
    @MapsId("qualificationId")
    @JoinColumn(name = "qualification_id")
    private Qualification qualification;

    // Getters and setters
    public DoctorQualificationId getId() {
        return id;
    }

    public void setId(DoctorQualificationId id) {
        this.id = id;
    }

    public Doctor getDoctor() {
        return doctor;
    }

    public void setDoctor(Doctor doctor) {
        this.doctor = doctor;
    }

    public Qualification getQualification() {
        return qualification;
    }

    public void setQualification(Qualification qualification) {
        this.qualification = qualification;
    }
}