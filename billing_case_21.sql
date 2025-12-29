-- Script to create detailed individual billing invoices for Case ID 21
-- This creates separate invoices for each treatment, lab test, exam, physiotherapy session, and appointment

-- ===========================================
-- INDIVIDUAL TREATMENT INVOICES
-- ===========================================

INSERT INTO "invoices" ("athlete_id", "clinician_id", "case_id", "invoice_number", "invoice_date", "due_date", "items", "subtotal", "total_amount", "status", "paid_amount", "notes", "created_by", "created_at") VALUES
(16, 8, 21, 'INV-2025-MED-001', NOW() - INTERVAL '30 days', NOW() - INTERVAL '20 days', '[{"description": "Anti-inflammatory medication prescription and dispensing", "quantity": 1, "unitPrice": 45.00, "total": 45.00}]', 45.00, 45.00, 'PAID', 45.00, 'Medication costs for initial pain management', 8, NOW() - INTERVAL '30 days'),
(16, 8, 21, 'INV-2025-PT-001', NOW() - INTERVAL '25 days', NOW() - INTERVAL '15 days', '[{"description": "Initial physiotherapy assessment and treatment session", "quantity": 1, "unitPrice": 120.00, "total": 120.00}]', 120.00, 120.00, 'PAID', 120.00, 'Pre-operative physiotherapy assessment', 8, NOW() - INTERVAL '25 days'),
(16, 8, 21, 'INV-2025-INJ-001', NOW() - INTERVAL '20 days', NOW() - INTERVAL '10 days', '[{"description": "Corticosteroid injection procedure", "quantity": 1, "unitPrice": 250.00, "total": 250.00}]', 250.00, 250.00, 'PAID', 250.00, 'Pre-operative anti-inflammatory injection', 8, NOW() - INTERVAL '20 days'),
(16, 8, 21, 'INV-2025-SURG-001', NOW() - INTERVAL '15 days', NOW() - INTERVAL '5 days', '[{"description": "Arthroscopic ACL reconstruction surgery", "quantity": 1, "unitPrice": 3500.00, "total": 3500.00}]', 3500.00, 3500.00, 'PAID', 3500.00, 'Surgical procedure for ACL reconstruction', 8, NOW() - INTERVAL '15 days'),
(16, 8, 21, 'INV-2025-PT-002', NOW() - INTERVAL '10 days', NOW(), '[{"description": "Post-operative physiotherapy rehabilitation session", "quantity": 1, "unitPrice": 120.00, "total": 120.00}]', 120.00, 120.00, 'PAID', 120.00, 'Post-operative rehabilitation therapy', 8, NOW() - INTERVAL '10 days');

-- ===========================================
-- INDIVIDUAL LAB TEST INVOICES
-- ===========================================

INSERT INTO "invoices" ("athlete_id", "clinician_id", "case_id", "invoice_number", "invoice_date", "due_date", "items", "subtotal", "total_amount", "status", "paid_amount", "notes", "created_by", "created_at") VALUES
(16, 8, 21, 'INV-2025-LAB-001', NOW() - INTERVAL '28 days', NOW() - INTERVAL '18 days', '[{"description": "Complete Blood Count (CBC) analysis", "quantity": 1, "unitPrice": 65.00, "total": 65.00}]', 65.00, 65.00, 'PAID', 65.00, 'Pre-operative hematological assessment', 8, NOW() - INTERVAL '28 days'),
(16, 8, 21, 'INV-2025-LAB-002', NOW() - INTERVAL '28 days', NOW() - INTERVAL '18 days', '[{"description": "C-Reactive Protein (CRP) inflammatory marker", "quantity": 1, "unitPrice": 45.00, "total": 45.00}]', 45.00, 45.00, 'PAID', 45.00, 'Inflammation assessment for injury diagnosis', 8, NOW() - INTERVAL '28 days'),
(16, 8, 21, 'INV-2025-LAB-003', NOW() - INTERVAL '21 days', NOW() - INTERVAL '11 days', '[{"description": "Comprehensive Lipid Profile analysis", "quantity": 1, "unitPrice": 85.00, "total": 85.00}]', 85.00, 85.00, 'PAID', 85.00, 'Cardiovascular risk assessment', 8, NOW() - INTERVAL '21 days'),
(16, 8, 21, 'INV-2025-LAB-004', NOW() - INTERVAL '21 days', NOW() - INTERVAL '11 days', '[{"description": "Liver Function Tests panel", "quantity": 1, "unitPrice": 75.00, "total": 75.00}]', 75.00, 75.00, 'PAID', 75.00, 'Hepatic function assessment', 8, NOW() - INTERVAL '21 days'),
(16, 8, 21, 'INV-2025-LAB-005', NOW() - INTERVAL '14 days', NOW() - INTERVAL '4 days', '[{"description": "Electrolyte Panel analysis", "quantity": 1, "unitPrice": 55.00, "total": 55.00}]', 55.00, 55.00, 'PAID', 55.00, 'Post-operative metabolic assessment', 8, NOW() - INTERVAL '14 days'),
(16, 8, 21, 'INV-2025-LAB-006', NOW() - INTERVAL '7 days', NOW() + INTERVAL '3 days', '[{"description": "Erythrocyte Sedimentation Rate (ESR)", "quantity": 1, "unitPrice": 35.00, "total": 35.00}]', 35.00, 35.00, 'PAID', 35.00, 'Inflammation monitoring post-surgery', 8, NOW() - INTERVAL '7 days');

-- ===========================================
-- INDIVIDUAL EXAM INVOICES
-- ===========================================

INSERT INTO "invoices" ("athlete_id", "clinician_id", "case_id", "invoice_number", "invoice_date", "due_date", "items", "subtotal", "total_amount", "status", "paid_amount", "notes", "created_by", "created_at") VALUES
(16, 8, 21, 'INV-2025-MRI-001', NOW() - INTERVAL '35 days', NOW() - INTERVAL '25 days', '[{"description": "MRI - Right Knee (Initial diagnostic)", "quantity": 1, "unitPrice": 450.00, "total": 450.00}]', 450.00, 450.00, 'PAID', 450.00, 'Initial MRI for ACL injury diagnosis', 8, NOW() - INTERVAL '35 days'),
(16, 8, 21, 'INV-2025-XRAY-001', NOW() - INTERVAL '35 days', NOW() - INTERVAL '25 days', '[{"description": "X-RAY - Right Knee (AP and Lateral views)", "quantity": 1, "unitPrice": 120.00, "total": 120.00}]', 120.00, 120.00, 'PAID', 120.00, 'Initial radiographic assessment', 8, NOW() - INTERVAL '35 days'),
(16, 8, 21, 'INV-2025-CT-001', NOW() - INTERVAL '14 days', NOW() - INTERVAL '4 days', '[{"description": "CT Scan - Right Knee (Post-operative)", "quantity": 1, "unitPrice": 380.00, "total": 380.00}]', 380.00, 380.00, 'PAID', 380.00, 'Post-operative graft assessment', 8, NOW() - INTERVAL '14 days'),
(16, 8, 21, 'INV-2025-MRI-002', NOW() - INTERVAL '7 days', NOW() + INTERVAL '3 days', '[{"description": "MRI - Right Knee (Follow-up healing assessment)", "quantity": 1, "unitPrice": 450.00, "total": 450.00}]', 450.00, 450.00, 'PAID', 450.00, 'Healing progress evaluation', 8, NOW() - INTERVAL '7 days'),
(16, 8, 21, 'INV-2025-US-001', NOW() - INTERVAL '3 days', NOW() + INTERVAL '7 days', '[{"description": "Ultrasound - Right Knee (Dynamic assessment)", "quantity": 1, "unitPrice": 180.00, "total": 180.00}]', 180.00, 180.00, 'PAID', 180.00, 'Final functional assessment', 8, NOW() - INTERVAL '3 days');

-- ===========================================
-- PHYSIOTHERAPY SESSION-BY-SESSION BILLING
-- ===========================================

INSERT INTO "invoices" ("athlete_id", "clinician_id", "case_id", "invoice_number", "invoice_date", "due_date", "items", "subtotal", "total_amount", "status", "paid_amount", "notes", "created_by", "created_at") VALUES
(16, 8, 21, 'INV-2025-PHY-001', NOW() - INTERVAL '25 days', NOW() - INTERVAL '15 days', '[{"description": "Phase 1 Rehabilitation Session 1", "quantity": 1, "unitPrice": 85.00, "total": 85.00}, {"description": "Phase 1 Rehabilitation Session 2", "quantity": 1, "unitPrice": 85.00, "total": 85.00}, {"description": "Phase 1 Rehabilitation Session 3", "quantity": 1, "unitPrice": 85.00, "total": 85.00}, {"description": "Phase 1 Rehabilitation Session 4", "quantity": 1, "unitPrice": 85.00, "total": 85.00}]', 340.00, 340.00, 'PAID', 340.00, 'First week of Phase 1 rehabilitation program', 8, NOW() - INTERVAL '25 days'),
(16, 8, 21, 'INV-2025-PHY-002', NOW() - INTERVAL '22 days', NOW() - INTERVAL '12 days', '[{"description": "Phase 1 Rehabilitation Session 5", "quantity": 1, "unitPrice": 85.00, "total": 85.00}, {"description": "Phase 1 Rehabilitation Session 6", "quantity": 1, "unitPrice": 85.00, "total": 85.00}, {"description": "Phase 1 Rehabilitation Session 7", "quantity": 1, "unitPrice": 85.00, "total": 85.00}]', 255.00, 255.00, 'PAID', 255.00, 'Second week of Phase 1 rehabilitation program', 8, NOW() - INTERVAL '22 days'),
(16, 8, 21, 'INV-2025-PHY-003', NOW() - INTERVAL '19 days', NOW() - INTERVAL '9 days', '[{"description": "Phase 1 Rehabilitation Session 8", "quantity": 1, "unitPrice": 85.00, "total": 85.00}, {"description": "Phase 1 Rehabilitation Session 9", "quantity": 1, "unitPrice": 85.00, "total": 85.00}, {"description": "Phase 1 Rehabilitation Session 10", "quantity": 1, "unitPrice": 85.00, "total": 85.00}]', 255.00, 255.00, 'PAID', 255.00, 'Third week of Phase 1 rehabilitation program', 8, NOW() - INTERVAL '19 days'),
(16, 8, 21, 'INV-2025-PHY-004', NOW() - INTERVAL '16 days', NOW() - INTERVAL '6 days', '[{"description": "Phase 1 Rehabilitation Session 11", "quantity": 1, "unitPrice": 85.00, "total": 85.00}, {"description": "Phase 1 Rehabilitation Session 12", "quantity": 1, "unitPrice": 85.00, "total": 85.00}]', 170.00, 170.00, 'PAID', 170.00, 'Final sessions of Phase 1 rehabilitation program', 8, NOW() - INTERVAL '16 days'),
(16, 8, 21, 'INV-2025-PHY-005', NOW() - INTERVAL '10 days', NOW(), '[{"description": "Phase 2 Rehabilitation Session 1", "quantity": 1, "unitPrice": 90.00, "total": 90.00}, {"description": "Phase 2 Rehabilitation Session 2", "quantity": 1, "unitPrice": 90.00, "total": 90.00}]', 180.00, 180.00, 'PAID', 180.00, 'First week of Phase 2 rehabilitation program', 8, NOW() - INTERVAL '10 days'),
(16, 8, 21, 'INV-2025-PHY-006', NOW() - INTERVAL '7 days', NOW() + INTERVAL '3 days', '[{"description": "Phase 2 Rehabilitation Session 3", "quantity": 1, "unitPrice": 90.00, "total": 90.00}, {"description": "Phase 2 Rehabilitation Session 4", "quantity": 1, "unitPrice": 90.00, "total": 90.00}, {"description": "Phase 2 Rehabilitation Session 5", "quantity": 1, "unitPrice": 90.00, "total": 90.00}, {"description": "Phase 2 Rehabilitation Session 6", "quantity": 1, "unitPrice": 90.00, "total": 90.00}]', 360.00, 360.00, 'PAID', 360.00, 'Second week of Phase 2 rehabilitation program', 8, NOW() - INTERVAL '7 days'),
(16, 8, 21, 'INV-2025-PHY-007', NOW() - INTERVAL '4 days', NOW() + INTERVAL '6 days', '[{"description": "Phase 2 Rehabilitation Session 7", "quantity": 1, "unitPrice": 90.00, "total": 90.00}, {"description": "Phase 2 Rehabilitation Session 8", "quantity": 1, "unitPrice": 90.00, "total": 90.00}]', 180.00, 180.00, 'PAID', 180.00, 'Third week of Phase 2 rehabilitation program', 8, NOW() - INTERVAL '4 days'),
(16, 8, 21, 'INV-2025-PHY-008', NOW() - INTERVAL '5 days', NOW() + INTERVAL '5 days', '[{"description": "Return to Sport Session 1", "quantity": 1, "unitPrice": 95.00, "total": 95.00}, {"description": "Return to Sport Session 2", "quantity": 1, "unitPrice": 95.00, "total": 95.00}]', 190.00, 190.00, 'PAID', 190.00, 'Return to sport conditioning program', 8, NOW() - INTERVAL '5 days');

-- ===========================================
-- INDIVIDUAL APPOINTMENT INVOICES
-- ===========================================

INSERT INTO "invoices" ("athlete_id", "clinician_id", "case_id", "invoice_number", "invoice_date", "due_date", "items", "subtotal", "total_amount", "status", "paid_amount", "notes", "created_by", "created_at") VALUES
(16, 8, 21, 'INV-2025-CONS-001', NOW() - INTERVAL '40 days', NOW() - INTERVAL '30 days', '[{"description": "Initial Consultation - ACL Injury Assessment", "quantity": 1, "unitPrice": 150.00, "total": 150.00}]', 150.00, 150.00, 'PAID', 150.00, 'Initial injury assessment and diagnosis', 8, NOW() - INTERVAL '40 days'),
(16, 8, 21, 'INV-2025-CONS-002', NOW() - INTERVAL '30 days', NOW() - INTERVAL '20 days', '[{"description": "Follow-up Consultation - MRI Results Review", "quantity": 1, "unitPrice": 150.00, "total": 150.00}]', 150.00, 150.00, 'PAID', 150.00, 'MRI results discussion and treatment planning', 8, NOW() - INTERVAL '30 days'),
(16, 8, 21, 'INV-2025-CONS-003', NOW() - INTERVAL '25 days', NOW() - INTERVAL '15 days', '[{"description": "Pre-operative Assessment and Counseling", "quantity": 1, "unitPrice": 150.00, "total": 150.00}]', 150.00, 150.00, 'PAID', 150.00, 'Pre-surgery evaluation and patient preparation', 8, NOW() - INTERVAL '25 days'),
(16, 8, 21, 'INV-2025-CONS-004', NOW() - INTERVAL '20 days', NOW() - INTERVAL '10 days', '[{"description": "Post-operative Day 1 Assessment", "quantity": 1, "unitPrice": 150.00, "total": 150.00}]', 150.00, 150.00, 'PAID', 150.00, 'Immediate post-operative care and monitoring', 8, NOW() - INTERVAL '20 days'),
(16, 8, 21, 'INV-2025-CONS-005', NOW() - INTERVAL '15 days', NOW() - INTERVAL '5 days', '[{"description": "Post-operative Week 1 Follow-up", "quantity": 1, "unitPrice": 150.00, "total": 150.00}]', 150.00, 150.00, 'PAID', 150.00, 'Wound healing assessment and rehab initiation', 8, NOW() - INTERVAL '15 days'),
(16, 8, 21, 'INV-2025-CONS-006', NOW() - INTERVAL '10 days', NOW(), '[{"description": "Rehabilitation Progress Assessment", "quantity": 1, "unitPrice": 150.00, "total": 150.00}]', 150.00, 150.00, 'PAID', 150.00, 'Mid-treatment progress evaluation', 8, NOW() - INTERVAL '10 days'),
(16, 8, 21, 'INV-2025-CONS-007', NOW() - INTERVAL '5 days', NOW() + INTERVAL '5 days', '[{"description": "Month 1 Follow-up Assessment", "quantity": 1, "unitPrice": 150.00, "total": 150.00}]', 150.00, 150.00, 'PAID', 150.00, 'One-month progress and treatment adjustment', 8, NOW() - INTERVAL '5 days'),
(16, 8, 21, 'INV-2025-CONS-008', NOW() - INTERVAL '1 day', NOW() + INTERVAL '9 days', '[{"description": "Final Assessment - Return to Sport Clearance", "quantity": 1, "unitPrice": 150.00, "total": 150.00}]', 150.00, 150.00, 'PAID', 150.00, 'Final evaluation and return to activity clearance', 8, NOW() - INTERVAL '1 day');

-- ===========================================
-- VERIFICATION QUERIES
-- ===========================================

-- Uncomment the queries below to verify the invoices were created correctly:

-- SELECT 'Total Invoices for Case 21' as description, COUNT(*) as count FROM invoices WHERE case_id = 21;

-- SELECT invoice_number, invoice_date, total_amount, status, paid_amount, notes
-- FROM invoices
-- WHERE case_id = 21
-- ORDER BY invoice_date;

-- SELECT
--   SUM(total_amount) as total_billed,
--   SUM(paid_amount) as total_paid,
--   SUM(total_amount - paid_amount) as total_outstanding
-- FROM invoices
-- WHERE case_id = 21;

-- SELECT
--   CASE
--     WHEN invoice_number LIKE '%MED%' THEN 'Medication'
--     WHEN invoice_number LIKE '%PT%' THEN 'Physical Therapy'
--     WHEN invoice_number LIKE '%INJ%' THEN 'Injection'
--     WHEN invoice_number LIKE '%SURG%' THEN 'Surgery'
--     WHEN invoice_number LIKE '%LAB%' THEN 'Lab Tests'
--     WHEN invoice_number LIKE '%MRI%' THEN 'MRI'
--     WHEN invoice_number LIKE '%XRAY%' THEN 'X-Ray'
--     WHEN invoice_number LIKE '%CT%' THEN 'CT Scan'
--     WHEN invoice_number LIKE '%US%' THEN 'Ultrasound'
--     WHEN invoice_number LIKE '%PHY%' THEN 'Physiotherapy'
--     WHEN invoice_number LIKE '%CONS%' THEN 'Consultation'
--     ELSE 'Other'
--   END as service_type,
--   COUNT(*) as invoice_count,
--   SUM(total_amount) as total_amount
-- FROM invoices
-- WHERE case_id = 21
-- GROUP BY
--   CASE
--     WHEN invoice_number LIKE '%MED%' THEN 'Medication'
--     WHEN invoice_number LIKE '%PT%' THEN 'Physical Therapy'
--     WHEN invoice_number LIKE '%INJ%' THEN 'Injection'
--     WHEN invoice_number LIKE '%SURG%' THEN 'Surgery'
--     WHEN invoice_number LIKE '%LAB%' THEN 'Lab Tests'
--     WHEN invoice_number LIKE '%MRI%' THEN 'MRI'
--     WHEN invoice_number LIKE '%XRAY%' THEN 'X-Ray'
--     WHEN invoice_number LIKE '%CT%' THEN 'CT Scan'
--     WHEN invoice_number LIKE '%US%' THEN 'Ultrasound'
--     WHEN invoice_number LIKE '%PHY%' THEN 'Physiotherapy'
--     WHEN invoice_number LIKE '%CONS%' THEN 'Consultation'
--     ELSE 'Other'
--   END
-- ORDER BY service_type;

-- SELECT c.id, c.diagnosis_name, u.full_name as athlete_name,
--        SUM(i.total_amount) as total_case_cost,
--        SUM(i.paid_amount) as total_paid
-- FROM cases c
-- JOIN users u ON c.athlete_id = u.id
-- LEFT JOIN invoices i ON c.id = i.case_id
-- WHERE c.id = 21
-- GROUP BY c.id, c.diagnosis_name, u.full_name;

COMMIT;