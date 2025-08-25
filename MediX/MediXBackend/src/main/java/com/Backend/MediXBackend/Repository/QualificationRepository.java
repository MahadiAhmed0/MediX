// QualificationRepository.java
package com.Backend.MediXBackend.Repository;

import com.Backend.MediXBackend.Model.Qualification;
import org.springframework.data.jpa.repository.JpaRepository;

public interface QualificationRepository extends JpaRepository<Qualification, Integer> {
}