-- Script to populate Case ID 21 with sample data
-- Case belongs to Athlete ID 16 and Clinician ID 8
-- This script adds treatments, completed lab tests, exams (without DICOM), and appointments

-- ===========================================
-- TREATMENTS FOR CASE 21
-- ===========================================

INSERT INTO "treatments" ("case_id", "type", "description", "provider_name", "cost", "date") VALUES
(21, 'Medication', 'Prescribed anti-inflammatory medication for pain management', 'Internal Pharmacy', 45.00, NOW() - INTERVAL '30 days'),
(21, 'Physical Therapy', 'Initial physiotherapy session focusing on knee strengthening exercises', 'Sports Rehab Center', 120.00, NOW() - INTERVAL '25 days'),
(21, 'Injection', 'Corticosteroid injection for inflammation reduction', 'Orthopedic Clinic', 250.00, NOW() - INTERVAL '20 days'),
(21, 'Surgery', 'Arthroscopic knee surgery for ACL reconstruction', 'City General Hospital', 3500.00, NOW() - INTERVAL '15 days'),
(21, 'Physical Therapy', 'Post-operative rehabilitation program', 'Sports Rehab Center', 120.00, NOW() - INTERVAL '10 days');

-- ===========================================
-- COMPLETED LAB TESTS FOR CASE 21
-- ===========================================

INSERT INTO "lab_tests" ("case_id", "test_name", "category", "status", "result_values", "lab_technician_notes", "sample_date", "cost") VALUES
(21, 'Complete Blood Count (CBC)', 'Hematology', 'COMPLETED', '{"WBC": 7.2, "RBC": 4.8, "Hemoglobin": 14.5, "Hematocrit": 42.1, "Platelets": 285000}', 'All hematological parameters within normal range. No signs of infection or anemia.', NOW() - INTERVAL '28 days', 65.00),
(21, 'C-Reactive Protein (CRP)', 'Inflammation', 'COMPLETED', '{"CRP": 12.3}', 'Elevated CRP level indicating inflammation, consistent with injury diagnosis.', NOW() - INTERVAL '28 days', 45.00),
(21, 'Lipid Profile', 'Cardiovascular', 'COMPLETED', '{"Total Cholesterol": 185, "HDL": 55, "LDL": 110, "Triglycerides": 95}', 'Lipid profile within normal limits. No cardiovascular risk factors identified.', NOW() - INTERVAL '21 days', 85.00),
(21, 'Liver Function Tests', 'Hepatic', 'COMPLETED', '{"ALT": 28, "AST": 25, "ALP": 85, "Total Bilirubin": 0.8}', 'All liver enzymes within normal range. No hepatic dysfunction detected.', NOW() - INTERVAL '21 days', 75.00),
(21, 'Electrolyte Panel', 'Metabolic', 'COMPLETED', '{"Sodium": 140, "Potassium": 4.2, "Chloride": 102, "Calcium": 9.8}', 'Electrolyte levels within normal range. Good hydration status.', NOW() - INTERVAL '14 days', 55.00),
(21, 'Erythrocyte Sedimentation Rate (ESR)', 'Inflammation', 'COMPLETED', '{"ESR": 18}', 'Mildly elevated ESR, consistent with post-surgical inflammation.', NOW() - INTERVAL '7 days', 35.00);

-- ===========================================
-- COMPLETED EXAMS FOR CASE 21 (WITHOUT DICOM)
-- ===========================================

INSERT INTO "exams" ("case_id", "modality", "body_part", "status", "scheduled_at", "performed_at", "radiologist_notes", "conclusion", "cost") VALUES
(21, 'MRI', 'Knee', 'COMPLETED', NOW() - INTERVAL '35 days', NOW() - INTERVAL '34 days', 'MRI examination of the right knee shows complete ACL tear with associated bone bruising. Meniscus appears intact.', 'Complete ACL rupture with positive pivot shift. Surgical intervention recommended.', 450.00),
(21, 'X-RAY', 'Knee', 'COMPLETED', NOW() - INTERVAL '35 days', NOW() - INTERVAL '34 days', 'AP and lateral views of right knee show no fractures. Joint space appears normal.', 'No acute fractures or dislocations. Soft tissue injury suspected.', 120.00),
(21, 'CT', 'Knee', 'COMPLETED', NOW() - INTERVAL '14 days', NOW() - INTERVAL '13 days', 'Post-operative CT scan shows proper tunnel placement and graft positioning. No complications noted.', 'ACL reconstruction appears successful with good graft integration.', 380.00),
(21, 'MRI', 'Knee', 'COMPLETED', NOW() - INTERVAL '7 days', NOW() - INTERVAL '6 days', 'Follow-up MRI shows healing ACL graft with good signal characteristics. No signs of re-rupture.', 'Excellent healing progress. Continue rehabilitation protocol.', 450.00),
(21, 'ULTRASOUND', 'Knee', 'COMPLETED', NOW() - INTERVAL '3 days', NOW() - INTERVAL '3 days', 'Dynamic ultrasound shows stable ACL graft with normal tension. Range of motion improving.', 'Graft integrity confirmed. Patient progressing well in rehabilitation.', 180.00);

-- ===========================================
-- PHYSIOTHERAPY PROGRAMS FOR CASE 21
-- ===========================================

INSERT INTO "physio_programs" ("case_id", "title", "number_of_sessions", "sessions_completed", "start_date", "weekly_repetition", "cost_per_session") VALUES
(21, 'ACL Reconstruction Rehabilitation Program - Phase 1', 12, 12, NOW() - INTERVAL '25 days', 3, 85.00),
(21, 'ACL Reconstruction Rehabilitation Program - Phase 2', 16, 8, NOW() - INTERVAL '10 days', 4, 90.00),
(21, 'Return to Sport Conditioning Program', 8, 2, NOW() - INTERVAL '5 days', 2, 95.00);

-- ===========================================
-- APPOINTMENTS FOR CASE 21
-- ===========================================

INSERT INTO "appointments" ("athlete_id", "clinician_id", "case_id", "scheduled_at", "height", "weight", "status", "diagnosis_notes") VALUES
(16, 8, 21, NOW() - INTERVAL '40 days', 178.0, 75.5, 'COMPLETED', 'Initial consultation: Right knee pain after soccer injury. Suspected ACL tear. MRI ordered.'),
(16, 8, 21, NOW() - INTERVAL '30 days', 178.0, 75.0, 'COMPLETED', 'Follow-up after MRI: Confirmed complete ACL rupture. Discussed surgical options and rehabilitation plan.'),
(16, 8, 21, NOW() - INTERVAL '25 days', 178.0, 74.5, 'COMPLETED', 'Pre-operative assessment. Patient cleared for surgery. Physical therapy initiated.'),
(16, 8, 21, NOW() - INTERVAL '20 days', 178.0, 74.0, 'COMPLETED', 'Post-operative day 1 check: Surgery successful. Pain well controlled. Discharge planning initiated.'),
(16, 8, 21, NOW() - INTERVAL '15 days', 178.0, 73.5, 'COMPLETED', 'Post-operative week 1: Wound healing well. Started formal rehabilitation program.'),
(16, 8, 21, NOW() - INTERVAL '10 days', 178.0, 73.0, 'COMPLETED', 'Rehabilitation progress assessment: Good compliance with exercises. Range of motion improving.'),
(16, 8, 21, NOW() - INTERVAL '5 days', 178.0, 72.5, 'COMPLETED', 'Month 1 follow-up: Significant improvement in strength and function. Continue therapy.'),
(16, 8, 21, NOW() - INTERVAL '1 day', 178.0, 72.0, 'COMPLETED', 'Final rehabilitation assessment: Excellent recovery. Return to sport clearance granted.');

-- ===========================================
-- VERIFICATION QUERIES
-- ===========================================

-- Uncomment the queries below to verify the data was inserted correctly:

-- SELECT 'Treatments' as table_name, COUNT(*) as count FROM treatments WHERE case_id = 21
-- UNION ALL
-- SELECT 'Lab Tests' as table_name, COUNT(*) as count FROM lab_tests WHERE case_id = 21
-- UNION ALL
-- SELECT 'Exams' as table_name, COUNT(*) as count FROM exams WHERE case_id = 21
-- UNION ALL
-- SELECT 'Appointments' as table_name, COUNT(*) as count FROM appointments WHERE case_id = 21
-- UNION ALL
-- SELECT 'Physio Programs' as table_name, COUNT(*) as count FROM physio_programs WHERE case_id = 21;

-- SELECT c.id, c.diagnosis_name, c.status, u.full_name as athlete_name, cl.full_name as clinician_name
-- FROM cases c
-- JOIN users u ON c.athlete_id = u.id
-- JOIN users cl ON c.managing_clinician_id = cl.id
-- WHERE c.id = 21;

COMMIT;