package com.Backend.MediXBackend.Model;

import jakarta.persistence.Embeddable;
import java.io.Serializable;
import java.util.Objects;

@Embeddable
public class DoctorSpecializationId implements Serializable {
    private Long doctorId;
    private Integer specializationId;

    // Add default constructor
    public DoctorSpecializationId() {
    }

    // Add parameterized constructor
    public DoctorSpecializationId(Long doctorId, Integer specializationId) {
        this.doctorId = doctorId;
        this.specializationId = specializationId;
    }

    // Getters and setters
    public Long getDoctorId() {
        return doctorId;
    }

    public void setDoctorId(Long doctorId) {
        this.doctorId = doctorId;
    }

    public Integer getSpecializationId() {
        return specializationId;
    }

    public void setSpecializationId(Integer specializationId) {
        this.specializationId = specializationId;
    }

    // Proper equals and hashCode implementations
    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof DoctorSpecializationId)) return false;
        DoctorSpecializationId that = (DoctorSpecializationId) o;
        return Objects.equals(doctorId, that.doctorId) &&
                Objects.equals(specializationId, that.specializationId);
    }

    @Override
    public int hashCode() {
        return Objects.hash(doctorId, specializationId);
    }
}