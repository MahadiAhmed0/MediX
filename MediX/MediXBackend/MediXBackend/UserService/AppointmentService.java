package com.Backend.MediXBackend.Service;

import com.Backend.MediXBackend.Model.Appointment;
import com.Backend.MediXBackend.Model.AppointmentWithDetails;
import com.Backend.MediXBackend.Model.Doctor;
import com.Backend.MediXBackend.Model.Patient;
import com.Backend.MediXBackend.Repository.AppointmentRepository;
import com.Backend.MediXBackend.Repository.DoctorRepository;
import com.Backend.MediXBackend.Repository.PatientRepository;
import com.Backend.MediXBackend.Utils.IdGeneratorService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class AppointmentService {

    @Autowired
    private AppointmentRepository appointmentRepo;

    @Autowired
    private PatientRepository patientRepo;

    @Autowired
    private DoctorRepository doctorRepo;

    @Autowired
    private IdGeneratorService idGenService;

    @Transactional
    public Appointment createAppointment(Long patientId, Long doctorId, LocalDate appointmentDate) {
        Appointment appointment = new Appointment();
        appointment.setPatientId(patientId);
        appointment.setDoctorId(doctorId);
        appointment.setAppointmentDate(appointmentDate); // Now accepts LocalDate
        appointment.setStatus("NOT_READY");
        return appointmentRepo.save(appointment);
    }

    @Transactional
    public Appointment updateAppointmentStatus(Long id, String status) {
        return appointmentRepo.findById(id)
                .map(appointment -> {
                    appointment.setStatus(status);
                    return appointmentRepo.save(appointment);
                })
                .orElseThrow(() -> new RuntimeException("Appointment not found with id: " + id));
    }

    public List<Appointment> getAllAppointments() {
        return appointmentRepo.findAll();
    }

    public Optional<Appointment> getAppointmentById(Long id) {
        return appointmentRepo.findById(id);
    }

    public List<AppointmentWithDetails> getAppointmentsWithDetails() {
        List<Appointment> appointments = appointmentRepo.findAll();
        
        // Get all unique patient IDs and doctor IDs
        List<Long> patientIds = appointments.stream()
                .map(Appointment::getPatientId)
                .distinct()
                .collect(Collectors.toList());
        
        List<Long> doctorIds = appointments.stream()
                .map(Appointment::getDoctorId)
                .distinct()
                .collect(Collectors.toList());
        
        // Fetch all patients and doctors
        List<Patient> patients = patientRepo.findAllById(patientIds);
        List<Doctor> doctors = doctorRepo.findAllById(doctorIds);
        
        // Create maps for quick lookup
        Map<Long, Patient> patientMap = patients.stream()
                .collect(Collectors.toMap(Patient::getId, patient -> patient));
        
        Map<Long, Doctor> doctorMap = doctors.stream()
                .collect(Collectors.toMap(Doctor::getDoctorId, doctor -> doctor));
        
        // Combine the data
        return appointments.stream()
                .map(appointment -> {
                    Patient patient = patientMap.get(appointment.getPatientId());
                    Doctor doctor = doctorMap.get(appointment.getDoctorId());
                    
                    return new AppointmentWithDetails(
                            appointment.getId(),
                            appointment.getPatientId(),
                            appointment.getDoctorId(),
                            appointment.getAppointmentDate(),
                            appointment.getStatus(),
                            patient != null ? patient.getName() : "",
                            patient != null ? patient.getPhoneNumber() : "",
                            patient != null ? patient.getAge() : null,
                            patient != null ? patient.getGender() : "",
                            patient != null ? patient.getWeight() : null,
                            patient != null ? patient.getBloodPressure() : "",
                            doctor != null && doctor.getUser() != null ? doctor.getUser().getName() : ""
                    );
                })
                .collect(Collectors.toList());
    }
}