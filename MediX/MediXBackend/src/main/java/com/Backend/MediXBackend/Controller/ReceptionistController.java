package com.Backend.MediXBackend.Controller;

import com.Backend.MediXBackend.Model.User;
import com.Backend.MediXBackend.Service.ReceptionistService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/receptionists")
@CrossOrigin(origins = "http://localhost:3000")
public class ReceptionistController {

    @Autowired
    private ReceptionistService receptionistService;

    @PostMapping
    public ResponseEntity<?> createReceptionist(@RequestBody User user) {
        try {
            User createdReceptionist = receptionistService.createReceptionist(user);
            return ResponseEntity.ok(createdReceptionist);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to create receptionist", "details", e.getMessage()));
        }
    }

    // Update ReceptionistController.java with these new methods
    @GetMapping("/{id}")
    public ResponseEntity<?> getReceptionistById(@PathVariable Long id) {
        Optional<User> receptionist = receptionistService.getReceptionistById(id);
        return receptionist.map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body((User) Map.of("error", "Receptionist not found", "receptionistId", id)));
    }


    @PostMapping("/by-email")
    public ResponseEntity<?> getReceptionistByEmail(@RequestBody Map<String, String> credentials) {
        try {
            String email = credentials.get("email");
            String password = credentials.get("password");

            if (email == null || password == null) {
                return ResponseEntity.badRequest().body(Map.of(
                        "success", false,
                        "message", "Email and password are required"
                ));
            }

            Optional<User> receptionist = receptionistService.getReceptionistByEmailAndPassword(email, password);
            return receptionist.map(user -> ResponseEntity.ok(Map.of(
                            "success", true,
                            "message", "Receptionist found",
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
    public ResponseEntity<?> updateReceptionist(@PathVariable Long id, @RequestBody User updatedUser) {
        try {
            User updatedReceptionist = receptionistService.updateReceptionist(id, updatedUser);
            return ResponseEntity.ok(updatedReceptionist);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to update receptionist", "details", e.getMessage()));
        }
    }
}