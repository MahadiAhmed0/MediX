// SpecializationRepository.java
package com.Backend.MediXBackend.Repository;

import com.Backend.MediXBackend.Model.Specialization;
import org.springframework.data.jpa.repository.JpaRepository;

public interface SpecializationRepository extends JpaRepository<Specialization, Integer> {
}