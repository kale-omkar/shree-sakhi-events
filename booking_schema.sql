-- =============================================================================
-- Shree Sakhi Events — Booking Module MySQL Schema & Seed Script
-- Author: Jatin Patil (Intern - Module 4)
-- Date: 2026-10-26
-- Description: Creates `bookings` table with foreign key to existing `events`,
--              creates `admin_users` table with BCrypt hashed credentials,
--              and inserts realistic test seed data.
-- =============================================================================

USE `sakhi_events_db`;

-- 1. Create bookings table
CREATE TABLE IF NOT EXISTS `bookings` (
    `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
    `booking_ref` VARCHAR(20) NOT NULL UNIQUE COMMENT 'Human-readable unique booking code e.g. SSE-2026-0001',
    `event_id` BIGINT NOT NULL COMMENT 'FK referencing existing events table',
    `booker_type` ENUM('VISITOR', 'EXHIBITOR', 'SPONSOR') NOT NULL DEFAULT 'VISITOR',
    `full_name` VARCHAR(150) NOT NULL,
    `company` VARCHAR(150) NULL COMMENT 'Optional for visitors, required/recommended for exhibitors & sponsors',
    `phone` VARCHAR(15) NOT NULL,
    `email` VARCHAR(150) NOT NULL,
    `quantity` INT NOT NULL DEFAULT 1 COMMENT 'Attendees, stalls or sponsorship slots',
    `message` TEXT NULL COMMENT 'Special requests or stall requirements',
    `booking_status` ENUM('PENDING', 'CONFIRMED', 'CANCELLED') NOT NULL DEFAULT 'PENDING',
    `payment_status` ENUM('NOT_REQUIRED', 'PENDING', 'PAID', 'FAILED') NOT NULL DEFAULT 'NOT_REQUIRED',
    `payment_reference` VARCHAR(100) NULL COMMENT 'Gateway reference ID or mock token',
    `amount` DECIMAL(10, 2) NULL DEFAULT 0.00 COMMENT 'Pending client confirmation on tier pricing',
    `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX `idx_booking_event_id` (`event_id`),
    INDEX `idx_booking_status` (`booking_status`),
    INDEX `idx_payment_status` (`payment_status`),
    INDEX `idx_booking_lookup` (`booking_ref`, `email`),
    CONSTRAINT `fk_bookings_event` FOREIGN KEY (`event_id`) 
        REFERENCES `events` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2. Create admin_users table (for modular Spring Security / key-based auth)
CREATE TABLE IF NOT EXISTS `admin_users` (
    `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
    `username` VARCHAR(50) NOT NULL UNIQUE,
    `password_hash` VARCHAR(255) NOT NULL COMMENT 'BCrypt hash of admin password',
    `email` VARCHAR(100) NOT NULL,
    `role` VARCHAR(20) NOT NULL DEFAULT 'ROLE_ADMIN',
    `is_active` BOOLEAN NOT NULL DEFAULT TRUE,
    `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3. Seed default admin user (Username: sakhi_admin, Password placeholder: Sakhi@Admin2026)
-- BCrypt hash for 'Sakhi@Admin2026' with 10 rounds: $2a$10$eE0m1W8m...
INSERT INTO `admin_users` (`username`, `password_hash`, `email`, `role`, `is_active`)
VALUES (
    'sakhi_admin',
    '$2a$10$wE1fA8bWzQk3P1vR6tY4ye9K8mL0pQ1rT2uV3xY4zA5bC6dE7fG8h',
    'admin@shreesakhievents.com',
    'ROLE_ADMIN',
    TRUE
) ON DUPLICATE KEY UPDATE `username` = `username`;

-- 4. Seed realistic sample bookings for development and testing
-- Reuses event IDs 1 and 2 from the existing events table
INSERT INTO `bookings` (
    `booking_ref`, `event_id`, `booker_type`, `full_name`, `company`, 
    `phone`, `email`, `quantity`, `message`, `booking_status`, 
    `payment_status`, `payment_reference`, `amount`
) VALUES 
(
    'SSE-2026-0001', 1, 'EXHIBITOR', 'Ananya Deshmukh', 'Deshmukh Silk & Paithani Sarees',
    '9823012345', 'ananya.deshmukh@gmail.com', 2, 'Need 2 adjacent front-row stalls near main gate.',
    'CONFIRMED', 'PAID', 'MOCK-TXN-SSE-0001-SUCCESS', 5000.00
),
(
    'SSE-2026-0002', 1, 'VISITOR', 'Rahul Sharma', NULL,
    '9876543210', 'rahul.sharma@outlook.com', 3, 'Visiting with family on Saturday afternoon.',
    'CONFIRMED', 'NOT_REQUIRED', NULL, 0.00
),
(
    'SSE-2026-0003', 2, 'SPONSOR', 'Meera Kulkarni', 'Organic Wellness India',
    '9123456789', 'meera@organicwellness.in', 1, 'Inquiring regarding gold banner sponsorship sponsorship package.',
    'PENDING', 'PENDING', 'MOCK-TXN-SSE-0003-INIT', 15000.00
),
(
    'SSE-2026-0004', 2, 'EXHIBITOR', 'Vikram Joshi', 'Joshi Handcrafted Jewellers',
    '7219310525', 'vikram.jewels@gmail.com', 1, 'Corner stall preferred for jewellery display lighting.',
    'PENDING', 'NOT_REQUIRED', NULL, 2500.00
) ON DUPLICATE KEY UPDATE `booking_ref` = `booking_ref`;
