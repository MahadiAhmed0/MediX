package com.Backend.MediXBackend.Controller;

import com.Backend.MediXBackend.Model.Prescription;
import com.Backend.MediXBackend.Model.PrescriptionMedicine;
import com.Backend.MediXBackend.Model.PrescriptionRequest;
import com.Backend.MediXBackend.Model.PrescriptionWithPatientDetails;
import com.Backend.MediXBackend.Service.PrescriptionService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/prescriptions")
@CrossOrigin(origins = "http://localhost:3000")
public class PrescriptionController {

    @Autowired
    private PrescriptionService prescriptionService;

    @PostMapping
    public ResponseEntity<?> createPrescription(@RequestBody Prescription prescription) {
        try {
            // Validate required fields
            if (prescription.getPatientId() == null || prescription.getDoctorId() == null) {
                return ResponseEntity.badRequest().body(Map.of("error", "Patient ID and Doctor ID are required"));
            }

            // Debug logging
            System.out.println("Received direct prescription for patient: " + prescription.getPatientId() + ", doctor: " + prescription.getDoctorId());
            if (prescription.getMedicines() != null) {
                System.out.println("Number of medicines: " + prescription.getMedicines().size());
                for (int i = 0; i < prescription.getMedicines().size(); i++) {
                    PrescriptionMedicine med = prescription.getMedicines().get(i);
                    System.out.println("Medicine " + i + ": medicineName='" + med.getMedicineName() + "', comment='" + med.getComment() + "'");
                    System.out.println("  Doses: morning=" + med.getMorningDose() + ", afternoon=" + med.getAfternoonDose() + ", evening=" + med.getEveningDose());
                }
            } else {
                System.out.println("No medicines provided");
            }

            Prescription savedPrescription = prescriptionService.createPrescription(prescription);
            return ResponseEntity.ok(Map.of(
                    "success", true,
                    "message", "Prescription created successfully",
                    "data", savedPrescription
            ));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest()
                    .body(Map.of("error", "Validation error", "details", e.getMessage()));
        } catch (Exception e) {
            e.printStackTrace(); // Print stack trace for debugging
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to create prescription", "details", e.getMessage()));
        }
    }

    @PostMapping("/from-frontend")
    public ResponseEntity<?> createPrescriptionFromFrontend(@RequestBody PrescriptionRequest request) {
        try {
            // Validate required fields
            if (request.getPatientId() == null || request.getDoctorId() == null) {
                return ResponseEntity.badRequest().body(Map.of("error", "Patient ID and Doctor ID are required"));
            }

            // Debug logging
            System.out.println("Received prescription request for patient: " + request.getPatientId() + ", doctor: " + request.getDoctorId());
            if (request.getMedicines() != null) {
                System.out.println("Number of medicines: " + request.getMedicines().size());
                for (int i = 0; i < request.getMedicines().size(); i++) {
                    PrescriptionRequest.MedicineRequest med = request.getMedicines().get(i);
                    System.out.println("Medicine " + i + ": name='" + med.getName() + "', comment='" + med.getComment() + "'");
                    if (med.getNums() != null) {
                        System.out.println("  Nums array length: " + med.getNums().length);
                        for (int j = 0; j < med.getNums().length; j++) {
                            System.out.println("  Nums[" + j + "]: '" + med.getNums()[j] + "'");
                        }
                    } else {
                        System.out.println("  Nums array is null");
                    }
                }
            } else {
                System.out.println("No medicines provided");
            }

            // Convert request to prescription entity
            Prescription prescription = convertRequestToPrescription(request);
            
            Prescription savedPrescription = prescriptionService.createPrescription(prescription);
            return ResponseEntity.ok(Map.of(
                    "success", true,
                    "message", "Prescription created successfully",
                    "data", savedPrescription
            ));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest()
                    .body(Map.of("error", "Validation error", "details", e.getMessage()));
        } catch (Exception e) {
            e.printStackTrace(); // Print stack trace for debugging
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to create prescription", "details", e.getMessage()));
        }
    }

    // Helper method to convert PrescriptionRequest to Prescription entity
    private Prescription convertRequestToPrescription(PrescriptionRequest request) {
        Prescription prescription = new Prescription();
        prescription.setPatientId(request.getPatientId());
        prescription.setDoctorId(request.getDoctorId());
        prescription.setAppointmentId(request.getAppointmentId());
        prescription.setPrescriptionDate(request.getPrescriptionDate());
        prescription.setChiefComplaint(request.getChiefComplaint());
        prescription.setOnExamination(request.getOnExamination());
        prescription.setInvestigations(request.getInvestigations());
        prescription.setAdvice(request.getAdvice());

        // Convert medicines
        if (request.getMedicines() != null && !request.getMedicines().isEmpty()) {
            List<PrescriptionMedicine> medicines = new ArrayList<>();
            for (PrescriptionRequest.MedicineRequest medReq : request.getMedicines()) {
                // Skip medicines with null or empty names
                if (medReq.getName() != null && !medReq.getName().trim().isEmpty()) {
                    PrescriptionMedicine medicine = new PrescriptionMedicine();
                    medicine.setMedicineName(medReq.getName().trim());
                    medicine.setComment(medReq.getComment());
                    
                    // Parse dosages from nums array
                    if (medReq.getNums() != null && medReq.getNums().length >= 3) {
                        try {
                            medicine.setMorningDose(parseIntegerSafely(medReq.getNums()[0]));
                            medicine.setAfternoonDose(parseIntegerSafely(medReq.getNums()[1]));
                            medicine.setEveningDose(parseIntegerSafely(medReq.getNums()[2]));
                        } catch (NumberFormatException e) {
                            // Set default values if parsing fails
                            medicine.setMorningDose(0);
                            medicine.setAfternoonDose(0);
                            medicine.setEveningDose(0);
                        }
                    } else {
                        // Set default values if nums array is not provided or insufficient
                        medicine.setMorningDose(0);
                        medicine.setAfternoonDose(0);
                        medicine.setEveningDose(0);
                    }
                    
                    // Set number of days if provided
                    if (medReq.getNumberOfDays() != null) {
                        medicine.setNumberOfDays(medReq.getNumberOfDays());
                    } else {
                        medicine.setNumberOfDays(1); // Default to 1 if not provided
                    }
                    medicines.add(medicine);
                    System.out.println("Added medicine: " + medicine.getMedicineName() + " with doses: " + 
                                     medicine.getMorningDose() + "-" + medicine.getAfternoonDose() + "-" + medicine.getEveningDose() + ", days: " + medicine.getNumberOfDays());
                } else {
                    System.out.println("Skipping medicine with empty name: '" + medReq.getName() + "'");
                }
            }
            prescription.setMedicines(medicines);
        }

        return prescription;
    }

    // Helper method to safely parse integer from string
    private Integer parseIntegerSafely(String value) {
        if (value == null || value.trim().isEmpty()) {
            return 0;
        }
        try {
            return Integer.parseInt(value.trim());
        } catch (NumberFormatException e) {
            return 0;
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updatePrescription(@PathVariable Long id, @RequestBody Prescription updatedPrescription) {
        try {
            Prescription prescription = prescriptionService.updatePrescription(id, updatedPrescription);
            return ResponseEntity.ok(Map.of(
                    "success", true,
                    "message", "Prescription updated successfully",
                    "data", prescription
            ));
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to update prescription", "details", e.getMessage()));
        }
    }

    @PutMapping("/{id}/from-frontend")
    public ResponseEntity<?> updatePrescriptionFromFrontend(@PathVariable Long id, @RequestBody PrescriptionRequest request) {
        try {
            // Validate required fields
            if (request.getPatientId() == null || request.getDoctorId() == null) {
                return ResponseEntity.badRequest().body(Map.of("error", "Patient ID and Doctor ID are required"));
            }

            // Debug logging
            System.out.println("Updating prescription " + id + " for patient: " + request.getPatientId() + ", doctor: " + request.getDoctorId());
            if (request.getMedicines() != null) {
                System.out.println("Number of medicines: " + request.getMedicines().size());
                for (int i = 0; i < request.getMedicines().size(); i++) {
                    PrescriptionRequest.MedicineRequest med = request.getMedicines().get(i);
                    System.out.println("Medicine " + i + ": name='" + med.getName() + "', comment='" + med.getComment() + "'");
                    if (med.getNums() != null) {
                        System.out.println("  Nums array length: " + med.getNums().length);
                        for (int j = 0; j < med.getNums().length; j++) {
                            System.out.println("  Nums[" + j + "]: '" + med.getNums()[j] + "'");
                        }
                    } else {
                        System.out.println("  Nums array is null");
                    }
                }
            } else {
                System.out.println("No medicines provided");
            }

            // Convert request to prescription entity
            Prescription prescription = convertRequestToPrescription(request);
            
            Prescription updatedPrescription = prescriptionService.updatePrescription(id, prescription);
            return ResponseEntity.ok(Map.of(
                    "success", true,
                    "message", "Prescription updated successfully",
                    "data", updatedPrescription
            ));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest()
                    .body(Map.of("error", "Validation error", "details", e.getMessage()));
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            e.printStackTrace(); // Print stack trace for debugging
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to update prescription", "details", e.getMessage()));
        }
    }

    @GetMapping
    public ResponseEntity<List<Prescription>> getAllPrescriptions() {
        List<Prescription> prescriptions = prescriptionService.getAllPrescriptions();
        return ResponseEntity.ok(prescriptions);
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getPrescriptionById(@PathVariable Long id) {
        Optional<Prescription> prescription = prescriptionService.getPrescriptionById(id);
        return prescription.map(p -> ResponseEntity.ok(Map.of(
                        "success", true,
                        "message", "Prescription found",
                        "data", p
                )))
                .orElseGet(() -> ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(Map.of("error", "Prescription not found", "prescriptionId", id)));
    }

    @GetMapping("/patient/{patientId}")
    public ResponseEntity<?> getPrescriptionsByPatientId(@PathVariable Long patientId) {
        try {
            List<Prescription> prescriptions = prescriptionService.getPrescriptionsByPatientId(patientId);
            return ResponseEntity.ok(Map.of(
                    "success", true,
                    "message", "Prescriptions retrieved successfully",
                    "data", prescriptions
            ));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to retrieve prescriptions", "details", e.getMessage()));
        }
    }

    @GetMapping("/doctor/{doctorId}")
    public ResponseEntity<?> getPrescriptionsByDoctorId(@PathVariable Long doctorId) {
        try {
            List<Prescription> prescriptions = prescriptionService.getPrescriptionsByDoctorId(doctorId);
            return ResponseEntity.ok(Map.of(
                    "success", true,
                    "message", "Prescriptions retrieved successfully",
                    "data", prescriptions
            ));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to retrieve prescriptions", "details", e.getMessage()));
        }
    }

    @GetMapping("/doctor/{doctorId}/with-patient-details")
    public ResponseEntity<?> getPrescriptionsByDoctorIdWithPatientDetails(@PathVariable Long doctorId) {
        try {
            List<PrescriptionWithPatientDetails> prescriptions = prescriptionService.getPrescriptionsByDoctorIdWithPatientDetails(doctorId);
            return ResponseEntity.ok(Map.of(
                    "success", true,
                    "message", "Prescriptions with patient details retrieved successfully",
                    "data", prescriptions
            ));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to retrieve prescriptions with patient details", "details", e.getMessage()));
        }
    }

    @GetMapping("/patient/{patientId}/doctor/{doctorId}")
    public ResponseEntity<?> getPrescriptionsByPatientAndDoctor(@PathVariable Long patientId, @PathVariable Long doctorId) {
        try {
            List<Prescription> prescriptions = prescriptionService.getPrescriptionsByPatientIdAndDoctorId(patientId, doctorId);
            return ResponseEntity.ok(Map.of(
                    "success", true,
                    "message", "Prescriptions retrieved successfully",
                    "data", prescriptions
            ));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to retrieve prescriptions", "details", e.getMessage()));
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deletePrescription(@PathVariable Long id) {
        try {
            prescriptionService.deletePrescription(id);
            return ResponseEntity.ok(Map.of(
                    "success", true,
                    "message", "Prescription deleted successfully"
            ));
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to delete prescription", "details", e.getMessage()));
        }
    }

    @GetMapping("/{prescriptionId}/medicines")
    public ResponseEntity<?> getPrescriptionMedicines(@PathVariable Long prescriptionId) {
        try {
            List<PrescriptionMedicine> medicines = prescriptionService.getPrescriptionMedicines(prescriptionId);
            return ResponseEntity.ok(Map.of(
                    "success", true,
                    "message", "Prescription medicines retrieved successfully",
                    "data", medicines
            ));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to retrieve prescription medicines", "details", e.getMessage()));
        }
    }

    // Get prescriptions by appointment ID
    @GetMapping("/appointment/{appointmentId}")
    public ResponseEntity<?> getPrescriptionsByAppointmentId(@PathVariable Long appointmentId) {
        try {
            List<Prescription> prescriptions = prescriptionService.getPrescriptionsByAppointmentId(appointmentId);
            return ResponseEntity.ok(Map.of(
                    "success", true,
                    "message", "Prescriptions retrieved successfully",
                    "data", prescriptions
            ));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to retrieve prescriptions", "details", e.getMessage()));
        }
    }

    // Link an existing prescription to an appointment
    @PutMapping("/{prescriptionId}/link-appointment/{appointmentId}")
    public ResponseEntity<?> linkPrescriptionToAppointment(@PathVariable Long prescriptionId, @PathVariable Long appointmentId) {
        try {
            Prescription updatedPrescription = prescriptionService.linkPrescriptionToAppointment(prescriptionId, appointmentId);
            return ResponseEntity.ok(Map.of(
                    "success", true,
                    "message", "Prescription linked to appointment successfully",
                    "data", updatedPrescription
            ));
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("error", "Prescription or appointment not found", "details", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to link prescription to appointment", "details", e.getMessage()));
        }
    }

    // Unlink prescription from appointment
    @PutMapping("/{prescriptionId}/unlink-appointment")
    public ResponseEntity<?> unlinkPrescriptionFromAppointment(@PathVariable Long prescriptionId) {
        try {
            Prescription updatedPrescription = prescriptionService.unlinkPrescriptionFromAppointment(prescriptionId);
            return ResponseEntity.ok(Map.of(
                    "success", true,
                    "message", "Prescription unlinked from appointment successfully",
                    "data", updatedPrescription
            ));
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("error", "Prescription not found", "details", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to unlink prescription from appointment", "details", e.getMessage()));
        }
    }
}
