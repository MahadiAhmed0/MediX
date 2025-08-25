package com.Backend.MediXBackend.Service;

import com.Backend.MediXBackend.Model.*;
import com.Backend.MediXBackend.Repository.*;
import com.Backend.MediXBackend.Utils.IdGeneratorService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.Set;
import java.util.stream.Collectors;

@Service
public class DoctorService {

    @Autowired
    private DoctorRepository doctorRepo;

    @Autowired
    private UserRepository userRepo;

    @Autowired
    private QualificationRepository qualificationRepo;

    @Autowired
    private SpecializationRepository specializationRepo;

    @Autowired
    private DoctorQualificationRepository doctorQualificationRepo;

    @Autowired
    private DoctorSpecializationRepository doctorSpecializationRepo;

    @Autowired
    private IdGeneratorService idGenService;

    @Transactional
    public Doctor createDoctorWithUser(User user, Doctor doctor, Set<Integer> qualificationIds, Set<Integer> specializationIds) {
        // Generate custom ID
        Long customId = idGenService.generateDoctorUserId(1);

        // Assign ID to user and doctor
        user.setId(customId);
        userRepo.save(user);  // Save user first

        doctor.setDoctorId(customId);
        doctor.setUser(user);
        Doctor savedDoctor = doctorRepo.save(doctor);  // Save doctor with linked user

        // Add qualifications
        if (qualificationIds != null && !qualificationIds.isEmpty()) {
            Set<Qualification> qualifications = qualificationIds.stream()
                    .map(id -> qualificationRepo.findById(id)
                            .orElseThrow(() -> new RuntimeException("Qualification not found with id: " + id)))
                    .collect(Collectors.toSet());

            for (Qualification qualification : qualifications) {
                DoctorQualification dq = new DoctorQualification();
                dq.setId(new DoctorQualificationId(savedDoctor.getDoctorId(), qualification.getId()));
                dq.setDoctor(savedDoctor);
                dq.setQualification(qualification);
                doctorQualificationRepo.save(dq);
            }
        }

        // Add specializations
        if (specializationIds != null && !specializationIds.isEmpty()) {
            Set<Specialization> specializations = specializationIds.stream()
                    .map(id -> specializationRepo.findById(id)
                            .orElseThrow(() -> new RuntimeException("Specialization not found with id: " + id)))
                    .collect(Collectors.toSet());

            for (Specialization specialization : specializations) {
                DoctorSpecialization ds = new DoctorSpecialization();
                ds.setId(new DoctorSpecializationId(savedDoctor.getDoctorId(), specialization.getId()));
                ds.setDoctor(savedDoctor);
                ds.setSpecialization(specialization);
                doctorSpecializationRepo.save(ds);
            }
        }

        return savedDoctor;
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

    @Transactional
    public Doctor addQualifications(Long doctorId, Set<Integer> qualificationIds) {
        Doctor doctor = doctorRepo.findById(doctorId)
                .orElseThrow(() -> new RuntimeException("Doctor not found with id: " + doctorId));

        Set<Qualification> qualifications = qualificationIds.stream()
                .map(id -> qualificationRepo.findById(id)
                        .orElseThrow(() -> new RuntimeException("Qualification not found with id: " + id)))
                .collect(Collectors.toSet());

        for (Qualification qualification : qualifications) {
            DoctorQualification dq = new DoctorQualification();
            dq.setId(new DoctorQualificationId(doctorId, qualification.getId()));
            dq.setDoctor(doctor);
            dq.setQualification(qualification);
            doctorQualificationRepo.save(dq);
        }

        return doctor;
    }

    @Transactional
    public Doctor addSpecializations(Long doctorId, Set<Integer> specializationIds) {
        Doctor doctor = doctorRepo.findById(doctorId)
                .orElseThrow(() -> new RuntimeException("Doctor not found with id: " + doctorId));

        Set<Specialization> specializations = specializationIds.stream()
                .map(id -> specializationRepo.findById(id)
                        .orElseThrow(() -> new RuntimeException("Specialization not found with id: " + id)))
                .collect(Collectors.toSet());

        for (Specialization specialization : specializations) {
            DoctorSpecialization ds = new DoctorSpecialization();
            ds.setId(new DoctorSpecializationId(doctorId, specialization.getId()));
            ds.setDoctor(doctor);
            ds.setSpecialization(specialization);
            doctorSpecializationRepo.save(ds);
        }

        return doctor;
    }

    @Transactional
    public Doctor updateDoctor(Long doctorId, User userUpdates, Doctor doctorUpdates, 
                              Set<Integer> qualificationIds, Set<Integer> specializationIds) {
        Doctor existingDoctor = doctorRepo.findById(doctorId)
                .orElseThrow(() -> new RuntimeException("Doctor not found with id: " + doctorId));

        // Update user information if provided
        if (userUpdates != null) {
            User existingUser = existingDoctor.getUser();
            if (userUpdates.getName() != null) {
                existingUser.setName(userUpdates.getName());
            }
            if (userUpdates.getEmail() != null) {
                existingUser.setEmail(userUpdates.getEmail());
            }
            if (userUpdates.getPhoneNumber() != null) {
                existingUser.setPhoneNumber(userUpdates.getPhoneNumber());
            }
            if (userUpdates.getPassword() != null) {
                existingUser.setPassword(userUpdates.getPassword());
            }
            if (userUpdates.getAddress() != null) {
                existingUser.setAddress(userUpdates.getAddress());
            }
            userRepo.save(existingUser);
        }

        // Update doctor information if provided
        if (doctorUpdates != null) {
            if (doctorUpdates.getYearsOfExperience() != null) {
                existingDoctor.setYearsOfExperience(doctorUpdates.getYearsOfExperience());
            }
            if (doctorUpdates.getAvailableDays() != null) {
                existingDoctor.setAvailableDays(doctorUpdates.getAvailableDays());
            }
            if (doctorUpdates.getAvailableTimes() != null) {
                existingDoctor.setAvailableTimes(doctorUpdates.getAvailableTimes());
            }
            if (doctorUpdates.getLicenseNumber() != null) {
                existingDoctor.setLicenseNumber(doctorUpdates.getLicenseNumber());
            }
        }

        // Update qualifications if provided
        if (qualificationIds != null) {
            // Remove existing qualifications
            doctorQualificationRepo.deleteByDoctorDoctorId(doctorId);
            
            // Add new qualifications
            Set<Qualification> qualifications = qualificationIds.stream()
                    .map(id -> qualificationRepo.findById(id)
                            .orElseThrow(() -> new RuntimeException("Qualification not found with id: " + id)))
                    .collect(Collectors.toSet());

            for (Qualification qualification : qualifications) {
                DoctorQualification dq = new DoctorQualification();
                dq.setId(new DoctorQualificationId(doctorId, qualification.getId()));
                dq.setDoctor(existingDoctor);
                dq.setQualification(qualification);
                doctorQualificationRepo.save(dq);
            }
        }

        // Update specializations if provided
        if (specializationIds != null) {
            // Remove existing specializations
            doctorSpecializationRepo.deleteByDoctorDoctorId(doctorId);
            
            // Add new specializations
            Set<Specialization> specializations = specializationIds.stream()
                    .map(id -> specializationRepo.findById(id)
                            .orElseThrow(() -> new RuntimeException("Specialization not found with id: " + id)))
                    .collect(Collectors.toSet());

            for (Specialization specialization : specializations) {
                DoctorSpecialization ds = new DoctorSpecialization();
                ds.setId(new DoctorSpecializationId(doctorId, specialization.getId()));
                ds.setDoctor(existingDoctor);
                ds.setSpecialization(specialization);
                doctorSpecializationRepo.save(ds);
            }
        }

        return doctorRepo.save(existingDoctor);
    }
}