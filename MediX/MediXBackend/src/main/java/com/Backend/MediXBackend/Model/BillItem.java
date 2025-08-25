package com.Backend.MediXBackend.Model;

import com.fasterxml.jackson.annotation.JsonBackReference;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

@Entity
@Table(name = "bill_items")
public class BillItem {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "bill_id", nullable = false)
    @JsonBackReference
    private Bill bill;

    @NotBlank(message = "Medicine name is mandatory")
    @Column(nullable = false)
    private String medicineName;

    @NotNull(message = "Quantity is mandatory")
    @Column(nullable = false)
    private Integer quantity;

    @NotNull(message = "Unit price is mandatory")
    @Column(nullable = false)
    private Double unitPrice;

    @NotNull(message = "Discount is mandatory")
    @Column(nullable = false)
    private Double discount = 0.0;

    @NotNull(message = "Total is mandatory")
    @Column(nullable = false)
    private Double total;

    // Constructors
    public BillItem() {}

    public BillItem(Bill bill, String medicineName, Integer quantity,
                    Double unitPrice, Double discount, Double total) {
        this.bill = bill;
        this.medicineName = medicineName;
        this.quantity = quantity;
        this.unitPrice = unitPrice;
        this.discount = discount;
        this.total = total;
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Bill getBill() { return bill; }
    public void setBill(Bill bill) { this.bill = bill; }

    public String getMedicineName() { return medicineName; }
    public void setMedicineName(String medicineName) { this.medicineName = medicineName; }

    public Integer getQuantity() { return quantity; }
    public void setQuantity(Integer quantity) { this.quantity = quantity; }

    public Double getUnitPrice() { return unitPrice; }
    public void setUnitPrice(Double unitPrice) { this.unitPrice = unitPrice; }

    public Double getDiscount() { return discount; }
    public void setDiscount(Double discount) { this.discount = discount; }

    public Double getTotal() { return total; }
    public void setTotal(Double total) { this.total = total; }
}