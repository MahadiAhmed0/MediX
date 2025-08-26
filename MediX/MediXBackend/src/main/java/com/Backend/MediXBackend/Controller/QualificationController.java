package com.Backend.MediXBackend.Controller;

import com.Backend.MediXBackend.Model.Qualification;
import com.Backend.MediXBackend.Service.QualificationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/qualifications")
@CrossOrigin(origins = "http://localhost:3000")
public class QualificationController {

    @Autowired
    private QualificationService qualificationService;

    // Create a new qualification
    @PostMapping
    public ResponseEntity<?> createQualification(@RequestBody Qualification qualification) {
        try {
            // Validate input
            if (qualification.getName() == null || qualification.getName().trim().isEmpty()) {
                return ResponseEntity.badRequest()
                        .body(Map.of("error", "Qualification name is required"));
            }

            // Check if qualification already exists
            if (qualificationService.existsByName(qualification.getName())) {
                return ResponseEntity.status(HttpStatus.CONFLICT)
                        .body(Map.of("error", "Qualification with this name already exists"));
            }

            Qualification createdQualification = qualificationService.createQualification(qualification);
            return ResponseEntity.status(HttpStatus.CREATED).body(createdQualification);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to create qualification", "details", e.getMessage()));
        }
    }

    // Get all qualifications
    @GetMapping
    public ResponseEntity<?> getAllQualifications() {
        try {
            List<Qualification> qualifications = qualificationService.getAllQualifications();
            return ResponseEntity.ok(qualifications);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to retrieve qualifications", "details", e.getMessage()));
        }
    }

    // Get qualification by ID
    @GetMapping("/{id}")
    public ResponseEntity<?> getQualificationById(@PathVariable Integer id) {
        try {
            Optional<Qualification> qualification = qualificationService.getQualificationById(id);
            if (qualification.isPresent()) {
                return ResponseEntity.ok(qualification.get());
            } else {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(Map.of("error", "Qualification not found", "id", id));
            }
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to retrieve qualification", "details", e.getMessage()));
        }
    }

    // Update qualification
    @PutMapping("/{id}")
    public ResponseEntity<?> updateQualification(@PathVariable Integer id, @RequestBody Qualification updatedQualification) {
        try {
            // Validate input
            if (updatedQualification.getName() == null || updatedQualification.getName().trim().isEmpty()) {
                return ResponseEntity.badRequest()
                        .body(Map.of("error", "Qualification name is required"));
            }

            // Check if another qualification with the same name exists (excluding current one)
            Optional<Qualification> existingQualification = qualificationService.getQualificationById(id);
            if (existingQualification.isPresent()) {
                String currentName = existingQualification.get().getName();
                String newName = updatedQualification.getName().trim();
                
                if (!currentName.equalsIgnoreCase(newName) && qualificationService.existsByName(newName)) {
                    return ResponseEntity.status(HttpStatus.CONFLICT)
                            .body(Map.of("error", "Qualification with this name already exists"));
                }
            }

            Qualification qualification = qualificationService.updateQualification(id, updatedQualification);
            return ResponseEntity.ok(qualification);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to update qualification", "details", e.getMessage()));
        }
    }

    // Delete qualification
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteQualification(@PathVariable Integer id) {
        try {
            qualificationService.deleteQualification(id);
            return ResponseEntity.ok(Map.of("message", "Qualification deleted successfully", "id", id));
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to delete qualification", "details", e.getMessage()));
        }
    }

    // Check if qualification exists by name
    @GetMapping("/exists/{name}")
    public ResponseEntity<?> checkQualificationExists(@PathVariable String name) {
        try {
            boolean exists = qualificationService.existsByName(name);
            return ResponseEntity.ok(Map.of("exists", exists, "name", name));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to check qualification existence", "details", e.getMessage()));
        }
    }
}
