package com.Backend.MediXBackend.Controller;

import com.Backend.MediXBackend.Model.Medicine;
import com.Backend.MediXBackend.Service.MedicineService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/medicines")
@CrossOrigin(origins = "*")
public class MedicineController {

    @Autowired
    private MedicineService medicineService;

    // Get all medicines
    @GetMapping
    public List<Medicine> getAllMedicines() {
        return medicineService.getAllMedicines();
    }

    // Get medicine by ID
    @GetMapping("/{id}")
    public ResponseEntity<Medicine> getMedicineById(@PathVariable Long id) {
        Optional<Medicine> medicine = medicineService.getMedicineById(id);
        return medicine.map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    // Get medicine by name
    @GetMapping("/name/{medicineName}")
    public ResponseEntity<Medicine> getMedicineByName(@PathVariable String medicineName) {
        Optional<Medicine> medicine = medicineService.getMedicineByName(medicineName);
        return medicine.map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    // Create new medicine
    @PostMapping
    public Medicine createMedicine(@Valid @RequestBody Medicine medicine) {
        return medicineService.createMedicine(medicine);
    }

    // Update medicine
    @PutMapping("/{id}")
    public ResponseEntity<Medicine> updateMedicine(@PathVariable Long id,
                                                   @Valid @RequestBody Medicine medicineDetails) {
        Medicine updatedMedicine = medicineService.updateMedicine(id, medicineDetails);
        if (updatedMedicine != null) {
            return ResponseEntity.ok(updatedMedicine);
        }
        return ResponseEntity.notFound().build();
    }

    // Delete medicine
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteMedicine(@PathVariable Long id) {
        boolean deleted = medicineService.deleteMedicine(id);
        if (deleted) {
            return ResponseEntity.ok().build();
        }
        return ResponseEntity.notFound().build();
    }

    // Get medicines by company
    @GetMapping("/company/{company}")
    public List<Medicine> getMedicinesByCompany(@PathVariable String company) {
        return medicineService.getMedicinesByCompany(company);
    }

    // Get medicines by generic name
    @GetMapping("/generic/{genericName}")
    public List<Medicine> getMedicinesByGenericName(@PathVariable String genericName) {
        return medicineService.getMedicinesByGenericName(genericName);
    }

    // Get expired medicines
    @GetMapping("/expired")
    public List<Medicine> getExpiredMedicines() {
        return medicineService.getExpiredMedicines();
    }
}