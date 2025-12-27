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

## 📷 Exams & Imaging Routes (`/api/exams` and `/api/imaging`)

### Exams Routes (`/api/exams`)

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/` | Get exams with filters and pagination | Public |
| POST | `/` | Create exam (optional DICOM upload) | Public |
| POST | `/with-multiple-dicoms` | Create exam with multiple DICOM uploads | Public |
| GET | `/:id` | Get exam by ID | Public |
| PUT | `/:id` | Update exam | Public |
| POST | `/:id/upload` | Upload DICOM to existing exam | Public |
| POST | `/:id/complete` | Mark exam as completed | Public |

**GET /api/exams Query Parameters:**
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 10)
- `athleteId`: Filter by athlete ID
- `caseId`: Filter by case ID
- `modality`: Filter by modality (MRI, CT, X-RAY, etc.)
- `status`: Filter by status (ORDERED, COMPLETED, CANCELLED)

**POST /api/exams (Create Exam)**
```typescript
Content-Type: multipart/form-data

// Required fields
caseId: number
modality: string  // 'MRI', 'CT', 'X-RAY', 'Ultrasound', 'PET', 'DEXA'
bodyPart: string  // 'Knee', 'Shoulder', 'Head', etc.

// Optional fields
status: 'ORDERED' | 'COMPLETED' | 'CANCELLED'  // Default: 'ORDERED'
scheduledAt: Date
performedAt: Date
radiologistNotes: string
conclusion: string
cost: number
dicomFile: File  // Optional DICOM file (auto-completes exam)
```

**POST /api/exams/with-multiple-dicoms (Create Exam with Multiple DICOMs)**
```typescript
Content-Type: multipart/form-data

// Required fields
caseId: number
modality: string  // 'MRI', 'CT', 'X-RAY', 'Ultrasound', 'PET', 'DEXA'
bodyPart: string  // 'Knee', 'Shoulder', 'Head', etc.

// Optional fields
status: 'ORDERED' | 'COMPLETED' | 'CANCELLED'  // Default: 'ORDERED'
scheduledAt: Date
performedAt: Date
radiologistNotes: string
conclusion: string
cost: number
dicomFiles: File[]  // Array of DICOM files (auto-completes exam if provided)

// Multiple files: Use same field name 'dicomFiles' for each file
// First DICOM's metadata populates exam fields
// All files uploaded to: scans/case_{caseId}/exam_{timestamp}/{filename}
```

**POST /api/exams/:id/upload (Upload DICOM)**
```typescript
Content-Type: multipart/form-data

dicomFile: File  // Required DICOM file
// Auto-sets status to COMPLETED
// Multiple DICOMs allowed per exam (creates separate PACS image records)
```

**POST /api/exams/:id/complete (Mark Exam Completed)**
```typescript
Content-Type: application/json

{}  // Empty body
// Manually marks exam as COMPLETED
// Sets performedAt if not already set
```

### Imaging Routes (`/api/imaging`)

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/upload` | Upload single DICOM scan | Public |
| POST | `/link-series` | Link DICOM series to case | Public |
| POST | `/` | Create imaging order | Required |
| GET | `/` | Get all imaging orders | Required |
| GET | `/:id` | Get imaging order by ID | Required |
| PUT | `/:id` | Update imaging order | Required |
| POST | `/:id/results` | Upload imaging results | Required |

**POST /api/imaging/upload (Single DICOM Upload)**
```typescript
Content-Type: multipart/form-data

file: File          // DICOM file (required)
caseId: number      // For new exam creation (optional)
examId: number      // Attach to existing exam (optional)

// Either caseId OR examId must be provided
// If examId provided: attaches to existing exam
// If caseId provided: creates new exam
```

**POST /api/imaging/link-series (Batch DICOM Series)**
```typescript
Content-Type: application/json

{
  "caseId": number,    // Required
  "images": [          // Required array
    {
      "fileName": string,      // Original filename
      "supabasePath": string   // Full Supabase path
    }
  ]
}
```

**Business Rules:**
- **Multiple DICOMs per exam**: Exams can have multiple DICOM files (PACS images)
- **Auto-complete**: DICOM uploads automatically set status to `COMPLETED`
- **Metadata extraction**: DICOM metadata populates exam fields (modality, bodyPart, performedAt)
- **Path validation**: Series linking validates Supabase paths follow `scans/case_{id}/exam_{timestamp}/{filename}`
- **Default status**: `ORDERED` when creating exams without DICOM

**Bruno Collection:** `Exams/`, `Imaging/`

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

