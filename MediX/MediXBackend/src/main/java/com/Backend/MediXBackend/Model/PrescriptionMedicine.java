package com.Backend.MediXBackend.Model;

import com.fasterxml.jackson.annotation.JsonBackReference;
import jakarta.persistence.*;

@Entity
@Table(name = "prescription_medicines")
public class PrescriptionMedicine {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "prescription_id", nullable = false)
    @JsonBackReference("prescription-medicines")
    private Prescription prescription;

    @Column(name = "medicine_name", nullable = false)
    private String medicineName;

    @Column(name = "morning_dose")
    private Integer morningDose;

    @Column(name = "afternoon_dose")
    private Integer afternoonDose;

    @Column(name = "evening_dose")
    private Integer eveningDose;


    @Column(name = "number_of_days")
    private Integer numberOfDays;

    @Column(name = "comment", columnDefinition = "TEXT")
    private String comment;

    // Constructors
    public PrescriptionMedicine() {
    }


    public PrescriptionMedicine(Prescription prescription, String medicineName,
                               Integer morningDose, Integer afternoonDose, Integer eveningDose, Integer numberOfDays, String comment) {
        this.prescription = prescription;
        this.medicineName = medicineName;
        this.morningDose = morningDose;
        this.afternoonDose = afternoonDose;
        this.eveningDose = eveningDose;
        this.numberOfDays = numberOfDays;
        this.comment = comment;
    }

    // Getters and setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Prescription getPrescription() {
        return prescription;
    }

    public void setPrescription(Prescription prescription) {
        this.prescription = prescription;
    }

    public String getMedicineName() {
        return medicineName;
    }

    public void setMedicineName(String medicineName) {
        this.medicineName = medicineName;
    }

    public Integer getMorningDose() {
        return morningDose;
    }

    public void setMorningDose(Integer morningDose) {
        this.morningDose = morningDose;
    }

    public Integer getAfternoonDose() {
        return afternoonDose;
    }

    public void setAfternoonDose(Integer afternoonDose) {
        this.afternoonDose = afternoonDose;
    }

    public Integer getEveningDose() {
        return eveningDose;
    }

    public void setEveningDose(Integer eveningDose) {
        this.eveningDose = eveningDose;
    }

    public Integer getNumberOfDays() {
        return numberOfDays;
    }

    public void setNumberOfDays(Integer numberOfDays) {
        this.numberOfDays = numberOfDays;
    }

    public String getComment() {
        return comment;
    }

    public void setComment(String comment) {
        this.comment = comment;
    }
}
