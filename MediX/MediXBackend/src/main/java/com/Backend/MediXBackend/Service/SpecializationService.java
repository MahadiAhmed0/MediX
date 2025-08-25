package com.Backend.MediXBackend.Service;

import com.Backend.MediXBackend.Model.Specialization;
import com.Backend.MediXBackend.Repository.SpecializationRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
public class SpecializationService {

    @Autowired
    private SpecializationRepository specializationRepository;

    // Create a new specialization
    @Transactional
    public Specialization createSpecialization(Specialization specialization) {
        // Generate a new ID by finding the max existing ID and incrementing
        Integer maxId = specializationRepository.findAll()
                .stream()
                .mapToInt(Specialization::getId)
                .max()
                .orElse(0);
        specialization.setId(maxId + 1);
        return specializationRepository.save(specialization);
    }

    // Get all specializations
    public List<Specialization> getAllSpecializations() {
        return specializationRepository.findAll();
    }

    // Get specialization by ID
    public Optional<Specialization> getSpecializationById(Integer id) {
        return specializationRepository.findById(id);
    }

    // Update specialization
    @Transactional
    public Specialization updateSpecialization(Integer id, Specialization updatedSpecialization) {
        Specialization existingSpecialization = specializationRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Specialization not found with id: " + id));

        // Update fields if they are provided
        if (updatedSpecialization.getName() != null && !updatedSpecialization.getName().trim().isEmpty()) {
            existingSpecialization.setName(updatedSpecialization.getName().trim());
        }

        return specializationRepository.save(existingSpecialization);
    }

    // Delete specialization
    @Transactional
    public void deleteSpecialization(Integer id) {
        if (!specializationRepository.existsById(id)) {
            throw new RuntimeException("Specialization not found with id: " + id);
        }
        specializationRepository.deleteById(id);
    }

    // Check if specialization exists by name (useful for validation)
    public boolean existsByName(String name) {
        return specializationRepository.findAll()
                .stream()
                .anyMatch(s -> s.getName().equalsIgnoreCase(name.trim()));
    }
}
