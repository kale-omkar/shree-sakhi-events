-- ==============================================================
-- Shree Sakhi Events — Enquiry Schema DDL
-- For production environments where ddl-auto is set to 'validate' or 'none'.
-- ==============================================================

CREATE TABLE IF NOT EXISTS enquiries (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    full_name VARCHAR(100) NOT NULL COMMENT 'Full name of the person enquiring',
    company_name VARCHAR(100) NULL COMMENT 'Optional company or organization name',
    email VARCHAR(255) NOT NULL COMMENT 'Contact email address',
    phone VARCHAR(20) NOT NULL COMMENT 'Contact phone number',
    enquiry_type VARCHAR(100) NOT NULL COMMENT 'Category of enquiry',
    message TEXT NOT NULL COMMENT 'Detailed message or requirements',
    created_at DATETIME NOT NULL COMMENT 'Timestamp when enquiry was recorded',
    INDEX idx_enquiries_created_at (created_at DESC),
    INDEX idx_enquiries_email (email),
    INDEX idx_enquiries_type (enquiry_type)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
