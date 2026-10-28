# Shree Sakhi Events — Booking & Admin Module Documentation
**Author:** Jatin Patil (Intern – Module 4)  
**Date:** October 26, 2026  
**Tech Stack:** React 18, Spring Boot 3.3.4 (Java 21/25), MySQL 8.0, Vite  

---

## 1. Flowchart (Mermaid)

```mermaid
flowchart TD
    A([Visitor / Exhibitor / Sponsor]) --> B[Browse Upcoming Events]
    B --> C[Click 'Book Stall / Register' /book?eventId=X]
    C --> D{Client-side Validation}
    D -- Invalid --> E[Show Inline Validation Errors]
    E --> C
    D -- Valid --> F[POST /api/bookings]
    F --> G{Backend Validation}
    G -- Event Past / Closed / Duplicate --> H[Return JSON Error 400]
    H --> C
    G -- Valid --> I[Generate Unique Ref SSE-YYYY-XXXX<br/>Status: PENDING]
    I --> J{Payment Required / Configured?}
    J -- Mock Mode --> K[Mock Payment Screen /book/pay]
    K --> L[POST /api/bookings/{ref}/confirm-payment]
    L --> M{Backend Signature Verification}
    M -- Invalid Signature --> N[Mark FAILED<br/>Reject Confirmation]
    M -- Valid Mock Signature --> O[Mark PAID<br/>Booking CONFIRMED]
    J -- No Payment --> P[Booking PENDING<br/>Payment NOT_REQUIRED]
    O --> Q[Booking Confirmation Screen /book/confirm]
    P --> Q
    Q --> R[Print Pass / Share WhatsApp]
    
    S([Public User]) --> T[Check Status Screen /book/status]
    T --> U[Enter Ref + Matching Email]
    U --> V[GET /api/bookings/status?ref=...&email=...]
    V --> W[Display Verified Booking Details]

    X([Admin]) --> Y[Admin Login Screen /admin]
    Y --> Z[Admin Panel: 'Bookings & Stalls' Tab]
    Z --> AA[Filter by Event, Status, Search]
    AA --> AB[Confirm or Cancel Booking<br/>PATCH /api/admin/bookings/{id}]
```

---

## 2. Setup Notes & Environment Variables

### Environment Variables
Create or verify `.env` in the root and `frontend/.env`:

```properties
# ── Backend Configuration (.env / application.properties) ──
SERVER_PORT=8080
DB_URL=jdbc:mysql://localhost:3306/sakhi_events_db?createDatabaseIfNotExist=true&useSSL=false&serverTimezone=Asia/Kolkata&allowPublicKeyRetrieval=true
DB_USERNAME=root
DB_PASSWORD=your_password
admin.api.key=sakhi-admin-2026

# Jatin Patil — Booking Module Settings
payment.mode=mock                # 'mock' (default test mode) or 'sandbox' (Razorpay test keys)
booking.ref.prefix=SSE          # Booking reference prefix

# ── Frontend Configuration (frontend/.env) ──
VITE_API_BASE_URL=http://localhost:8080/api
VITE_ADMIN_KEY=sakhi-admin-2026
```

### Running Locally
1. **Database:**
   ```bash
   mysql -u root -p sakhi_events_db < booking_schema.sql
   ```
2. **Backend Server:**
   ```bash
   cd backend
   ./mvnw spring-boot:run
   ```
   Runs on `http://localhost:8080` (Tomcat embedded).
3. **Frontend Server:**
   ```bash
   cd frontend
   npm install
   npm run dev
   ```
   Runs on `http://localhost:5173`.
4. **Admin Login Placeholder:**
   - URL: `http://localhost:5173/admin`
   - Admin Key: `sakhi-admin-2026`

---

## 3. Test Cases Document

| ID | Scenario | Steps to Reproduce | Expected Result | Actual Result | Status |
|---|---|---|---|---|---|
| **TC-01** | Form validation on empty submit | Navigate to `/book`, leave fields empty, click Submit | Inline errors displayed for name, phone, email, and mandatory consent. Form does not submit. | Validation error highlights appear under each invalid field. | **PASS** |
| **TC-02** | Invalid Indian mobile number | Enter phone `1234567890` or `98765` | Error message: "Enter a valid 10-digit Indian mobile number (starting with 6-9)." | Proper validation regex check catches invalid format. | **PASS** |
| **TC-03** | Successful booking creation | Select Exhibitor, enter valid name, phone, email, company, stalls=2, consent checked, click Submit | Form submits to `POST /api/bookings`, returns ref (e.g. `SSE-2026-0005`), navigates to `/book/pay`. | Booking created with status `PENDING`, redirected to sandbox payment. | **PASS** |
| **TC-04** | Invalid / non-existent event | Submit `POST /api/bookings` with `eventId=9999` | Backend returns HTTP 400 with clean error: "Event not found with ID: 9999". | Handled by GlobalExceptionHandler, no stack traces exposed. | **PASS** |
| **TC-05** | Past event booking rejection | Attempt to book event with `eventType=PAST` (Event #1) | Backend rejects with message: "Bookings are not allowed for past events." | Handled cleanly; booking is not saved. | **PASS** |
| **TC-06** | Duplicate booking submission | Submit booking for same email & event twice | Second submission rejected: "A booking already exists for this email for this event." | Duplicate guard prevents duplicate entry. | **PASS** |
| **TC-07** | Status lookup with matching email | Visit `/book/status`, enter `SSE-2026-0001` and `ananya.deshmukh@gmail.com` | Booking details, status badge, event name, and payment status displayed. | Booking details retrieved successfully. | **PASS** |
| **TC-08** | Status lookup with wrong email | Visit `/book/status`, enter `SSE-2026-0001` and `wrong@email.com` | Returns error: "No booking found for reference...". Customer details are not exposed. | Verification failed securely; zero data leaked. | **PASS** |
| **TC-09** | Admin login success / failure | Visit `/admin`, submit invalid key then `sakhi-admin-2026` | Invalid key shows error; correct key opens Admin Panel with Events and Bookings tabs. | Auth guard and sessionStorage work as expected. | **PASS** |
| **TC-10** | Unauthorised access to Admin API | Send `GET /api/admin/bookings` without `X-Admin-Key` header | Returns HTTP 400 with `success: false`, "Unauthorised: invalid or missing admin API key". | Access denied; endpoints protected. | **PASS** |
| **TC-11** | Admin status change (Confirm/Cancel) | On `/admin` Bookings tab, click `✓ Confirm` or `✕ Cancel` on a booking | Booking status patched via `PATCH /api/admin/bookings/{id}`, table updates in real-time. | Status updated to `CONFIRMED` / `CANCELLED` immediately. | **PASS** |
| **TC-12** | Mock payment success flow | On `/book/pay`, click "Pay with Mock / Sandbox Gateway" | Calls backend `initiate-payment` and `confirm-payment`. Signature verified on backend. Booking marked `CONFIRMED` and `PAID`. | Navigates to `/book/confirm` with green success banner and transaction ref. | **PASS** |
| **TC-13** | Tampered payment verification | Send `POST /api/bookings/{ref}/confirm-payment` with fraudulent signature | Backend rejects signature, sets `paymentStatus=FAILED`, returns verification failure error. | Tampered signature rejected; booking is never marked as paid. | **PASS** |
| **TC-14** | Automated backend tests | Run `./mvnw test` in `backend/` directory | All 14 tests in `BookingServiceTest` and `BookingControllerTest` pass. | **14 / 14 tests pass (0 failures, 0 errors).** | **PASS** |

---

## 4. Bug Report Template

```markdown
### [BUG] Short summary of the issue

**Issue ID:** SSE-BUG-XXXX  
**Owner / Assignee:** [Name / Intern]  
**Status:** [Open | In Progress | Resolved | Closed]  
**Severity:** [Critical | Major | Minor | Cosmetic]  
**Component:** [Frontend UI | Booking Backend | Payment Simulation | Admin Panel]  

#### Description
Clear and concise description of what happened.

#### Steps to Reproduce
1. Go to '...'
2. Click on '...'
3. Scroll down to '...'
4. See error

#### Expected Result
What should have happened according to project specifications.

#### Actual Result
What actually occurred (including error message or unintended behavior).

#### Screenshots / Logs
Attach screenshot or console/server log snippet here.

#### Environment
- OS: macOS / Windows / Linux
- Browser: Chrome / Safari / Firefox
- Node Version: 20+
- Java Version: 21 / 25
```

---

## 5. Module Report

### Features Implemented
1. **Dynamic Multi-Role Booking Page (`/book`):**
   - Role switcher (Visitor, Exhibitor, Sponsor) with adaptive fields and contextual hints.
   - Event selector supporting pre-selection from URL query parameter (`?eventId=3`).
   - Comprehensive client-side validations (10-digit Indian mobile pattern `^[6-9][0-9]{9}$`, email syntax, attendees/stalls range, terms acceptance).
   - Dynamic fee preview calculation and sidebar event summary card.
2. **Sandbox Payment Architecture (`/book/pay`):**
   - Interface-driven `PaymentService` with pluggable `MockPaymentService` and Razorpay test-mode gateway readiness.
   - Prominent "TEST MODE — NO REAL MONEY" sandbox warning banner.
   - Cryptographic verification enforced on the backend before marking payments as `PAID`.
3. **Confirmation & Public Status Screens (`/book/confirm`, `/book/status`):**
   - Unique reference code generation (`SSE-2026-XXXX`).
   - Dual-factor status lookup (Reference + Email) to strictly prevent unauthorized enumerations or privacy leaks.
   - One-click print/PDF pass generation and direct WhatsApp support integration.
4. **Admin Bookings Dashboard (`/admin` tab):**
   - Unified admin layout with Events Management and Bookings & Stalls tabs.
   - Real-time stat cards (Total Bookings, Confirmed, Pending, Cancelled, Paid Revenue).
   - Multi-parameter filtering by event ID, status, and live text search across reference, contact details, and organization.
   - Instant booking confirmation and cancellation controls with confirmation dialogues.
5. **Robust Spring Boot Backend:**
   - `Booking` entity with strict relationships to existing `Event` table.
   - Defensive validation checks: prevents duplicate bookings per email/event, rejects bookings on past or closed events.
   - Comprehensive test suite with 14 unit and integration tests (`BookingServiceTest` and `BookingControllerTest`).

### Technologies Used
- **Frontend:** React 18, React Router v6, CSS custom property design system (vanilla CSS, zero arbitrary Tailwind dependencies).
- **Backend:** Spring Boot 3.3.4, Spring Data JPA, Hibernate, Bean Validation (Jakarta), Lombok.
- **Database:** MySQL 8.0 with InnoDB and utf8mb4 encoding.
- **Testing:** JUnit 5, Mockito, Spring MockMvc.

### Known Limitations
- When using Mock Payment mode, transaction IDs are synthesized in memory with cryptographic UUIDs rather than communicating with an external banking server.
- Print pass utilizes browser `window.print()` styles; a server-side PDF generator (e.g. iText) can be added once physical ticket designs are provided.

### Pending Client Confirmation Items
1. **Payment Gateway Credentials & Merchant Account:**
   - Client approval pending for Razorpay/PayU merchant account activation (Key ID and Key Secret).
2. **Pricing & Fee Structure:**
   - Final ticket/stall pricing per event, category, and sponsorship tier (currently default free or configurable amount).
3. **Event Capacity & Stall Allocation Limits:**
   - Fixed stall quota per hall/venue and stall numbering maps.
4. **Official Notification Channels:**
   - WhatsApp Business API (Twilio / Wati) or SMTP email server credentials for sending automated transactional SMS/emails.
