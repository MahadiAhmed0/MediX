package com.Backend.MediXBackend.Model;

import com.fasterxml.jackson.annotation.JsonManagedReference;
import jakarta.persistence.*;
import java.time.LocalDate;
import java.util.List;

@Entity
@Table(name = "prescriptions")
public class Prescription {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "patient_id", nullable = false)
    private Long patientId;

    @Column(name = "doctor_id", nullable = false)
    private Long doctorId;

    @Column(name = "appointment_id")
    private Long appointmentId;

    @Column(name = "prescription_date", nullable = false)
    private LocalDate prescriptionDate;

    @Column(name = "chief_complaint", columnDefinition = "TEXT")
    private String chiefComplaint; // cc

    @Column(name = "on_examination", columnDefinition = "TEXT")
    private String onExamination; // oe

    @Column(name = "investigations", columnDefinition = "TEXT")
    private String investigations; // invs

    @Column(name = "advice", columnDefinition = "TEXT")
    private String advice; // adv

    @OneToMany(mappedBy = "prescription", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    @JsonManagedReference("prescription-medicines")
    private List<PrescriptionMedicine> medicines;

    // Constructors
    public Prescription() {
    }

    public Prescription(Long patientId, Long doctorId, LocalDate prescriptionDate, 
                       String chiefComplaint, String onExamination, String investigations, String advice) {
        this.patientId = patientId;
        this.doctorId = doctorId;
        this.appointmentId = null; // Default to null, can be set later
        this.prescriptionDate = prescriptionDate;
        this.chiefComplaint = chiefComplaint;
        this.onExamination = onExamination;
        this.investigations = investigations;
        this.advice = advice;
    }

    // Additional constructor with appointmentId
    public Prescription(Long patientId, Long doctorId, Long appointmentId, LocalDate prescriptionDate, 
                       String chiefComplaint, String onExamination, String investigations, String advice) {
        this.patientId = patientId;
        this.doctorId = doctorId;
        this.appointmentId = appointmentId;
        this.prescriptionDate = prescriptionDate;
        this.chiefComplaint = chiefComplaint;
        this.onExamination = onExamination;
        this.investigations = investigations;
        this.advice = advice;
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
}
