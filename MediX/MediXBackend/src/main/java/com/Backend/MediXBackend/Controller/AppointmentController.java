package com.Backend.MediXBackend.Controller;

import com.Backend.MediXBackend.Model.Appointment;
import com.Backend.MediXBackend.Model.AppointmentWithDetails;
import com.Backend.MediXBackend.Service.AppointmentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/appointments")
@CrossOrigin(origins = "http://localhost:3000")
public class AppointmentController {

    @Autowired
    private AppointmentService appointmentService;

    @PostMapping
    public ResponseEntity<?> createAppointment(@RequestBody Map<String, Object> request) {
        try {
            Long patientId = Long.parseLong(request.get("patientId").toString());
            Long doctorId = Long.parseLong(request.get("doctorId").toString());

            // Parse as LocalDate (yyyy-MM-dd) instead of LocalDateTime
            LocalDate appointmentDate = LocalDate.parse((String) request.get("appointmentDate"));

            Appointment appointment = appointmentService.createAppointment(
                    patientId,
                    doctorId,
                    appointmentDate  // Now accepts LocalDate
            );

            return ResponseEntity.ok(appointment);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to create appointment", "details", e.getMessage()));
        }
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<?> updateAppointmentStatus(
            @PathVariable Long id,
            @RequestBody Map<String, String> request) {
        try {
            String status = request.get("status");
            Appointment appointment = appointmentService.updateAppointmentStatus(id, status);
            return ResponseEntity.ok(appointment);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to update appointment status", "details", e.getMessage()));
        }
    }

    @GetMapping
    public ResponseEntity<List<Appointment>> getAllAppointments() {
        List<Appointment> appointments = appointmentService.getAllAppointments();
        return ResponseEntity.ok(appointments);
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getAppointmentById(@PathVariable Long id) {
        Optional<Appointment> appointment = appointmentService.getAppointmentById(id);
        return appointment.map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body((Appointment) Map.of("error", "Appointment not found", "appointmentId", id)));
    }

    @GetMapping("/with-details")
    public ResponseEntity<List<AppointmentWithDetails>> getAppointmentsWithDetails() {
        List<AppointmentWithDetails> appointments = appointmentService.getAppointmentsWithDetails();
        return ResponseEntity.ok(appointments);
    }

    @GetMapping("/patient/{patientId}")
    public ResponseEntity<List<Appointment>> getAppointmentsByPatientId(@PathVariable Long patientId) {
        List<Appointment> appointments = appointmentService.getAppointmentsByPatientId(patientId);
        return ResponseEntity.ok(appointments);
    }
}