package com.Backend.MediXBackend.Model;


import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import java.time.LocalDate;

@Entity
@Table(name = "medicines", uniqueConstraints = {
        @UniqueConstraint(columnNames = "medicineName")
})
public class Medicine {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank(message = "Company is mandatory")
    @Column(nullable = false)
    private String company;

    @NotBlank(message = "Medicine name is mandatory")
    @Column(nullable = false, unique = true)
    private String medicineName;

    @NotBlank(message = "Generic name is mandatory")
    @Column(nullable = false)
    private String genericName;

    @Min(value = 0, message = "Quantity cannot be negative")
    @Column(nullable = false)
    private Integer quantity;

    @DecimalMin(value = "0.0", message = "Unit cost cannot be negative")
    @Column(nullable = false)
    private Double unitCost;

    @DecimalMin(value = "0.0", message = "Unit price cannot be negative")
    @Column(nullable = false)
    private Double unitPrice;

    @Future(message = "Expiry date must be in the future")
    @Column(nullable = false)
    private LocalDate expiryDate;

    // Constructors
    public Medicine() {}

    public Medicine(String company, String medicineName, String genericName,
                    Integer quantity, Double unitCost, Double unitPrice, LocalDate expiryDate) {
        this.company = company;
        this.medicineName = medicineName;
        this.genericName = genericName;
        this.quantity = quantity;
        this.unitCost = unitCost;
        this.unitPrice = unitPrice;
        this.expiryDate = expiryDate;
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getCompany() { return company; }
    public void setCompany(String company) { this.company = company; }

    public String getMedicineName() { return medicineName; }
    public void setMedicineName(String medicineName) { this.medicineName = medicineName; }

    public String getGenericName() { return genericName; }
    public void setGenericName(String genericName) { this.genericName = genericName; }

    public Integer getQuantity() { return quantity; }
    public void setQuantity(Integer quantity) { this.quantity = quantity; }

    public Double getUnitCost() { return unitCost; }
    public void setUnitCost(Double unitCost) { this.unitCost = unitCost; }

    public Double getUnitPrice() { return unitPrice; }
    public void setUnitPrice(Double unitPrice) { this.unitPrice = unitPrice; }

    public LocalDate getExpiryDate() { return expiryDate; }
    public void setExpiryDate(LocalDate expiryDate) { this.expiryDate = expiryDate; }
}