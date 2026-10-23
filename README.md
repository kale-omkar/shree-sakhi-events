# Shree Sakhi Events

Full-stack event management and registration web application built for Shree Sakhi Events (Nashik). The platform provides a public-facing website for discovering upcoming and past events, registering attendees, and a dedicated admin portal to manage events.

---

## Tech Stack

- **Frontend**: React 19, React Router v7, Vite, Vanilla CSS
- **Backend**: Java 21, Spring Boot 3.3.4, Spring Data JPA, Hibernate, Lombok
- **Database**: MySQL 8.0+
- **Build Tools**: Maven (wrapper included), npm

---

## Architecture & Features

### Public Portal
- **Home (`/`)**: Overview with banner, highlights, and featured events showcase.
- **Upcoming Events (`/events/upcoming`)**: Filter by category, real-time countdown to event date, and seat availability indicators.
- **Past Events (`/events/past`)**: Portfolio timeline of completed events with image gallery and lightbox viewer.
- **Event Details (`/events/:id`)**: Agenda, venue information, capacity status, and registration entry point.
- **Event Registration (`/register/:id`)**: Registration form with validation, attendee count selection, and instant confirmation code generation (`SSE-2026-XXXX`).
- **About (`/about`)**: Company profile, mission, team, and contact info.

### Admin Portal (`/admin`)
- Accessible via `/admin` in the frontend (uses admin key header for API verification).
- Dashboard overview showing total events, upcoming count, past count, and total registrations.
- Event management: create, update, delete (with cascade removal of registrations), and toggle featured status.
- Input validation with date guards to prevent scheduling events in the past.

---

## Project Structure

```text
event-management-website/
├── backend/
│   ├── src/main/java/com/sakhievents/
│   │   ├── config/              # CORS and web configuration
│   │   ├── controller/          # REST endpoints (Public & Admin)
│   │   ├── dto/                 # Request/Response data transfer objects
│   │   ├── exception/           # Centralized exception handling
│   │   ├── model/               # JPA entities (Event, Registration)
│   │   ├── repository/          # Spring Data JPA repositories
│   │   ├── service/             # Business logic and database operations
│   │   └── SakhiEventsApplication.java
│   ├── src/main/resources/
│   │   └── application.properties
│   ├── .env.example             # Backend-specific template
│   ├── pom.xml
│   └── mvnw / mvnw.cmd
│
├── frontend/
│   ├── src/
│   │   ├── api/                 # Axios/Fetch API wrappers (public & admin)
│   │   ├── components/          # Reusable UI components (Navbar, EventCard, EventGallery)
│   │   ├── pages/               # Route pages (Home, Events, Details, Register, Admin, About)
│   │   ├── App.jsx              # Routes configuration
│   │   ├── main.jsx             # Entry point
│   │   └── index.css            # Base styles and variables
│   ├── package.json
│   └── vite.config.js
│
├── .env.example                 # Root environment template
├── .gitignore
└── README.md
```

---

## Setup & Running Locally

### Prerequisites
- JDK 17 or 21 installed and added to `PATH`
- Node.js 18+ and npm
- MySQL 8.0+ running locally

### 1. Database & Environment Setup
Ensure MySQL is running and create the database if it doesn't exist:

```sql
CREATE DATABASE IF NOT EXISTS sakhi_events_db;
```

Copy the `.env.example` file to create your local `.env`:

```bash
# On Linux/macOS
cp .env.example .env

# On Windows PowerShell
copy .env.example .env
```

Open `.env` and configure your local MySQL password and settings:

```env
SERVER_PORT=8080
DB_URL=jdbc:mysql://localhost:3306/sakhi_events_db?createDatabaseIfNotExist=true&useSSL=false&serverTimezone=Asia/Kolkata&allowPublicKeyRetrieval=true
DB_USERNAME=root
DB_PASSWORD=your_mysql_password
admin.api.key=sakhi-admin-2026
```

### 2. Run Backend
From the root directory:

```bash
cd backend
# Windows
.\mvnw.cmd spring-boot:run

# Linux / macOS
./mvnw spring-boot:run
```

- Server runs at: `http://localhost:8080`
- Tables are created automatically via Hibernate (`ddl-auto=update`), and initial sample events will be seeded on first run.

### 3. Run Frontend
In a separate terminal:

```bash
cd frontend
npm install
npm run dev
```

- Web app runs at: `http://localhost:5173`

---

## REST API Reference

All responses return a standard envelope:
```json
{
  "success": true,
  "message": "Status description",
  "data": { ... }
}
```

### Public Endpoints

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/events` | List all events |
| `GET` | `/api/events/{id}` | Get event details by ID |
| `GET` | `/api/events/upcoming` | List upcoming events |
| `GET` | `/api/events/past` | List completed events |
| `GET` | `/api/events/featured` | List featured events |
| `GET` | `/api/events/category/{category}` | Filter events by category |
| `GET` | `/api/events/search?keyword={kw}` | Search events by text |
| `POST` | `/api/registrations` | Register for an event |
| `GET` | `/api/registrations/confirm/{code}` | Get registration by confirmation code |
| `GET` | `/api/registrations/event/{eventId}` | Get attendees for an event |

### Admin Endpoints
*Requires header: `X-Admin-Key: sakhi-admin-2026`*

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/admin/events` | Create a new event |
| `PUT` | `/api/admin/events/{id}` | Update an existing event |
| `DELETE` | `/api/admin/events/{id}` | Delete event (cascades linked registrations) |
| `PATCH` | `/api/admin/events/{id}/toggle-featured` | Toggle event featured flag |

---

## Verification & Build

To test frontend production build:
```bash
cd frontend
npm run build
```

To package the backend:
```bash
cd backend
.\mvnw.cmd clean package -DskipTests
```
