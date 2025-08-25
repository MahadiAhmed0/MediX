package com.Backend.MediXBackend.Service;


import com.Backend.MediXBackend.Model.User;
import com.Backend.MediXBackend.Repository.PharmacistRepository;
import com.Backend.MediXBackend.Repository.UserRepository;
import com.Backend.MediXBackend.Utils.IdGeneratorService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

@Service
public class PharmacistService {

    @Autowired
    private UserRepository userRepo;

    @Autowired
    private PharmacistRepository pharmacistRepo;

    @Autowired
    private IdGeneratorService idGenService;

    @Transactional
    public User createPharmacist(User user) {
        // Generate custom pharmacist ID
        Long customId = idGenService.generatePharmacistId();
        user.setId(customId);
        return userRepo.save(user);
    }

    public Optional<User> getPharmacistById(Long id) {
        return userRepo.findById(id);
    }

    public Optional<User> getPharmacistByEmailAndPassword(String email, String password) {
        Optional<User> userOpt = userRepo.findByEmail(email);
        if (userOpt.isPresent() && userOpt.get().getPassword().equals(password)) {
            return userOpt;
        }
        return Optional.empty();
    }

    @Transactional
    public User updatePharmacist(Long id, User updatedUser) {
        User existingPharmacist = userRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Pharmacist not found with id: " + id));

        // Update fields if they are provided
        if (updatedUser.getName() != null) {
            existingPharmacist.setName(updatedUser.getName());
        }
        if (updatedUser.getEmail() != null) {
            existingPharmacist.setEmail(updatedUser.getEmail());
        }
        if (updatedUser.getPhoneNumber() != null) {
            existingPharmacist.setPhoneNumber(updatedUser.getPhoneNumber());
        }
        if (updatedUser.getPassword() != null) {
            existingPharmacist.setPassword(updatedUser.getPassword());
        }
        if (updatedUser.getAddress() != null) {
            existingPharmacist.setAddress(updatedUser.getAddress());
        }

        return userRepo.save(existingPharmacist);
    }

    @Transactional
    public boolean deletePharmacist(Long id) {
        Optional<User> pharmacist = userRepo.findById(id);
        if (pharmacist.isPresent()) {
            userRepo.deleteById(id);
            return true;
        }
        return false;
    }
}