package com.Backend.MediXBackend.Model;

import jakarta.persistence.Embeddable;
import java.io.Serializable;
import java.util.Objects;

@Embeddable
public class DoctorQualificationId implements Serializable {
    private Long doctorId;
    private Integer qualificationId;

    // Add default constructor
    public DoctorQualificationId() {
    }

    // Add parameterized constructor
    public DoctorQualificationId(Long doctorId, Integer qualificationId) {
        this.doctorId = doctorId;
        this.qualificationId = qualificationId;
    }

    // Getters and setters
    public Long getDoctorId() {
        return doctorId;
    }

    public void setDoctorId(Long doctorId) {
        this.doctorId = doctorId;
    }

    public Integer getQualificationId() {
        return qualificationId;
    }

    public void setQualificationId(Integer qualificationId) {
        this.qualificationId = qualificationId;
    }

    // Proper equals and hashCode implementations
    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof DoctorQualificationId)) return false;
        DoctorQualificationId that = (DoctorQualificationId) o;
        return Objects.equals(doctorId, that.doctorId) &&
                Objects.equals(qualificationId, that.qualificationId);
    }

    @Override
    public int hashCode() {
        return Objects.hash(doctorId, qualificationId);
    }
}