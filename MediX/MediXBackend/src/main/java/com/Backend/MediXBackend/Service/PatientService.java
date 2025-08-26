package com.Backend.MediXBackend.Service;

import com.Backend.MediXBackend.Model.Patient;
import com.Backend.MediXBackend.Repository.PatientRepository;
import com.Backend.MediXBackend.Utils.IdGeneratorService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
public class PatientService {

    @Autowired
    private PatientRepository patientRepo;

    @Autowired
    private IdGeneratorService idGenService;

    @Transactional
    public Patient createBasicPatient(String name, String phoneNumber) {
        // Generate custom ID
        Long customId = idGenService.generatePatientId(); // 

        Patient patient = new Patient();
        patient.setId(customId);
        patient.setName(name);
        patient.setPhoneNumber(phoneNumber);

        return patientRepo.save(patient);
    }

    @Transactional
    public Patient updatePatientDetails(Long id, Patient updatedPatient) {
        return patientRepo.findById(id)
                .map(patient -> {
                    if (updatedPatient.getAge() != null) patient.setAge(updatedPatient.getAge());
                    if (updatedPatient.getGender() != null) patient.setGender(updatedPatient.getGender());
                    if (updatedPatient.getWeight() != null) patient.setWeight(updatedPatient.getWeight());
                    if (updatedPatient.getBloodPressure() != null) patient.setBloodPressure(updatedPatient.getBloodPressure());
                    return patientRepo.save(patient);
                })
                .orElseThrow(() -> new RuntimeException("Patient not found with id: " + id));
    }

    public List<Patient> getAllPatients() {
        return patientRepo.findAll();
    }

    public Optional<Patient> getPatientById(Long id) {
        return patientRepo.findById(id);
    }

    public Optional<Patient> getPatientByPhoneNumber(String phoneNumber) {
        return patientRepo.findByPhoneNumber(phoneNumber);
    }
}