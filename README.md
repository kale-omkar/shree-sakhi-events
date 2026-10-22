# Shree Sakhi Events — Web Platform

> A modern, premium full-stack event management and registration web application developed for **Shree Sakhi Events** (Nashik, Maharashtra). Built to showcase events, promote women entrepreneurship exhibitions, and enable seamless attendee registrations.

---

## 🌟 Key Features

### 🎨 Frontend (React + Vite)
- **Hero & Brand Identity**: Custom, handcrafted aesthetic tailored for Shree Sakhi Events with smooth gradients, glassmorphism, and responsive layout.
- **Event Discovery & Exploration**:
  - Filter events by tabs (**All**, **Upcoming**, **Past**).
  - Category filters (**Exhibition**, **Cultural**, **Workshop**, etc.).
  - Instant live keyword search.
- **Detailed Event Pages**:
  - Highlights list, tag clouds, venue details, and contact information.
  - Live capacity progress bar and real-time registration status tags.
- **Event Registration System**:
  - Registration form with real-time field validation.
  - Custom attendee count selector (1–10 attendees).
  - Instant unique confirmation code generation (e.g., `SSE-2026-XXXX`).
  - Mobile-responsive design and error boundary feedback.

### ⚙️ Backend (Spring Boot 3 + MySQL)
- **RESTful API**: Clean REST architecture with standard `ApiResponse<T>` envelope.
- **Database Persistence**: Spring Data JPA & Hibernate ORM targeting MySQL 8.0.
- **Automatic Seed Data**: Auto-populates demo events (e.g., *Nashik Mahila Udyog Mela 2026*, *Sakhi Navratri Utsav*) on initial startup.
- **Environment Driven**: Native zero-dependency `.env` file loader for safe, configurable database credentials.
- **Validation & Exception Handling**: Centralized `GlobalExceptionHandler` with field-level validation error responses.
- **CORS Configured**: Ready for frontend communication on `http://localhost:5173`.

---

## 🛠️ Technology Stack

| Layer | Technologies |
| :--- | :--- |
| **Frontend** | React 19, Vite, React Router DOM 7, Vanilla CSS Design System |
| **Backend** | Java 21, Spring Boot 3.3.4, Spring Web, Spring Data JPA, Hibernate, Lombok |
| **Database** | MySQL 8.0+ |
| **Configuration** | Native `.env` reader, `application.properties` |

---

## 📂 Project Structure

```text
event-management-website/
├── .env.example                # Safe environment variables template
├── .env                        # Local database credentials (ignored by git)
├── .gitignore                  # Git ignore rules for sensitive files and builds
├── README.md                   # Project documentation
│
├── frontend/                   # React + Vite application
│   ├── public/
│   │   └── favicon.svg         # Brand favicon
│   ├── src/
│   │   ├── api/
│   │   │   └── eventsApi.js    # API integration services
│   │   ├── components/
│   │   │   ├── Navbar.jsx      # Navigation bar & mobile menu
│   │   │   └── EventCard.jsx   # Event card component
│   │   ├── pages/
│   │   │   ├── HomePage.jsx    # Landing page
│   │   │   ├── EventsPage.jsx  # Event directory & search
│   │   │   ├── EventDetailPage.jsx # Individual event details
│   │   │   └── RegisterPage.jsx# Registration form & confirmation
│   │   ├── index.css           # Global design system & theme variables
│   │   ├── App.jsx             # React Router route definitions
│   │   └── main.jsx            # React root mount
│   ├── package.json
│   └── vite.config.js
│
└── backend/                    # Spring Boot REST API
    ├── .env                    # Backend-specific environment variables
    ├── pom.xml                 # Maven configuration and dependencies
    └── src/
        └── main/
            ├── java/com/sakhievents/
            │   ├── SakhiEventsApplication.java # Spring Boot entry + .env loader
            │   ├── config/     # CORS and application configs
            │   ├── controller/ # EventController, RegistrationController
            │   ├── dto/        # Request and Response DTOs
            │   ├── exception/  # Global exception handling
            │   ├── model/      # Event & Registration JPA entities
            │   ├── repository/ # Spring Data JPA repositories
            │   └── service/    # Business logic & seed data service
            └── resources/
                └── application.properties # Dynamic Spring datasource config
```

---

## 🚀 Getting Started

### 1. Prerequisites
Ensure you have the following installed on your system:
- **Java Development Kit (JDK) 21**
- **Node.js 18+** & **npm**
- **MySQL Server 8.0+**

---

### 2. Configure Environment Variables

Create a `.env` file in the project root or in `backend/.env` (you can copy `.env.example`):

```env
# MySQL Database Connection URL
DB_URL=jdbc:mysql://localhost:3306/sakhi_events_db?createDatabaseIfNotExist=true&useSSL=false&serverTimezone=Asia/Kolkata&allowPublicKeyRetrieval=true

# Database Credentials
DB_USERNAME=root
DB_PASSWORD=your_mysql_password_here

# Server Port
SERVER_PORT=8080
```

> **Note:** The database `sakhi_events_db` will be created automatically on startup if it doesn't already exist.

---

### 3. Run the Backend (Spring Boot)

Open a terminal in the `backend/` directory:

#### **Git Bash / Linux / macOS:**
```bash
cd backend
./mvnw spring-boot:run
```

#### **Windows PowerShell / Command Prompt:**
```powershell
cd backend
.\mvnw.cmd spring-boot:run
```

- **Backend API URL:** `http://localhost:8080`
- On startup, tables will be automatically created and seeded with sample events.

---

### 4. Run the Frontend (React + Vite)

Open a second terminal in the `frontend/` directory:

```bash
cd frontend
npm install
npm run dev
```

- **Frontend Application URL:** `http://localhost:5173`

---

## 📡 REST API Reference

All responses follow the standard JSON structure:
```json
{
  "success": true,
  "message": "Operation description",
  "data": { ... }
}
```

### Event Endpoints

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/events` | Retrieve all events |
| `GET` | `/api/events/{id}` | Retrieve event by ID |
| `GET` | `/api/events/upcoming` | Retrieve all upcoming events |
| `GET` | `/api/events/past` | Retrieve all past events |
| `GET` | `/api/events/featured` | Retrieve featured events |
| `GET` | `/api/events/search?keyword={kw}` | Search events by title, description, or tags |

### Registration Endpoints

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `POST` | `/api/registrations` | Register attendees for an event |
| `GET` | `/api/registrations/confirm/{code}` | Retrieve registration by confirmation code |

#### Sample Registration Payload:
```json
{
  "eventId": 1,
  "fullName": "Priya Sharma",
  "email": "priya.sharma@example.com",
  "phone": "9876543210",
  "city": "Nashik",
  "organization": "Women Artisans Forum",
  "numberOfAttendees": 2,
  "remarks": "Interested in stall booking"
}
```

---

## 🔒 Security & Git Practices

- Passwords and database credentials are stored exclusively in `.env` files.
- All `.env` files, build output (`target/`, `dist/`), and `node_modules/` are strictly ignored in `.gitignore`.
- Always use `.env.example` as a template when deploying or sharing the codebase.

