package com.Backend.MediXBackend.Controller;

import com.Backend.MediXBackend.Model.Specialization;
import com.Backend.MediXBackend.Service.SpecializationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/specializations")
@CrossOrigin(origins = "http://localhost:3000")
public class SpecializationController {

    @Autowired
    private SpecializationService specializationService;

    // Create a new specialization
    @PostMapping
    public ResponseEntity<?> createSpecialization(@RequestBody Specialization specialization) {
        try {
            // Validate input
            if (specialization.getName() == null || specialization.getName().trim().isEmpty()) {
                return ResponseEntity.badRequest()
                        .body(Map.of("error", "Specialization name is required"));
            }

            // Check if specialization already exists
            if (specializationService.existsByName(specialization.getName())) {
                return ResponseEntity.status(HttpStatus.CONFLICT)
                        .body(Map.of("error", "Specialization with this name already exists"));
            }

            Specialization createdSpecialization = specializationService.createSpecialization(specialization);
            return ResponseEntity.status(HttpStatus.CREATED).body(createdSpecialization);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to create specialization", "details", e.getMessage()));
        }
    }

    // Get all specializations
    @GetMapping
    public ResponseEntity<?> getAllSpecializations() {
        try {
            List<Specialization> specializations = specializationService.getAllSpecializations();
            return ResponseEntity.ok(specializations);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to retrieve specializations", "details", e.getMessage()));
        }
    }

    // Get specialization by ID
    @GetMapping("/{id}")
    public ResponseEntity<?> getSpecializationById(@PathVariable Integer id) {
        try {
            Optional<Specialization> specialization = specializationService.getSpecializationById(id);
            if (specialization.isPresent()) {
                return ResponseEntity.ok(specialization.get());
            } else {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(Map.of("error", "Specialization not found", "id", id));
            }
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to retrieve specialization", "details", e.getMessage()));
        }
    }

    // Update specialization
    @PutMapping("/{id}")
    public ResponseEntity<?> updateSpecialization(@PathVariable Integer id, @RequestBody Specialization updatedSpecialization) {
        try {
            // Validate input
            if (updatedSpecialization.getName() == null || updatedSpecialization.getName().trim().isEmpty()) {
                return ResponseEntity.badRequest()
                        .body(Map.of("error", "Specialization name is required"));
            }

            // Check if another specialization with the same name exists (excluding current one)
            Optional<Specialization> existingSpecialization = specializationService.getSpecializationById(id);
            if (existingSpecialization.isPresent()) {
                String currentName = existingSpecialization.get().getName();
                String newName = updatedSpecialization.getName().trim();
                
                if (!currentName.equalsIgnoreCase(newName) && specializationService.existsByName(newName)) {
                    return ResponseEntity.status(HttpStatus.CONFLICT)
                            .body(Map.of("error", "Specialization with this name already exists"));
                }
            }

            Specialization specialization = specializationService.updateSpecialization(id, updatedSpecialization);
            return ResponseEntity.ok(specialization);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to update specialization", "details", e.getMessage()));
        }
    }

    // Delete specialization
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteSpecialization(@PathVariable Integer id) {
        try {
            specializationService.deleteSpecialization(id);
            return ResponseEntity.ok(Map.of("message", "Specialization deleted successfully", "id", id));
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to delete specialization", "details", e.getMessage()));
        }
    }

    // Check if specialization exists by name
    @GetMapping("/exists/{name}")
    public ResponseEntity<?> checkSpecializationExists(@PathVariable String name) {
        try {
            boolean exists = specializationService.existsByName(name);
            return ResponseEntity.ok(Map.of("exists", exists, "name", name));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to check specialization existence", "details", e.getMessage()));
        }
    }
}
