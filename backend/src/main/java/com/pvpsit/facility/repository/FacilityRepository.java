package com.pvpsit.facility.repository;

import com.pvpsit.facility.model.Facility;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface FacilityRepository extends JpaRepository<Facility, String> {
}
