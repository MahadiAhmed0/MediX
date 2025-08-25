package com.Backend.MediXBackend.Model;

import java.time.LocalDate;

public class AppointmentWithDetails {
    private Long id;
    private Long patientId;
    private Long doctorId;
    private LocalDate appointmentDate;
    private String status;
    
    // Patient details
    private String patientName;
    private String patientPhone;
    private Integer age;
    private String gender;
    private Double weight;
    private String pressure;
    
    // Doctor details
    private String doctorName;

    // Default constructor
    public AppointmentWithDetails() {}

    // Constructor with all fields
    public AppointmentWithDetails(Long id, Long patientId, Long doctorId, LocalDate appointmentDate, String status,
                                String patientName, String patientPhone, Integer age, String gender, 
                                Double weight, String pressure, String doctorName) {
        this.id = id;
        this.patientId = patientId;
        this.doctorId = doctorId;
        this.appointmentDate = appointmentDate;
        this.status = status;
        this.patientName = patientName;
        this.patientPhone = patientPhone;
        this.age = age;
        this.gender = gender;
        this.weight = weight;
        this.pressure = pressure;
        this.doctorName = doctorName;
    }

    // Getters and setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getPatientId() {
        return patientId;
    }

    public void setPatientId(Long patientId) {
        this.patientId = patientId;
    }

    public Long getDoctorId() {
        return doctorId;
    }

    public void setDoctorId(Long doctorId) {
        this.doctorId = doctorId;
    }

    public LocalDate getAppointmentDate() {
        return appointmentDate;
    }

    public void setAppointmentDate(LocalDate appointmentDate) {
        this.appointmentDate = appointmentDate;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public String getPatientName() {
        return patientName;
    }

    public void setPatientName(String patientName) {
        this.patientName = patientName;
    }

    public String getPatientPhone() {
        return patientPhone;
    }

    public void setPatientPhone(String patientPhone) {
        this.patientPhone = patientPhone;
    }

    public Integer getAge() {
        return age;
    }

    public void setAge(Integer age) {
        this.age = age;
    }

    public String getGender() {
        return gender;
    }

    public void setGender(String gender) {
        this.gender = gender;
    }

    public Double getWeight() {
        return weight;
    }

    public void setWeight(Double weight) {
        this.weight = weight;
    }

    public String getPressure() {
        return pressure;
    }

    public void setPressure(String pressure) {
        this.pressure = pressure;
    }

    public String getDoctorName() {
        return doctorName;
    }

    public void setDoctorName(String doctorName) {
        this.doctorName = doctorName;
    }
} 