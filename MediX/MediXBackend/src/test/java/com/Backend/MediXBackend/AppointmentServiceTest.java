package com.Backend.MediXBackend;

import com.Backend.MediXBackend.Model.Appointment;
import com.Backend.MediXBackend.Model.AppointmentWithDetails;
import com.Backend.MediXBackend.Model.Patient;
import com.Backend.MediXBackend.Model.Doctor;
import com.Backend.MediXBackend.Model.User;
import com.Backend.MediXBackend.Repository.AppointmentRepository;
import com.Backend.MediXBackend.Repository.PatientRepository;
import com.Backend.MediXBackend.Repository.DoctorRepository;
import com.Backend.MediXBackend.Service.AppointmentService;
import com.Backend.MediXBackend.Utils.IdGeneratorService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDate;
import java.util.*;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AppointmentServiceTest {

    @Mock
    private AppointmentRepository appointmentRepo;
    @Mock
    private PatientRepository patientRepo;
    @Mock
    private DoctorRepository doctorRepo;
    @Mock
    private IdGeneratorService idGenService;

    @InjectMocks
    private AppointmentService appointmentService;

    @BeforeEach
    void setUp() {}

    @Test
    void createAppointment_SetsDefaultStatusToNotReady() {
        when(appointmentRepo.save(any(Appointment.class))).thenAnswer(inv -> inv.getArgument(0));

        Appointment result = appointmentService.createAppointment(1L, 2501001L, LocalDate.now());

        assertEquals("NOT_READY", result.getStatus());
        assertEquals(1L, result.getPatientId());
        assertEquals(2501001L, result.getDoctorId());
    }

    @Test
    void createAppointment_PassesLocalDateCorrectly() {
        LocalDate futureDate = LocalDate.of(2026, 8, 15);
        when(appointmentRepo.save(any(Appointment.class))).thenAnswer(inv -> inv.getArgument(0));

        Appointment result = appointmentService.createAppointment(5L, 2501001L, futureDate);

        assertEquals(futureDate, result.getAppointmentDate());
    }

    @Test
    void updateAppointmentStatus_ValidStatus_UpdatesSuccessfully() {
        Appointment existing = new Appointment();
        existing.setId(1L);
        existing.setStatus("NOT_READY");

        when(appointmentRepo.findById(1L)).thenReturn(Optional.of(existing));
        when(appointmentRepo.save(any(Appointment.class))).thenReturn(existing);

        Appointment result = appointmentService.updateAppointmentStatus(1L, "READY");

        assertEquals("READY", result.getStatus());
    }

    @Test
    void updateAppointmentStatus_InvalidId_ThrowsException() {
        when(appointmentRepo.findById(999L)).thenReturn(Optional.empty());

        assertThrows(RuntimeException.class,
            () -> appointmentService.updateAppointmentStatus(999L, "READY"));
    }

    @Test
    void updateAppointmentStatus_AnyStringAccepted_NoValidation() {
        Appointment existing = new Appointment();
        existing.setId(1L);
        existing.setStatus("NOT_READY");

        when(appointmentRepo.findById(1L)).thenReturn(Optional.of(existing));
        when(appointmentRepo.save(any(Appointment.class))).thenReturn(existing);

        assertDoesNotThrow(() -> appointmentService.updateAppointmentStatus(1L, "INVALID_GARBAGE"));
    }

    @Test
    void getAppointmentsWithDetails_CorrectlyDenormalizesAllFields() {
        LocalDate today = LocalDate.now();
        Appointment apt = new Appointment();
        apt.setId(1L);
        apt.setPatientId(10L);
        apt.setDoctorId(2501001L);
        apt.setAppointmentDate(today);
        apt.setStatus("READY");

        Patient patient = new Patient();
        patient.setId(10L);
        patient.setName("John Doe");
        patient.setPhoneNumber("+8801711111111");
        patient.setAge(35);
        patient.setGender("Male");
        patient.setWeight(70.5);
        patient.setBloodPressure("120/80");

        User user = new User();
        user.setName("Dr. Smith");

        Doctor doctor = new Doctor();
        doctor.setDoctorId(2501001L);
        doctor.setUser(user);

        when(appointmentRepo.findAll()).thenReturn(List.of(apt));
        when(patientRepo.findAllById(List.of(10L))).thenReturn(List.of(patient));
        when(doctorRepo.findAllById(List.of(2501001L))).thenReturn(List.of(doctor));

        List<AppointmentWithDetails> result = appointmentService.getAppointmentsWithDetails();

        assertEquals(1, result.size());
        AppointmentWithDetails detail = result.get(0);
        assertEquals("John Doe", detail.getPatientName());
        assertEquals("+8801711111111", detail.getPatientPhone());
        assertEquals(35, detail.getAge());
        assertEquals("Male", detail.getGender());
        assertEquals(70.5, detail.getWeight());
        assertEquals("120/80", detail.getPressure());
        assertEquals("Dr. Smith", detail.getDoctorName());
    }

    @Test
    void getAppointmentsWithDetails_PatientNotFound_ReturnsEmptyStrings() {
        Appointment apt = new Appointment();
        apt.setId(1L);
        apt.setPatientId(999L);
        apt.setDoctorId(2501001L);
        apt.setAppointmentDate(LocalDate.now());
        apt.setStatus("REQUESTED");

        User user = new User();
        user.setName("Dr. Alone");

        Doctor doctor = new Doctor();
        doctor.setDoctorId(2501001L);
        doctor.setUser(user);

        when(appointmentRepo.findAll()).thenReturn(List.of(apt));
        when(patientRepo.findAllById(List.of(999L))).thenReturn(new ArrayList<>());
        when(doctorRepo.findAllById(List.of(2501001L))).thenReturn(List.of(doctor));

        List<AppointmentWithDetails> result = appointmentService.getAppointmentsWithDetails();

        assertEquals(1, result.size());
        assertEquals("", result.get(0).getPatientName());
        assertEquals("", result.get(0).getPatientPhone());
        assertNull(result.get(0).getAge());
        assertEquals("Dr. Alone", result.get(0).getDoctorName());
    }

    @Test
    void getAppointmentsWithDetails_DoctorNotFound_ReturnsEmptyDoctorName() {
        Appointment apt = new Appointment();
        apt.setId(1L);
        apt.setPatientId(1L);
        apt.setDoctorId(999L);
        apt.setAppointmentDate(LocalDate.now());
        apt.setStatus("REQUESTED");

        Patient patient = new Patient();
        patient.setId(1L);
        patient.setName("Jane");
        patient.setPhoneNumber("+880");

        when(appointmentRepo.findAll()).thenReturn(List.of(apt));
        when(patientRepo.findAllById(List.of(1L))).thenReturn(List.of(patient));
        when(doctorRepo.findAllById(List.of(999L))).thenReturn(new ArrayList<>());

        List<AppointmentWithDetails> result = appointmentService.getAppointmentsWithDetails();

        assertEquals(1, result.size());
        assertEquals("Jane", result.get(0).getPatientName());
        assertEquals("", result.get(0).getDoctorName());
    }

    @Test
    void getAppointmentsWithDetails_DoctorHasNullUser_ReturnsEmptyDoctorName() {
        Appointment apt = new Appointment();
        apt.setId(1L);
        apt.setPatientId(1L);
        apt.setDoctorId(2501001L);
        apt.setAppointmentDate(LocalDate.now());
        apt.setStatus("READY");

        Patient patient = new Patient();
        patient.setId(1L);
        patient.setName("Patient");

        Doctor doctor = new Doctor();
        doctor.setDoctorId(2501001L);
        doctor.setUser(null);

        when(appointmentRepo.findAll()).thenReturn(List.of(apt));
        when(patientRepo.findAllById(anyList())).thenReturn(List.of(patient));
        when(doctorRepo.findAllById(anyList())).thenReturn(List.of(doctor));

        List<AppointmentWithDetails> result = appointmentService.getAppointmentsWithDetails();

        assertEquals("", result.get(0).getDoctorName());
    }

    @Test
    void getAppointmentsWithDetails_MultipleAppointments_DeduplicatesIds() {
        Appointment apt1 = new Appointment();
        apt1.setId(1L);
        apt1.setPatientId(1L);
        apt1.setDoctorId(2501001L);
        apt1.setAppointmentDate(LocalDate.now());
        apt1.setStatus("READY");

        Appointment apt2 = new Appointment();
        apt2.setId(2L);
        apt2.setPatientId(1L);  // Same patient
        apt2.setDoctorId(2501001L);  // Same doctor
        apt2.setAppointmentDate(LocalDate.now().plusDays(1));
        apt2.setStatus("DONE");

        Patient patient = new Patient();
        patient.setId(1L);
        patient.setName("Repeat Patient");

        User user = new User();
        user.setName("Dr. Busy");

        Doctor doctor = new Doctor();
        doctor.setDoctorId(2501001L);
        doctor.setUser(user);

        when(appointmentRepo.findAll()).thenReturn(List.of(apt1, apt2));
        when(patientRepo.findAllById(List.of(1L))).thenReturn(List.of(patient));
        when(doctorRepo.findAllById(List.of(2501001L))).thenReturn(List.of(doctor));

        List<AppointmentWithDetails> result = appointmentService.getAppointmentsWithDetails();

        assertEquals(2, result.size());
        // Verify bulk loads were called with deduplicated lists
        verify(patientRepo).findAllById(List.of(1L));
        verify(doctorRepo).findAllById(List.of(2501001L));
    }

    @Test
    void getAppointmentsWithDetails_EmptyAppointments_ReturnsEmptyList() {
        when(appointmentRepo.findAll()).thenReturn(new ArrayList<>());
        when(patientRepo.findAllById(List.of())).thenReturn(new ArrayList<>());
        when(doctorRepo.findAllById(List.of())).thenReturn(new ArrayList<>());

        List<AppointmentWithDetails> result = appointmentService.getAppointmentsWithDetails();

        assertTrue(result.isEmpty());
    }

    @Test
    void getAppointmentsByPatientId_ReturnsList() {
        Appointment apt = new Appointment();
        apt.setId(1L);
        apt.setPatientId(5L);

        when(appointmentRepo.findByPatientId(5L)).thenReturn(List.of(apt));

        List<Appointment> result = appointmentService.getAppointmentsByPatientId(5L);

        assertEquals(1, result.size());
        assertEquals(5L, result.get(0).getPatientId());
    }
}
