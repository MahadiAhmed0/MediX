package com.Backend.MediXBackend.Model;

import java.time.LocalDate;
import java.util.List;

public class PrescriptionWithPatientDetails {
    // Prescription fields
    private Long id;
    private Long patientId;
    private Long doctorId;
    private Long appointmentId;
    private LocalDate prescriptionDate;
    private String chiefComplaint;
    private String onExamination;
    private String investigations;
    private String advice;
    private List<PrescriptionMedicine> medicines;
    
    // Additional patient fields
    private String patientName;
    private String patientPhoneNumber;
    
    // Constructors
    public PrescriptionWithPatientDetails() {
    }
    
    public PrescriptionWithPatientDetails(Prescription prescription, Patient patient) {
        this.id = prescription.getId();
        this.patientId = prescription.getPatientId();
        this.doctorId = prescription.getDoctorId();
        this.appointmentId = prescription.getAppointmentId();
        this.prescriptionDate = prescription.getPrescriptionDate();
        this.chiefComplaint = prescription.getChiefComplaint();
        this.onExamination = prescription.getOnExamination();
        this.investigations = prescription.getInvestigations();
        this.advice = prescription.getAdvice();
        this.medicines = prescription.getMedicines();
        
        // Patient details
        this.patientName = patient.getName();
        this.patientPhoneNumber = patient.getPhoneNumber();
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

    public Long getAppointmentId() {
        return appointmentId;
    }

    public void setAppointmentId(Long appointmentId) {
        this.appointmentId = appointmentId;
    }

    public LocalDate getPrescriptionDate() {
        return prescriptionDate;
    }

    public void setPrescriptionDate(LocalDate prescriptionDate) {
        this.prescriptionDate = prescriptionDate;
    }

    public String getChiefComplaint() {
        return chiefComplaint;
    }

    public void setChiefComplaint(String chiefComplaint) {
        this.chiefComplaint = chiefComplaint;
    }

    public String getOnExamination() {
        return onExamination;
    }

    public void setOnExamination(String onExamination) {
        this.onExamination = onExamination;
    }

    public String getInvestigations() {
        return investigations;
    }

    public void setInvestigations(String investigations) {
        this.investigations = investigations;
    }

    public String getAdvice() {
        return advice;
    }

    public void setAdvice(String advice) {
        this.advice = advice;
    }

    public List<PrescriptionMedicine> getMedicines() {
        return medicines;
    }

    public void setMedicines(List<PrescriptionMedicine> medicines) {
        this.medicines = medicines;
    }

    public String getPatientName() {
        return patientName;
    }

    public void setPatientName(String patientName) {
        this.patientName = patientName;
    }

    public String getPatientPhoneNumber() {
        return patientPhoneNumber;
    }

    public void setPatientPhoneNumber(String patientPhoneNumber) {
        this.patientPhoneNumber = patientPhoneNumber;
    }
}
