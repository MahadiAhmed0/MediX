-- SQL script to create prescription-related tables
-- This script creates the tables manually if needed
-- Note: Hibernate will create these automatically with ddl-auto=update

-- Create prescriptions table
CREATE TABLE IF NOT EXISTS prescriptions (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    patient_id BIGINT NOT NULL,
    doctor_id BIGINT NOT NULL,
    prescription_date DATE NOT NULL,
    chief_complaint TEXT,
    on_examination TEXT,
    investigations TEXT,
    advice TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Create prescription_medicines table
CREATE TABLE IF NOT EXISTS prescription_medicines (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    prescription_id BIGINT NOT NULL,
    medicine_name VARCHAR(255) NOT NULL,
    morning_dose INT DEFAULT 0,
    afternoon_dose INT DEFAULT 0,
    evening_dose INT DEFAULT 0,
    number_of_days INT DEFAULT 1,
    comment TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (prescription_id) REFERENCES prescriptions(id) ON DELETE CASCADE
);

-- Create indexes for better query performance
CREATE INDEX idx_prescriptions_patient_id ON prescriptions(patient_id);
CREATE INDEX idx_prescriptions_doctor_id ON prescriptions(doctor_id);
CREATE INDEX idx_prescriptions_date ON prescriptions(prescription_date);
CREATE INDEX idx_prescription_medicines_prescription_id ON prescription_medicines(prescription_id);

-- Add comments to tables for documentation
ALTER TABLE prescriptions COMMENT = 'Stores prescription records with patient and doctor information';
ALTER TABLE prescription_medicines COMMENT = 'Stores medicine details for each prescription';
