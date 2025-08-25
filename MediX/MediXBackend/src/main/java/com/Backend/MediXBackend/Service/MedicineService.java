package com.Backend.MediXBackend.Service;

import com.Backend.MediXBackend.Model.Medicine;
import com.Backend.MediXBackend.Repository.MedicineRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Service
public class MedicineService {

    @Autowired
    private MedicineRepository medicineRepository;

    public List<Medicine> getAllMedicines() {
        return medicineRepository.findAll();
    }

    public Optional<Medicine> getMedicineById(Long id) {
        return medicineRepository.findById(id);
    }

    public Optional<Medicine> getMedicineByName(String medicineName) {
        return medicineRepository.findByMedicineName(medicineName);
    }

    public Medicine createMedicine(Medicine medicine) {
        return medicineRepository.save(medicine);
    }

    public Medicine updateMedicine(Long id, Medicine medicineDetails) {
        Optional<Medicine> optionalMedicine = medicineRepository.findById(id);

        if (optionalMedicine.isPresent()) {
            Medicine medicine = optionalMedicine.get();
            medicine.setCompany(medicineDetails.getCompany());
            medicine.setMedicineName(medicineDetails.getMedicineName());
            medicine.setGenericName(medicineDetails.getGenericName());
            medicine.setQuantity(medicineDetails.getQuantity());
            medicine.setUnitCost(medicineDetails.getUnitCost());
            medicine.setUnitPrice(medicineDetails.getUnitPrice());
            medicine.setExpiryDate(medicineDetails.getExpiryDate());

            return medicineRepository.save(medicine);
        }
        return null;
    }

    public boolean deleteMedicine(Long id) {
        if (medicineRepository.existsById(id)) {
            medicineRepository.deleteById(id);
            return true;
        }
        return false;
    }

    public List<Medicine> getMedicinesByCompany(String company) {
        return medicineRepository.findByCompany(company);
    }

    public List<Medicine> getMedicinesByGenericName(String genericName) {
        return medicineRepository.findByGenericName(genericName);
    }

    public List<Medicine> getExpiredMedicines() {
        return medicineRepository.findByExpiryDateBefore(LocalDate.now());
    }
}