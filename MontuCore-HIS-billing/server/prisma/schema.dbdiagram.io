// Use DBML to define your database structure
// Docs: https://dbml.dbdiagram.io/docs

Table users {
  id integer [primary key, increment]
  email varchar [unique, not null]
  password_hash varchar [not null]
  full_name varchar [not null]
  date_of_birth timestamp
  phone_number varchar
  gender varchar
  role varchar [not null, default: 'ATHLETE', note: 'ADMIN | CLINICIAN | ATHLETE']
  created_at timestamp [default: `now()`]
}

Table athlete_profiles {
  id integer [primary key, increment]
  user_id integer [unique, not null, ref: > users.id]
  position varchar
  jersey_number integer
}

Table clinician_profiles {
  id integer [primary key, increment]
  user_id integer [unique, not null, ref: > users.id]
  specialty varchar
}

Table appointments {
  id integer [primary key, increment]
  athlete_id integer [not null, ref: > users.id]
  clinician_id integer [not null, ref: > users.id]
  case_id integer [ref: > cases.id, note: 'Link to the case this appointment belongs to (for follow-up appointments)']
  scheduled_at timestamp [not null]
  height float
  weight float
  status varchar [not null, default: 'SCHEDULED', note: 'SCHEDULED | COMPLETED | CANCELLED']
  diagnosis_notes text
}

Table cases {
  id integer [primary key, increment]
  athlete_id integer [not null, ref: > users.id]
  managing_clinician_id integer [not null, ref: > users.id]
  initial_appointment_id integer [ref: > appointments.id, note: 'The appointment where this case was first detected/diagnosed']
  diagnosis_name varchar [not null]
  icd10_code varchar
  injury_date timestamp [not null, default: `now()`]
  status varchar [not null, default: 'ACTIVE', note: 'ACTIVE | RECOVERED']
  severity varchar [not null, default: 'MILD', note: 'MILD | MODERATE | SEVERE | CRITICAL']
  medical_grade varchar
}

Table exams {
  id integer [primary key, increment]
  case_id integer [not null, ref: > cases.id]
  modality varchar [not null, note: 'MRI | CT | X-RAY | ULTRASOUND']
  body_part varchar [not null]
  status varchar [not null]
  scheduled_at timestamp
  performed_at timestamp
  radiologist_notes text
  conclusion text
  cost float
}

Table pacs_images {
  id integer [primary key, increment]
  exam_id integer [not null, ref: > exams.id]
  file_name varchar [not null]
  supabase_path varchar [not null]
  public_url varchar [not null]
  uploaded_at timestamp [not null, default: `now()`]
}

Table lab_tests {
  id integer [primary key, increment]
  case_id integer [not null, ref: > cases.id]
  test_name varchar [not null]
  category varchar
  status varchar [not null, default: 'PENDING', note: 'PENDING | COMPLETED | CANCELLED']
  result_pdf_url varchar
  result_values json
  lab_technician_notes text
  sample_date timestamp
  cost float
}

Table treatments {
  id integer [primary key, increment]
  case_id integer [not null, ref: > cases.id]
  type varchar [not null]
  description text [not null]
  provider_name varchar
  cost float
  date timestamp [not null, default: `now()`]
}

Table physio_programs {
  id integer [primary key, increment]
  case_id integer [not null, ref: > cases.id]
  title varchar [not null]
  number_of_sessions integer [not null]
  sessions_completed integer [not null, default: 0]
  start_date timestamp [not null]
  weekly_repetition integer [not null]
  cost_per_session float
}

// Relationships Summary:
// 1. User has one AthleteProfile (1:1)
// 2. User has one ClinicianProfile (1:1)
// 3. User (as Athlete) has many Appointments (1:N)
// 4. User (as Clinician) has many Appointments (1:N)
// 5. User (as Athlete) has many Cases (1:N)
// 6. User (as Managing Clinician) has many Cases (1:N)
// 7. Case has one Initial Appointment (N:1) - Tracks where case was first detected
// 8. Case has many Follow-up Appointments (1:N) - Subsequent appointments for the case
// 9. Case has many Exams (1:N)
// 10. Case has many LabTests (1:N)
// 11. Case has many Treatments (1:N)
// 12. Case has many PhysioPrograms (1:N)
// 13. Exam has many PACSImages (1:N)
