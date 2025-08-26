package com.Backend.MediXBackend.DTO;

import java.time.LocalDate;

public class BillHistoryResponse {
    private Long billId;
    private LocalDate date;
    private Long prescriptionId;
    private Long patientId;
    private String patientPhone;
    private Boolean sellType;
    private Double total;

    public BillHistoryResponse(Long billId, LocalDate date, Long prescriptionId,
                               Long patientId, String patientPhone, Boolean sellType, Double total) {
        this.billId = billId;
        this.date = date;
        this.prescriptionId = prescriptionId;
        this.patientId = patientId;
        this.patientPhone = patientPhone;
        this.sellType = sellType;
        this.total = total;
    }

    // Getters and setters
    public Long getBillId() { return billId; }
    public void setBillId(Long billId) { this.billId = billId; }

    public LocalDate getDate() { return date; }
    public void setDate(LocalDate date) { this.date = date; }

    public Long getPrescriptionId() { return prescriptionId; }
    public void setPrescriptionId(Long prescriptionId) { this.prescriptionId = prescriptionId; }

    public Long getPatientId() { return patientId; }
    public void setPatientId(Long patientId) { this.patientId = patientId; }

    public String getPatientPhone() { return patientPhone; }
    public void setPatientPhone(String patientPhone) { this.patientPhone = patientPhone; }

    public Boolean getSellType() { return sellType; }
    public void setSellType(Boolean sellType) { this.sellType = sellType; }

    public Double getTotal() { return total; }
    public void setTotal(Double total) { this.total = total; }
}