package com.Backend.MediXBackend.Model;

import com.fasterxml.jackson.annotation.JsonManagedReference;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDate;
import java.util.List;

@Entity
@Table(name = "bills")
public class Bill {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long billID;

    @NotBlank(message = "Customer name is mandatory")
    @Column(nullable = false)
    private String customerName;

    @NotBlank(message = "Phone number is mandatory")
    @Column(nullable = false)
    private String phoneNumber;

    @NotNull(message = "Date is mandatory")
    @Column(nullable = false)
    private LocalDate date;

    @Column
    private Long prescriptionId;

    @NotNull(message = "Sub total is mandatory")
    @Column(nullable = false)
    private Double subTotal;

    @NotNull(message = "Tax is mandatory")
    @Column(nullable = false)
    private Double tax;

    @NotNull(message = "Total is mandatory")
    @Column(nullable = false)
    private Double total;

    @Column(nullable = false, columnDefinition = "boolean default false")
    private Boolean sellType = false;

    @OneToMany(mappedBy = "bill", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @JsonManagedReference
    private List<BillItem> billItems;

    // Constructors
    public Bill() {}

    public Bill(String customerName, String phoneNumber, LocalDate date, Long prescriptionId,
                Double subTotal, Double tax, Double total, Boolean sellType) {
        this.customerName = customerName;
        this.phoneNumber = phoneNumber;
        this.date = date;
        this.prescriptionId = prescriptionId;
        this.subTotal = subTotal;
        this.tax = tax;
        this.total = total;
        this.sellType = sellType;
    }

    // Getters and Setters
    public Long getBillID() { return billID; }
    public void setBillID(Long billID) { this.billID = billID; }

    public String getCustomerName() { return customerName; }
    public void setCustomerName(String customerName) { this.customerName = customerName; }

    public String getPhoneNumber() { return phoneNumber; }
    public void setPhoneNumber(String phoneNumber) { this.phoneNumber = phoneNumber; }

    public LocalDate getDate() { return date; }
    public void setDate(LocalDate date) { this.date = date; }

    public Long getPrescriptionId() { return prescriptionId; }
    public void setPrescriptionId(Long prescriptionId) { this.prescriptionId = prescriptionId; }

    public Double getSubTotal() { return subTotal; }
    public void setSubTotal(Double subTotal) { this.subTotal = subTotal; }

    public Double getTax() { return tax; }
    public void setTax(Double tax) { this.tax = tax; }

    public Double getTotal() { return total; }
    public void setTotal(Double total) { this.total = total; }

    public Boolean getSellType() { return sellType; }
    public void setSellType(Boolean sellType) { this.sellType = sellType; }

    public List<BillItem> getBillItems() { return billItems; }
    public void setBillItems(List<BillItem> billItems) { this.billItems = billItems; }
}