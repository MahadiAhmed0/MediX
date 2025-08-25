package com.Backend.MediXBackend.Service;

import com.Backend.MediXBackend.Model.Qualification;
import com.Backend.MediXBackend.Repository.QualificationRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
public class QualificationService {

    @Autowired
    private QualificationRepository qualificationRepository;

    // Create a new qualification
    @Transactional
    public Qualification createQualification(Qualification qualification) {
        // Generate a new ID by finding the max existing ID and incrementing
        Integer maxId = qualificationRepository.findAll()
                .stream()
                .mapToInt(Qualification::getId)
                .max()
                .orElse(0);
        qualification.setId(maxId + 1);
        return qualificationRepository.save(qualification);
    }

    // Get all qualifications
    public List<Qualification> getAllQualifications() {
        return qualificationRepository.findAll();
    }

    // Get qualification by ID
    public Optional<Qualification> getQualificationById(Integer id) {
        return qualificationRepository.findById(id);
    }

    // Update qualification
    @Transactional
    public Qualification updateQualification(Integer id, Qualification updatedQualification) {
        Qualification existingQualification = qualificationRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Qualification not found with id: " + id));

        // Update fields if they are provided
        if (updatedQualification.getName() != null && !updatedQualification.getName().trim().isEmpty()) {
            existingQualification.setName(updatedQualification.getName().trim());
        }

        return qualificationRepository.save(existingQualification);
    }

    // Delete qualification
    @Transactional
    public void deleteQualification(Integer id) {
        if (!qualificationRepository.existsById(id)) {
            throw new RuntimeException("Qualification not found with id: " + id);
        }
        qualificationRepository.deleteById(id);
    }

    // Check if qualification exists by name (useful for validation)
    public boolean existsByName(String name) {
        return qualificationRepository.findAll()
                .stream()
                .anyMatch(q -> q.getName().equalsIgnoreCase(name.trim()));
    }
}
