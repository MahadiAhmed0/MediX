package com.Backend.MediXBackend.Controller;

import com.Backend.MediXBackend.Model.Patient;
import com.Backend.MediXBackend.Service.PatientService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/patients")
@CrossOrigin(origins = "http://localhost:3000")
public class PatientController {

    @Autowired
    private PatientService patientService;

    @PostMapping("/basic")
    public ResponseEntity<?> createBasicPatient(@RequestBody Map<String, String> request) {
        try {
            String name = request.get("name");
            String phoneNumber = request.get("phoneNumber");

            if (name == null || phoneNumber == null) {
                return ResponseEntity.badRequest().body(Map.of("error", "Name and phone number are required"));
            }

            Patient patient = patientService.createBasicPatient(name, phoneNumber);
            return ResponseEntity.ok(patient);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to create patient", "details", e.getMessage()));
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updatePatient(@PathVariable Long id, @RequestBody Patient updatedPatient) {
        try {
            Patient patient = patientService.updatePatientDetails(id, updatedPatient);
            return ResponseEntity.ok(patient);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to update patient", "details", e.getMessage()));
        }
    }

    @GetMapping
    public ResponseEntity<List<Patient>> getAllPatients() {
        List<Patient> patients = patientService.getAllPatients();
        return ResponseEntity.ok(patients);
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getPatientById(@PathVariable Long id) {
        Optional<Patient> patient = patientService.getPatientById(id);
        return patient.map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body((Patient) Map.of("error", "Patient not found", "patientId", id)));
    }

    // PatientController.java
    @GetMapping("/by-phone")
    public ResponseEntity<?> getPatientByPhoneNumber(@RequestParam String phoneNumber) {
        Optional<Patient> patient = patientService.getPatientByPhoneNumber(phoneNumber);
        if (patient.isPresent()) {
            return ResponseEntity.ok(patient.get());
        } else {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of(
                            "success", false,
                            "message", "Patient not found",
                            "data", Map.of("phoneNumber", phoneNumber)
                    ));
        }
    }
    // PatientController.java
    @PostMapping("/find-by-phone")
    public ResponseEntity<?> findPatientByPhone(@RequestBody Map<String, String> request) {
        try {
            String phoneNumber = request.get("phoneNumber");
            if (phoneNumber == null || phoneNumber.isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of(
                        "success", false,
                        "message", "Phone number is required",
                        "data", null
                ));
            }

            Optional<Patient> patient = patientService.getPatientByPhoneNumber(phoneNumber);
            return patient.map(p -> ResponseEntity.ok(Map.of(
                            "success", true,
                            "message", "Patient found",
                            "data", p
                    )))
                    .orElseGet(() -> ResponseEntity.status(HttpStatus.NOT_FOUND)
                            .body(Map.of(
                                    "success", false,
                                    "message", "Patient not found",
                                    "data", Map.of("phoneNumber", phoneNumber)
                            )));
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(Map.of(
                    "success", false,
                    "message", "Server error",
                    "data", e.getMessage()
            ));
        }
    }
}