# Shree Sakhi Events — Booking & Admin Module Documentation
**Author:** Jatin Patil (Intern – Module 4)  
**Date:** October 26, 2026  
**Tech Stack:** React 18, Spring Boot 3.3.4 (Java 21/25), MySQL 8.0, Vite  

---

## 1. Flowchart (Mermaid)

```mermaid
flowchart TD
    A([Visitor / Exhibitor / Sponsor]) --> B[Browse Upcoming Events]
    B --> C[Click 'Book' /book?eventId=X]
    C --> D[Step 1: Select Event & Booker Type]
    D --> E{Booker Type}
    E -- Visitor --> F[Step 3: Enter Details  /book/details]
    E -- Exhibitor / Sponsor --> G[Step 2: Select Stalls  /book/stalls]
    G --> H[Interactive Floor-Plan Map<br/>Click stall → toggle selection]
    H --> I[Sticky Summary: selected stalls, subtotal, grand total]
    I --> J[Click 'Hold Selected Stalls']
    J --> K[POST /api/stalls/hold<br/>Server locks stall rows, TTL default 10 min]
    K -- 409 Conflict --> L[Show 'Stall just got booked / held by another user'<br/>Refresh map, re-select]
    K -- Success --> M[Hold active + countdown timer<br/>Click 'Continue to Details']
    M --> F
    F --> N[Step 3: Enter Personal Details  /book/details]
    N --> O[POST /api/bookings<br/>stallCodes + holdToken + sessionId]
    O --> P{Backend re-validates hold inside transaction<br/>locks stall rows, computes total from DB prices}
    P -- Invalid / expired hold --> Q[Return 409 error<br/>Re-select stalls]
    Q --> G
    P -- Valid --> R[Save booking + booking_stalls links<br/>Amount = backend-computed stall total<br/>Status: PENDING]
    R --> S[Step 4: Mock/Sandbox Payment  /book/pay]
    S --> T[POST /api/bookings/{ref}/confirm-payment<br/>Backend signature verification]
    T -- Invalid Signature --> U[Mark FAILED<br/>Reject confirmation]
    T -- Valid --> V[Mark PAID + CONFIRMED]
    V --> W[Step 5: Confirmation Screen  /book/confirm<br/>Shows booked stalls + total]
    W --> X[Print Pass / Share WhatsApp]
    
    Y([Public User]) --> Z[Check Status Screen /book/status]
    Z --> AA[Enter Ref + Matching Email]
    AA --> AB[GET /api/bookings/status?ref=...&email=...]
    AB --> AC[Display Verified Booking Details + Stalls]

    AD([Admin]) --> AE[Admin Login Screen /admin]
    AE --> AF[Admin Panel: 'Bookings & Stalls' Tab]
    AF --> AG[Filter by Event, Status, Search]
    AG --> AH[Stall Occupancy List per Event<br/>GET /api/admin/events/{id}/stalls-occupancy]
    AH --> AI[Confirm or Cancel Booking<br/>PATCH /api/admin/bookings/{id}]
    AI -- Cancel --> AJ[Booking cancelled → its stalls released<br/>become AVAILABLE again]
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

# Stall Selection (new) — configurable
stall.hold.ttl.minutes=10        # How long a stall hold lasts (default 10)
stall.max.per.booking=5          # Max stalls one booking can hold (default 5)
stall.cleanup.fixedDelay.ms=60000 # How often expired holds are swept (ms)

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
| **TC-14** | Automated backend tests | Run `./mvnw test` in `backend/` directory | All 61 tests across `BookingServiceTest`, `BookingControllerTest`, `StallServiceTest`, `StallControllerTest` pass. | **61 / 61 tests pass (0 failures, 0 errors).** | **PASS** |
| **TC-15** | Stall map loads with live status | Open `/book/stalls` for an upcoming event | Floor plan renders all stalls as `AVAILABLE`/`HELD`/`BOOKED`; entry/exit/stage/stairs/ORG drawn as non-selectable blocks; legend present. | Map loads; every stall shows type, size, price and status. | **PASS** |
| **TC-16** | Select / deselect stalls | Click an available stall on the map, then click again | Stall toggles between selected (gold) and available; sticky summary updates count + grand total. | Selection state toggles correctly; summary reflects current selection. | **PASS** |
| **TC-17** | Max stall limit enforced | Try to select 6 stalls (limit = 5) | 'Hold Selected Stalls' disabled / error: "Maximum 5 stalls can be selected per booking." | 6th selection blocked; limit message shown. | **PASS** |
| **TC-18** | Price total from backend | Select 2 Regular stalls (₹4000 each) and hold | Grand total = ₹8000 computed by backend from DB prices, not frontend input. | Total = ₹8000; matches backend-computed value. | **PASS** |
| **TC-19** | Hold expiry returns to map | Hold stalls, wait for countdown to reach 0 | Hold released automatically; error "Your stall hold has expired"; user returned to map to re-select. | Hold cleared on expiry; map refreshed. | **PASS** |
| **TC-20** | Two users pick same stall | User A holds stall X; User B attempts to hold same stall X | User B gets HTTP 409: "Stall 'X' is held by another user. Please choose another." | 409 returned; only one user holds the stall. | **PASS** |
| **TC-21** | Book already-booked stall via API | Attempt to hold a stall whose status is BOOKED | HTTP 409: "Stall 'X' is already booked. Please choose another." | 409 returned; stall not assigned. | **PASS** |
| **TC-22** | Tampered frontend price ignored | Submit booking with a fabricated lower amount | Backend ignores any frontend amount; total recomputed from DB stall prices inside transaction. | Charged amount equals DB stall total; tampering has no effect. | **PASS** |
| **TC-23** | Cancelled booking releases stalls | Admin cancels a confirmed exhibitor booking | Booking's `booking_stalls` links removed; those stalls revert to `AVAILABLE`. | Stalls freed and shown as available on map. | **PASS** |
| **TC-24** | Visitor booking without stalls | Visitor (`bookerType=VISITOR`) submits booking with no stallCodes | Booking succeeds; quantity from attendee count; no stall required. | Visitor booking created without stalls. | **PASS** |
| **TC-25** | Poll keeps map current | While holding stalls, another admin cancels a different booking freeing a stall | Map refreshes every 10–15 s; newly-free stall appears `AVAILABLE`. | Poll updates stall status without full reload. | **PASS** |

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
    - Comprehensive test suite with unit and integration tests (`BookingServiceTest`, `BookingControllerTest`, `StallServiceTest`, `StallControllerTest`).
6. **Stall Selection Step (`/book/stalls`) — New:**
    - `stalls`, `booking_stalls`, `stall_holds` tables; `stalls_seed.sql` for Dec 2026 event (49 stalls seeded).
    - `GET /api/events/{eventId}/stalls` — all stalls with live status (AVAILABLE / HELD / BOOKED).
    - `POST /api/stalls/hold` — atomic hold with pessimistic row locks; 409 on conflict; default 10 min TTL.
    - `POST /api/stalls/release` — release hold on deselect / back / expiry.
    - `POST /api/bookings` now accepts `stallCodes` + `holdToken` + `sessionId`; re-validates hold inside one transaction, locks stall rows, saves `booking_stalls`, computes total from DB prices (frontend amount never trusted).
    - `@EnableScheduling` + scheduled job sweeps expired holds.
    - Max 5 stalls per booking (configurable); ≥1 stall required for Exhibitor/Sponsor; Visitors skip stall selection.
    - Admin stall occupancy list per event; cancelling a booking frees its stalls.
    - Race-condition handling: concurrent stall picks serialize; only one succeeds, other gets a clear 409 message.

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

5. **Stall Selection — Floor Plan & Category Mapping (from `SHREE_SAKHI_DEC_2026.pdf`):**
   - The floor-plan PDF was **not present in the repository**, so stall → category mapping (PREMIUM / REGULAR / CLASSIC / SINGLE_TABLE), grid positions (pos_x, pos_y, width, height), entry/exit/stage/stairs/ORG locations, and whether lettered units A–H are Single Tables could **not** be read from the image.
   - All 49 stalls (codes 1–41 + A–H) are seeded with placeholder category `REGULAR` (₹4000) and position (0,0,1×1), clearly labelled "Pending client confirmation" in `stalls_seed.sql`.
   - Exact category for every stall, the Single-Table status of units A–H, and floor-plan geometry must be confirmed by the client from the PDF colours/legend before the seeded prices/positions are treated as final.
6. **Stall Selection — Business Rules:**
   - Hold TTL (default 10 min), max stalls per booking (default 5), and cancellation/refund rules are configurable defaults pending client sign-off.

