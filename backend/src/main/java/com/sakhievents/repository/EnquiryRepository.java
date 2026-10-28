package com.sakhievents.repository;

import com.sakhievents.model.Enquiry;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface EnquiryRepository extends JpaRepository<Enquiry, Long> {
    List<Enquiry> findAllByOrderByCreatedAtDesc();
    List<Enquiry> findByEmailOrderByCreatedAtDesc(String email);
    List<Enquiry> findByEnquiryTypeOrderByCreatedAtDesc(String enquiryType);
}
