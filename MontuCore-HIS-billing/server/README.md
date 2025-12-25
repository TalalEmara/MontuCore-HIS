# MontuCore HIS Backend

Express + Prisma (PostgreSQL/Supabase) backend for MontuCore HIS. Organized by domain modules with shared storage helpers.

## Tech Stack
- Node.js, Express
- Prisma ORM (PostgreSQL / Supabase)
- JWT auth, bcrypt password hashing
- Supabase storage (PACS images)

## Module Layout (server/src/modules)
- auth/ — login, register
- appointments/ — scheduling logic & validation
- cases/ — case CRUD and filters
- treatments/ — treatments per case/athlete
- imaging/ — exams + PACS controllers
- lab_tests/ — lab tests per case/athlete
- sessions/ — physio sessions
- billing/ — billing endpoints
- aggregators/
  - Physician_Dashboard/ — clinician dashboard
  - Athlete_Dashboard/ — athlete dashboard

## Shared Services (server/src/)
- storage/supabase.service.ts — Supabase storage client (public URLs, signed uploads, file deletion)

## Routes
- /api/auth — auth.routes
- /api/cases — case.routes
- /api/imaging — imaging.routes
- /api/appointments — appointment.routes
- /api/sessions — session.routes
- /api/billing — billing.routes
- /api/treatments — treatment.routes (NEW)
- /api/exams — exam.routes (NEW)
- /api/lab-tests — labtest.routes (NEW)
- /api/dashboard/physician/:clinicianId — clinician dashboard
- /api/dashboard/athlete/:athleteId — athlete dashboard

## Dashboards
### Physician Dashboard
`GET /api/dashboard/physician/:clinicianId`
- Returns first page of all data
- Today's appointments
- Critical cases
- Active cases (first page)

**For pagination of active cases, use:**
- `GET /api/cases?clinicianId=X&status=ACTIVE&page=2`
- `GET /api/cases?clinicianId=X&severity=CRITICAL&page=2`

### Athlete Dashboard (Initial Load)
`GET /api/dashboard/athlete/:athleteId`
- Returns first page of all data
- Upcoming appointments
- Report: cases for athlete
- Prescriptions: treatments (first page)
- Imaging: exams (first page)
- Tests: lab tests (first page)

**For pagination of individual tables, use dedicated endpoints:**
- Prescriptions: `GET /api/treatments?athleteId=X&page=2`
- Imaging: `GET /api/exams?athleteId=X&page=2`
- Tests: `GET /api/lab-tests?athleteId=X&page=2`

## Service Highlights
### Appointments
- `getAppointments(filters)` — base with status/date/clinician/athlete + pagination
- `getTodaysAppointmentsByClinicianId`, `getUpcomingAppointmentsByAthleteId`

### Cases
- `getCases(filters)` — base with clinician/athlete/status/severity/date + pagination
- `getCasesByAthleteId` wrapper

### Exams (imaging)
- `getExams(filters)` — base with case/athlete/modality/status/date + pagination
- Wrappers: `getExamsByAthleteId`, `getExamsByCaseId`
- Route: `GET /api/exams?athleteId=X&page=1&limit=10`

### Lab Tests
- `getLabTests(filters)` — base with case/athlete/status/category/date + pagination
- Wrappers: `getLabTestsByAthleteId`, `getLabTestsByCaseId`
- Route: `GET /api/lab-tests?athleteId=X&page=1&limit=10`

### Treatments
- `getTreatments(filters)` — base with case/athlete/type/date + pagination
- Wrappers: `getTreatmentsByAthleteId`, `getTreatmentsByCaseId`
- Route: `GET /api/treatments?athleteId=X&page=1&limit=10`

## Storage
- Supabase client in imaging/supabase.service.ts
- Helpers: public URL creation, signed upload URL, delete

## Running
```bash
pnpm install
pnpm dev
```

## Organization Notes
- **Storage:** Supabase client moved to `src/storage/` for reusability across modules (imaging, potential future file uploads)
- **Lab tests:** Separate from imaging (`lab_tests/`) since they target different tables
- **Imaging:** PACS controllers + exam services live together in `imaging/`
- **Service pattern:** Base functions with filters + pagination; thin wrappers for common queries keep controllers simple
