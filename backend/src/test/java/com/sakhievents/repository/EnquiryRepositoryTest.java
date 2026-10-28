package com.sakhievents.repository;

import com.sakhievents.model.Enquiry;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;

import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

@DataJpaTest
class EnquiryRepositoryTest {

    @Autowired
    private EnquiryRepository enquiryRepository;

    @Test
    @DisplayName("Repository: Persist enquiry generates ID and sets createdAt timestamp")
    void testSaveEnquiry_SetsIdAndCreatedAt() {
        Enquiry enquiry = Enquiry.builder()
                .fullName("Sunita Shinde")
                .companyName("Shinde Textiles")
                .email("sunita@example.com")
                .phone("9988776655")
                .enquiryType("Stall Booking / Exhibition Space")
                .message("We need two standard stalls near the main entry.")
                .build();

        Enquiry saved = enquiryRepository.save(enquiry);

        assertNotNull(saved.getId(), "Generated ID should not be null");
        assertNotNull(saved.getCreatedAt(), "CreatedAt should be populated by @PrePersist");
        assertEquals("Sunita Shinde", saved.getFullName());
        assertEquals("sunita@example.com", saved.getEmail());
    }

    @Test
    @DisplayName("Repository: Find by email ordered by createdAt desc")
    void testFindByEmailOrderByCreatedAtDesc() {
        Enquiry e1 = Enquiry.builder()
                .fullName("User One")
                .email("user1@example.com")
                .phone("9123456780")
                .enquiryType("General Inquiry & Support")
                .message("First inquiry regarding event entry.")
                .build();

        enquiryRepository.save(e1);

        List<Enquiry> results = enquiryRepository.findByEmailOrderByCreatedAtDesc("user1@example.com");
        assertFalse(results.isEmpty());
        assertEquals("user1@example.com", results.get(0).getEmail());
    }

    @Test
    @DisplayName("Repository: Find by enquiry type ordered by createdAt desc")
    void testFindByEnquiryTypeOrderByCreatedAtDesc() {
        Enquiry e = Enquiry.builder()
                .fullName("Press Reporter")
                .companyName("Daily News")
                .email("reporter@dailynews.com")
                .phone("9876543219")
                .enquiryType("Media & Press")
                .message("Requesting press accreditation for the exhibition.")
                .build();

        enquiryRepository.save(e);

        List<Enquiry> results = enquiryRepository.findByEnquiryTypeOrderByCreatedAtDesc("Media & Press");
        assertEquals(1, results.size());
        assertEquals("Media & Press", results.get(0).getEnquiryType());
    }
}
