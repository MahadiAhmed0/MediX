package com.Backend.MediXBackend.Model;
import com.fasterxml.jackson.annotation.JsonManagedReference;
import jakarta.persistence.*;
import java.util.Set;

@Entity
public class Doctor {
    @Id
    private Long doctorId;

    @OneToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "user_id")
    @JsonManagedReference("doctor-user")  // Changed to include a reference name
    private User user;

    private Integer yearsOfExperience;
    private String availableDays;
    private String availableTimes;
    private String licenseNumber;

    @OneToMany(mappedBy = "doctor", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonManagedReference("doctor-qualifications")  // Added
    private Set<DoctorQualification> qualifications;

    @OneToMany(mappedBy = "doctor", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonManagedReference("doctor-specializations")  // Added
    private Set<DoctorSpecialization> specializations;;

    // Getters and setters
    public Long getDoctorId() {
        return doctorId;
    }

    public void setDoctorId(Long doctorId) {
        this.doctorId = doctorId;
    }

    public User getUser() {
        return user;
    }

    public void setUser(User user) {
        this.user = user;
    }

    public Integer getYearsOfExperience() {
        return yearsOfExperience;
    }

    public void setYearsOfExperience(Integer yearsOfExperience) {
        this.yearsOfExperience = yearsOfExperience;
    }

    public String getAvailableDays() {
        return availableDays;
    }

    public void setAvailableDays(String availableDays) {
        this.availableDays = availableDays;
    }

    public String getAvailableTimes() {
        return availableTimes;
    }

    public void setAvailableTimes(String availableTimes) {
        this.availableTimes = availableTimes;
    }

    public String getLicenseNumber() {
        return licenseNumber;
    }

    public void setLicenseNumber(String licenseNumber) {
        this.licenseNumber = licenseNumber;
    }

    public Set<DoctorQualification> getQualifications() {
        return qualifications;
    }

    public void setQualifications(Set<DoctorQualification> qualifications) {
        this.qualifications = qualifications;
    }

    public Set<DoctorSpecialization> getSpecializations() {
        return specializations;
    }

    public void setSpecializations(Set<DoctorSpecialization> specializations) {
        this.specializations = specializations;
    }

}