package com.Backend.MediXBackend.Controller;

import com.Backend.MediXBackend.Model.Doctor;
import com.Backend.MediXBackend.Model.User;
import com.Backend.MediXBackend.Repository.DoctorRepository;
import com.Backend.MediXBackend.Repository.UserRepository;
import com.Backend.MediXBackend.Service.DoctorService;
import com.Backend.MediXBackend.Utils.IdGeneratorService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "http://localhost:3000")
public class DoctorController {

    @Autowired
    private DoctorService doctorService;

    @PostMapping("/doctors")
    public ResponseEntity<?> createDoctorWithUser(@RequestBody Map<String, Object> request) {
        try {
            ObjectMapper mapper = new ObjectMapper();

            User user = mapper.convertValue(request.get("user"), User.class);
            Doctor doctor = mapper.convertValue(request.get("doctor"), Doctor.class);

            Doctor savedDoctor = doctorService.createDoctorWithUser(user, doctor);

            return ResponseEntity.ok(savedDoctor);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to create doctor", "details", e.getMessage()));
        }
    }

    @GetMapping("/doctors")
    public ResponseEntity<List<Doctor>> getAllDoctors() {
        List<Doctor> doctors = doctorService.getAllDoctors();
        return ResponseEntity.ok(doctors);
    }
    @GetMapping("/doctors/{id}")
    public ResponseEntity<?> getDoctorById(@PathVariable Long id) {
        Optional<Doctor> doctorOpt = doctorService.getDoctorById(id);
        return doctorOpt.map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body((Doctor) Map.of("error", "Doctor not found", "doctorId", id)));
    }

    @GetMapping("/doctors/email/{email}")
    public ResponseEntity<?> getDoctorByEmail(@PathVariable String email) {
        Optional<Doctor> doctorOpt = doctorService.getDoctorByEmail(email);
        return doctorOpt.map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body((Doctor) Map.of("error", "Doctor not found", "email", email)));
    }

}
