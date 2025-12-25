# Athlete Dashboard Implementation

## Overview
Athlete dashboard aggregates data from multiple tables to provide a comprehensive view of an athlete's medical information.

## Architecture

### Service Layer Structure

```
server/src/modules/
├── appointments/
│   └── appointment.service.ts       # getUpcomingAppointmentsByAthleteId()
├── cases/
│   ├── case.service.ts             # getCasesByAthleteId()
│   ├── treatment.service.ts        # getTreatmentsByAthleteId()
│   ├── exam.service.ts             # getExamsByAthleteId()
│   └── labtest.service.ts          # getLabTestsByAthleteId()
└── aggregators/
    └── Athlete_Dashboard/
        ├── dashboard.controller.ts  # Aggregates all data
        └── dashboard.routes.ts      # Route definition
```

## API Endpoint

### Get Athlete Dashboard
```http
GET /api/athlete/dashboard/:athleteId
```

**Parameters:**
- `athleteId` (path) - The ID of the athlete

**Response Structure:**
```json
{
  "success": true,
  "data": {
    "upcomingAppointments": {
      "count": 2,
      "appointments": [
        {
          "id": 1,
          "scheduledAt": "2025-12-20T10:00:00Z",
          "clinician": {
            "id": 5,
            "fullName": "Dr. John Smith",
            "role": "CLINICIAN",
            "clinicianProfile": {
              "specialty": "Orthopedic"
            }
          }
        }
      ]
    },
    "report": {
      "count": 3,
      "cases": [
        {
          "id": 10,
          "diagnosisName": "ACL Tear",
          "injuryDate": "2025-12-01T00:00:00Z",
          "status": "ACTIVE",
          "severity": "MODERATE"
        }
      ]
    },
    "prescriptions": {
      "count": 5,
      "treatments": [
        {
          "id": 20,
          "type": "Medication",
          "description": "Ibuprofen 400mg twice daily",
          "providerName": "City Hospital Pharmacy",
          "date": "2025-12-10T00:00:00Z",
          "cost": 25.50,
          "medicalCase": {
            "diagnosisName": "ACL Tear"
          }
        }
      ]
    },
    "imaging": {
      "count": 2,
      "exams": [
        {
          "id": 15,
          "modality": "MRI",
          "bodyPart": "Knee",
          "status": "IMAGING_COMPLETE",
          "scheduledAt": "2025-12-05T14:00:00Z",
          "performedAt": "2025-12-05T14:30:00Z",
          "radiologistNotes": "Grade 2 ACL tear visible",
          "conclusion": "Partial ACL tear confirmed",
          "medicalCase": {
            "diagnosisName": "ACL Tear"
          },
          "images": [
            {
              "id": 100,
              "fileName": "knee_mri_01.dcm",
              "publicUrl": "https://storage.url/knee_mri_01.dcm",
              "uploadedAt": "2025-12-05T15:00:00Z"
            }
          ]
        }
      ]
    },
    "tests": {
      "count": 3,
      "labTests": [
        {
          "id": 30,
          "testName": "Complete Blood Count",
          "category": "Hematology",
          "status": "COMPLETED",
          "resultPdfUrl": "https://storage.url/cbc_results.pdf",
          "resultValues": {
            "RBC": 5.2,
            "WBC": 7.8,
            "Hemoglobin": 14.5
          },
          "labTechnicianNotes": "All values within normal range",
          "sampleDate": "2025-12-08T09:00:00Z",
          "medicalCase": {
            "diagnosisName": "ACL Tear"
          }
        }
      ]
    }
  }
}
```

## Service Functions

### 1. Appointments Service
**Function:** `getUpcomingAppointmentsByAthleteId(athleteId: number)`
- Filters appointments where `scheduledAt >= now` and `status = 'SCHEDULED'`
- Returns: appointment id, scheduled time, clinician name, role, and specialty
- Ordered by: scheduledAt (ascending)

### 2. Cases Service
**Function:** `getCasesByAthleteId(athleteId: number)`
- Gets all cases for the athlete
- Returns: case id, diagnosis name, injury date, status, severity
- Ordered by: injuryDate (descending)
- Frontend key: **"report"**

### 3. Treatment Service
**Function:** `getTreatmentsByAthleteId(athleteId: number)`
- Gets all treatments across all athlete's cases
- Returns: treatment details with linked case diagnosis
- Ordered by: date (descending)
- Frontend key: **"prescriptions"**

### 4. Exam Service
**Function:** `getExamsByAthleteId(athleteId: number)`
- Gets all imaging exams across all athlete's cases
- Returns: exam metadata + associated images
- Includes: modality, body part, status, radiologist notes, images
- Ordered by: performedAt (descending)
- Frontend key: **"imaging"**

### 5. Lab Test Service
**Function:** `getLabTestsByAthleteId(athleteId: number)`
- Gets all lab tests across all athlete's cases
- Returns: test name, status, results (PDF and JSON values)
- Ordered by: sampleDate (descending)
- Frontend key: **"tests"**

## Implementation Pattern

### Reusable Service Functions
All service functions follow the pattern:
1. Get athlete's case IDs
2. Query related data using `caseId IN (caseIds)`
3. Include case diagnosis for context
4. Order results by most relevant date field

### Error Handling
- Validates athleteId is a valid number
- Returns 400 for invalid IDs
- Returns 500 for database errors
- All errors logged to console

### Performance Optimization
- Uses `Promise.all()` to execute all queries in parallel
- Only selects required fields (no over-fetching)
- Proper indexing on foreign keys (case_id, athlete_id)

## Usage Example

### Frontend Request
```typescript
const response = await fetch(`/api/dashboard/athlete/123`);
const data = await response.json();

// Access data with frontend-friendly keys
const reports = data.data.report.cases;
const prescriptions = data.data.prescriptions.treatments;
const imaging = data.data.imaging.exams;
const tests = data.data.tests.labTests;
```

## Related Endpoints

- Physician Dashboard: `GET /api/physician/dashboard/:clinicianId`
- Individual Case: `GET /api/cases/:caseId`
- Individual Appointment: `GET /api/appointments/:id`

## Future Enhancements

- Add pagination for large datasets
- Add date range filters
- Add status filters (active/recovered cases only)
- Add caching for frequently accessed athlete data
- Add authentication/authorization middleware
