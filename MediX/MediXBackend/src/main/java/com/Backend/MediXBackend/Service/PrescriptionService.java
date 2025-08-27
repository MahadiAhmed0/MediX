package com.Backend.MediXBackend.Service;

import com.Backend.MediXBackend.Model.Prescription;
import com.Backend.MediXBackend.Model.PrescriptionMedicine;
import com.Backend.MediXBackend.Model.PrescriptionWithPatientDetails;
import com.Backend.MediXBackend.Model.Patient;
import com.Backend.MediXBackend.Repository.PrescriptionRepository;
import com.Backend.MediXBackend.Repository.PrescriptionMedicineRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.ArrayList;

@Service
public class PrescriptionService {

    @Autowired
    private PrescriptionRepository prescriptionRepo;

    @Autowired
    private PrescriptionMedicineRepository prescriptionMedicineRepo;

    @Autowired
    private PatientService patientService;

    @Transactional
    public Prescription createPrescription(Prescription prescription) {
        // Set prescription date to current date if not provided
        if (prescription.getPrescriptionDate() == null) {
            prescription.setPrescriptionDate(LocalDate.now());
        }

        // Debug logging
        System.out.println("Creating prescription for patient: " + prescription.getPatientId() + ", doctor: " + prescription.getDoctorId());
        
        // Create a new prescription without medicines first
        Prescription prescriptionToSave = new Prescription();
        prescriptionToSave.setPatientId(prescription.getPatientId());
        prescriptionToSave.setDoctorId(prescription.getDoctorId());
        prescriptionToSave.setPrescriptionDate(prescription.getPrescriptionDate());
        prescriptionToSave.setChiefComplaint(prescription.getChiefComplaint());
        prescriptionToSave.setOnExamination(prescription.getOnExamination());
        prescriptionToSave.setInvestigations(prescription.getInvestigations());
        prescriptionToSave.setAdvice(prescription.getAdvice());

        // Save prescription first (without medicines to avoid cascade issues)
        Prescription savedPrescription = prescriptionRepo.save(prescriptionToSave);
        System.out.println("Prescription saved with ID: " + savedPrescription.getId());

        // If medicines are provided, save them separately
        if (prescription.getMedicines() != null && !prescription.getMedicines().isEmpty()) {
            System.out.println("Processing " + prescription.getMedicines().size() + " medicines");
            for (int i = 0; i < prescription.getMedicines().size(); i++) {
                PrescriptionMedicine medicine = prescription.getMedicines().get(i);
                
                // Validate medicine name is not null or empty
                if (medicine.getMedicineName() == null || medicine.getMedicineName().trim().isEmpty()) {
                    System.out.println("Skipping medicine " + i + " - empty name");
                    continue;
                }
                
                System.out.println("Processing medicine " + i + ": " + medicine.getMedicineName());
                
                // Create a new medicine entity and set the prescription reference
                PrescriptionMedicine newMedicine = new PrescriptionMedicine();
                newMedicine.setPrescription(savedPrescription);
                newMedicine.setMedicineName(medicine.getMedicineName().trim());
                newMedicine.setMorningDose(medicine.getMorningDose());
                newMedicine.setAfternoonDose(medicine.getAfternoonDose());
                newMedicine.setEveningDose(medicine.getEveningDose());

                newMedicine.setNumberOfDays(medicine.getNumberOfDays());
                newMedicine.setComment(medicine.getComment());
                
                PrescriptionMedicine savedMedicine = prescriptionMedicineRepo.save(newMedicine);
                System.out.println("Medicine saved with ID: " + savedMedicine.getId());
            }
        }

        // Return the prescription with medicines loaded
        Prescription result = prescriptionRepo.findPrescriptionWithMedicines(savedPrescription.getId());
        System.out.println("Final prescription loaded with " + 
                         (result.getMedicines() != null ? result.getMedicines().size() : 0) + " medicines");
        return result;
    }

    @Transactional
    public Prescription updatePrescription(Long prescriptionId, Prescription updatedPrescription) {
        return prescriptionRepo.findById(prescriptionId)
                .map(prescription -> {
                    // Update prescription fields
                    if (updatedPrescription.getChiefComplaint() != null) {
                        prescription.setChiefComplaint(updatedPrescription.getChiefComplaint());
                    }
                    if (updatedPrescription.getOnExamination() != null) {
                        prescription.setOnExamination(updatedPrescription.getOnExamination());
                    }
                    if (updatedPrescription.getInvestigations() != null) {
                        prescription.setInvestigations(updatedPrescription.getInvestigations());
                    }
                    if (updatedPrescription.getAdvice() != null) {
                        prescription.setAdvice(updatedPrescription.getAdvice());
                    }

                    // Update medicines
                    if (updatedPrescription.getMedicines() != null) {
                        // Delete existing medicines
                        prescriptionMedicineRepo.deleteByPrescriptionId(prescriptionId);
                        
                        // Add new medicines
                        for (PrescriptionMedicine medicine : updatedPrescription.getMedicines()) {
                            medicine.setPrescription(prescription);
                            // Ensure numberOfDays is set
                            if (medicine.getNumberOfDays() == null) {
                                medicine.setNumberOfDays(1);
                            }
                            prescriptionMedicineRepo.save(medicine);
                        }
                    }

                    return prescriptionRepo.save(prescription);
                })
                .orElseThrow(() -> new RuntimeException("Prescription not found with id: " + prescriptionId));
    }

    public List<Prescription> getAllPrescriptions() {
        return prescriptionRepo.findAll();
    }

    public Optional<Prescription> getPrescriptionById(Long id) {
        return Optional.ofNullable(prescriptionRepo.findPrescriptionWithMedicines(id));
    }

    public List<Prescription> getPrescriptionsByPatientId(Long patientId) {
        return prescriptionRepo.findByPatientIdOrderByPrescriptionDateDesc(patientId);
    }

    public List<Prescription> getPrescriptionsByDoctorId(Long doctorId) {
        return prescriptionRepo.findByDoctorIdOrderByPrescriptionDateDesc(doctorId);
    }

    public List<Prescription> getPrescriptionsByPatientIdAndDoctorId(Long patientId, Long doctorId) {
        return prescriptionRepo.findByPatientIdAndDoctorIdOrderByPrescriptionDateDesc(patientId, doctorId);
    }

    @Transactional
    public void deletePrescription(Long prescriptionId) {
        if (prescriptionRepo.existsById(prescriptionId)) {
            // Medicines will be deleted automatically due to cascade delete
            prescriptionRepo.deleteById(prescriptionId);
        } else {
            throw new RuntimeException("Prescription not found with id: " + prescriptionId);
        }
    }

    // Method to get prescription medicines only
    public List<PrescriptionMedicine> getPrescriptionMedicines(Long prescriptionId) {
        return prescriptionMedicineRepo.findByPrescriptionId(prescriptionId);
    }

    // Method to get prescriptions by doctor ID with patient details
    public List<PrescriptionWithPatientDetails> getPrescriptionsByDoctorIdWithPatientDetails(Long doctorId) {
        List<Prescription> prescriptions = prescriptionRepo.findByDoctorIdOrderByPrescriptionDateDesc(doctorId);
        List<PrescriptionWithPatientDetails> result = new ArrayList<>();
        
        for (Prescription prescription : prescriptions) {
            Optional<Patient> patientOpt = patientService.getPatientById(prescription.getPatientId());
            if (patientOpt.isPresent()) {
                PrescriptionWithPatientDetails prescriptionWithDetails = new PrescriptionWithPatientDetails(prescription, patientOpt.get());
                result.add(prescriptionWithDetails);
            }
        }
        
        return result;
    }

    // Get prescriptions by appointment ID
    public List<Prescription> getPrescriptionsByAppointmentId(Long appointmentId) {
        return prescriptionRepo.findByAppointmentIdOrderByPrescriptionDateDesc(appointmentId);
    }

    // Link prescription to appointment
    @Transactional
    public Prescription linkPrescriptionToAppointment(Long prescriptionId, Long appointmentId) {
        return prescriptionRepo.findById(prescriptionId)
                .map(prescription -> {
                    prescription.setAppointmentId(appointmentId);
                    return prescriptionRepo.save(prescription);
                })
                .orElseThrow(() -> new RuntimeException("Prescription not found with id: " + prescriptionId));
    }

    // Unlink prescription from appointment
    @Transactional
    public Prescription unlinkPrescriptionFromAppointment(Long prescriptionId) {
        return prescriptionRepo.findById(prescriptionId)
                .map(prescription -> {
                    prescription.setAppointmentId(null);
                    return prescriptionRepo.save(prescription);
                })
                .orElseThrow(() -> new RuntimeException("Prescription not found with id: " + prescriptionId));
    }
}
