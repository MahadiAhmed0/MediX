package com.Backend.MediXBackend.Service;

import com.Backend.MediXBackend.Model.Doctor;
import com.Backend.MediXBackend.Model.User;
import com.Backend.MediXBackend.Repository.DoctorRepository;
import com.Backend.MediXBackend.Repository.UserRepository;
import com.Backend.MediXBackend.Utils.IdGeneratorService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
public class DoctorService {

    @Autowired
    private DoctorRepository doctorRepo;

    @Autowired
    private UserRepository userRepo;

    @Autowired
    private IdGeneratorService idGenService;

    @Transactional
    public Doctor createDoctorWithUser(User user, Doctor doctor) {
        // Generate custom ID
        Long customId = idGenService.generateDoctorUserId(1);

        // Assign ID to user and doctor
        user.setId(customId);
        userRepo.save(user);  // Save user first

        doctor.setDoctorId(customId);
        doctor.setUser(user);

        return doctorRepo.save(doctor);  // Save doctor with linked user
    }

    public List<Doctor> getAllDoctors() {
        return doctorRepo.findAll();
    }
    public Optional<Doctor> getDoctorById(Long id) {
        return doctorRepo.findById(id);
    }

    public Optional<Doctor> getDoctorByEmail(String email) {
        return doctorRepo.findByUserEmail(email);
    }

}
