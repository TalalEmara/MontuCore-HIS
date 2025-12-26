# API Routes - Complete Summary

## Base URL
```
{{baseURL}} = http://localhost:3000/api
```

---

## 🔐 Auth Routes (`/api/auth`)

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/register` | Register a new user | Public |
| POST | `/login` | Login user | Public |
| POST | `/logout` | Logout user | Required |
| GET | `/profile` | Get current user profile | Required |

**Bruno Collection:** `Auth/`

---

## 📋 Cases Routes (`/api/cases`)

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/` | Create a new case | Public |
| GET | `/` | Get all cases with filters | Public |
| GET | `/:id` | Get case by ID | Public |
| PATCH | `/:id` | Update case (partial) | Public |
| DELETE | `/:id` | Delete case | Public |

**Query Parameters (GET /):**
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 10)
- `status`: Filter by status (ACTIVE, RECOVERED)
- `athleteId`: Filter by athlete ID
- `clinicianId`: Filter by managing clinician ID
- `severity`: Filter by severity (CRITICAL, SEVERE, MODERATE, MILD)

**Bruno Collection:** `Cases/`

---

## 👥 Appointments Routes (`/api/appointments`)

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/create-appointment` | Create a new appointment | Public |
| PUT | `/update-appointment-status/` | Update appointment status | Public |
| GET | `/:id` | Get appointment by ID | Public |
| DELETE | `/delete-appointment/:id` | Delete appointment | Public |
| GET | `/` | Get all appointments | Public |
| GET | `/clinician/:clinicianId` | Get appointments by clinician | Public |
| GET | `/athlete/:athleteId` | Get appointments by athlete | Public |

**Query Parameters (GET /):**
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 10)
- `status`: Filter by status (SCHEDULED, COMPLETED, CANCELLED)

**Bruno Collection:** `Appointments/`

---

## 📷 Imaging/Exams Routes (`/api/imaging` or `/api/exams`)

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/upload` | Upload imaging scan (FormData) | Required |
| POST | `/` | Create a new imaging order | Required |
| GET | `/` | Get all imaging orders | Required |
| GET | `/:id` | Get imaging order by ID | Required |
| PUT | `/:id` | Update imaging order | Required |
| POST | `/:id/results` | Upload imaging results | Required |

**Alternative endpoint:** `/api/exams?page=1&limit=10`

**Query Parameters:**
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 10)
- `athleteId` (optional): Filter by athlete ID
- `caseId` (optional): Filter by case ID
- `modality` (optional): MRI, CT, X-RAY, etc.
- `status` (optional): ORDERED, IMAGING_COMPLETE, etc.

**Bruno Collection:** `Imaging/`, `Exams/`

---

## 💊 Lab Tests Routes (`/api/lab-tests`)

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/` | Get lab tests with filters | Public |

**Query Parameters:**
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 10)
- `athleteId` (optional): Filter by athlete ID
- `caseId` (optional): Filter by case ID
- `status` (optional): PENDING, COMPLETED, CANCELLED
- `category` (optional): Filter by test category

**Bruno Collection:** `LabTests/`

---

## � Consultation Sharing Routes (`/api/consults`)

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/share` | Create consultation share link | Required |
| GET | `/view/:token` | View shared consultation data | Public |

**POST /share Request Body:**
```json
{
  "athleteId": 123,
  "permissions": {
    "caseIds": [1, 2, 3],
    "examIds": [4, 5],
    "labIds": [6, 7],
    "notes": "Optional consultation notes"
  },
  "expiryHours": 48
}
```

**POST /share Response:**
```json
{
  "success": true,
  "message": "Consultation link generated successfully",
  "data": {
    "shareToken": "uuid-token-here",
    "accessCode": "123456",
    "fullLink": "http://localhost:5173/external/view/uuid-token-here",
    "expiresAt": "2025-12-27T12:00:00.000Z"
  }
}
```

**GET /view/:token Query Parameters:**
- `accessCode`: 6-digit access code (required)

**GET /view/:token Response:**
```json
{
  "success": true,
  "data": {
    "meta": {
      "sharedBy": "Dr. Smith",
      "patientName": "John Doe",
      "expiresAt": "2025-12-27T12:00:00.000Z",
      "notes": "Consultation notes"
    },
    "data": {
      "cases": [...],
      "exams": [...],
      "labs": [...]
    }
  }
}
```

**Bruno Collection:** `Consultations/`

---

## �💊 Treatments Routes (`/api/treatments`)

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/` | Get treatments with filters | Public |

**Query Parameters:**
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 10)
- `athleteId` (optional): Filter by athlete ID
- `caseId` (optional): Filter by case ID
- `type` (optional): Filter by treatment type

**Bruno Collection:** `Treatments/`

---

## 📊 Case View Routes (`/api/case-view`)

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/:caseId` | Get comprehensive case view | Public |

**Query Parameters (All Optional):**
- `appointmentsPage`: Page number for appointments (default: 1)
- `appointmentsLimit`: Items per page for appointments (default: 10)
- `treatmentsPage`: Page number for treatments (default: 1)
- `treatmentsLimit`: Items per page for treatments (default: 10)
- `examsPage`: Page number for exams (default: 1)
- `examsLimit`: Items per page for exams (default: 10)
- `labTestsPage`: Page number for lab tests (default: 1)
- `labTestsLimit`: Items per page for lab tests (default: 10)
- `table` (optional): Comma-separated sections to fetch (e.g., `appointments,treatments`)

**Response Includes:**
- `case`: Core case info with `initialAppointmentId`, athlete, clinician
- `appointments`: Paginated appointments
- `treatments`: Paginated treatments
- `exams`: Paginated exams with images
- `labTests`: Paginated lab tests
- `physioPrograms`: All physio programs (no pagination)

**Examples:**
```
GET /api/case-view/1                                    # All sections, default pagination (limit 10)
GET /api/case-view/1?table=appointments&appointmentsPage=2  # Only appointments, page 2
GET /api/case-view/1?table=appointments,exams           # Multiple tables with default pages
```

**Bruno Collection:** `Case_View/`

---

## 📅 Sessions Routes (`/api/sessions`)

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/` | Create a new session | Required |
| GET | `/` | Get all sessions | Required |
| GET | `/:id` | Get session by ID | Required |
| PUT | `/:id` | Update session | Required |
| POST | `/:id/complete` | Complete session | Required |

**Bruno Collection:** (May need to be created)

---

## 💳 Billing Routes (`/api/billing`)

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/invoices` | Create a new invoice | Required |
| GET | `/invoices` | Get all invoices | Required |
| GET | `/invoices/:id` | Get invoice by ID | Required |
| PUT | `/invoices/:id` | Update invoice | Required |
| POST | `/invoices/:id/payments` | Record payment | Required |
| GET | `/patients/:patientId/summary` | Get patient billing summary | Required |

**Bruno Collection:** (May need to be created)

---

## 📊 Dashboards Routes

### Physician Dashboard (`/api/dashboards/physician`)
- GET `/` - Get physician dashboard data

### Athlete Dashboard (`/api/dashboards/athlete`)
- GET `/` - Get athlete dashboard data

**Bruno Collection:** `Dashboards/`

---

## Notes

1. **Authentication:** Routes marked as "Required" need bearer token in header: `Authorization: Bearer {{authToken}}`
2. **Pagination:** Default is page 1, limit 10 for all list endpoints
3. **Case View:** Special aggregate endpoint that combines data from multiple tables with independent pagination per section
4. **Base URL:** All routes use `{{baseURL}}` which is typically `http://localhost:3000/api`

