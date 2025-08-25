package com.Backend.MediXBackend.Service;

import com.Backend.MediXBackend.Model.User;
import com.Backend.MediXBackend.Repository.ReceptionistRepository;
import com.Backend.MediXBackend.Repository.UserRepository;
import com.Backend.MediXBackend.Utils.IdGeneratorService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

@Service
public class ReceptionistService {

    @Autowired
    private UserRepository userRepo;

    @Autowired
    private ReceptionistRepository receptionistRepo;

    @Autowired
    private IdGeneratorService idGenService;

    @Transactional
    public User createReceptionist(User user) {
        // Generate custom receptionist ID
        Long customId = idGenService.generateReceptionistId();
        user.setId(customId);
        return userRepo.save(user);
    }

    public Optional<User> getReceptionistById(Long id) {
        return userRepo.findById(id);
    }

    public Optional<User> getReceptionistByEmailAndPassword(String email, String password) {
        Optional<User> userOpt = userRepo.findByEmail(email);
        if (userOpt.isPresent() && userOpt.get().getPassword().equals(password)) {
            return userOpt;
        }
        return Optional.empty();
    }

    @Transactional
    public User updateReceptionist(Long id, User updatedUser) {
        User existingReceptionist = userRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Receptionist not found with id: " + id));

        // Update fields if they are provided
        if (updatedUser.getName() != null) {
            existingReceptionist.setName(updatedUser.getName());
        }
        if (updatedUser.getEmail() != null) {
            existingReceptionist.setEmail(updatedUser.getEmail());
        }
        if (updatedUser.getPhoneNumber() != null) {
            existingReceptionist.setPhoneNumber(updatedUser.getPhoneNumber());
        }
        if (updatedUser.getPassword() != null) {
            existingReceptionist.setPassword(updatedUser.getPassword());
        }
        if (updatedUser.getAddress() != null) {
            existingReceptionist.setAddress(updatedUser.getAddress());
        }

        return userRepo.save(existingReceptionist);
    }

}