package com.Backend.MediXBackend.Controller;

import com.Backend.MediXBackend.Model.User;
import com.Backend.MediXBackend.Service.PharmacistService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/pharmacists")
@CrossOrigin(origins = "http://localhost:3000")
public class PharmacistController {

    @Autowired
    private PharmacistService pharmacistService;

    @PostMapping
    public ResponseEntity<?> createPharmacist(@RequestBody User user) {
        try {
            User createdPharmacist = pharmacistService.createPharmacist(user);
            return ResponseEntity.ok(createdPharmacist);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to create pharmacist", "details", e.getMessage()));
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getPharmacistById(@PathVariable Long id) {
        Optional<User> pharmacist = pharmacistService.getPharmacistById(id);
        return pharmacist.map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body((User) Map.of("error", "Pharmacist not found", "pharmacistId", id)));
    }

    @PostMapping("/by-email")
    public ResponseEntity<?> getPharmacistByEmail(@RequestBody Map<String, String> credentials) {
        try {
            String email = credentials.get("email");
            String password = credentials.get("password");

            if (email == null || password == null) {
                return ResponseEntity.badRequest().body(Map.of(
                        "success", false,
                        "message", "Email and password are required"
                ));
            }

            Optional<User> pharmacist = pharmacistService.getPharmacistByEmailAndPassword(email, password);
            return pharmacist.map(user -> ResponseEntity.ok(Map.of(
                            "success", true,
                            "message", "Pharmacist found",
                            "data", user
                    )))
                    .orElseGet(() -> ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                            .body(Map.of(
                                    "success", false,
                                    "message", "Invalid email or password"
                            )));
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(Map.of(
                    "success", false,
                    "message", "Server error",
                    "error", e.getMessage()
            ));
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updatePharmacist(@PathVariable Long id, @RequestBody User updatedUser) {
        try {
            User updatedPharmacist = pharmacistService.updatePharmacist(id, updatedUser);
            return ResponseEntity.ok(updatedPharmacist);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to update pharmacist", "details", e.getMessage()));
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deletePharmacist(@PathVariable Long id) {
        try {
            boolean deleted = pharmacistService.deletePharmacist(id);
            if (deleted) {
                return ResponseEntity.ok(Map.of(
                        "success", true,
                        "message", "Pharmacist deleted successfully"
                ));
            } else {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(Map.of(
                                "success", false,
                                "message", "Pharmacist not found"
                        ));
            }
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of(
                            "success", false,
                            "message", "Failed to delete pharmacist",
                            "error", e.getMessage()
                    ));
        }
    }
}