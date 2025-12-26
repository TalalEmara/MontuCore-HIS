import { Role, Severity, CaseStatus, ApptStatus } from '@prisma/client';
import bcrypt from 'bcrypt';
import { prisma } from '../src/config/db.js';

async function main() {
  console.log('🌱 Starting comprehensive seeding...\n');

  // Clear existing data
  await prisma.$executeRaw`TRUNCATE TABLE "exams", "lab_tests", "treatments", "physio_programs", "cases", "appointments", "athlete_profiles", "clinician_profiles", "users" RESTART IDENTITY CASCADE;`;
  console.log('🗑️  Cleared existing data\n');

  const hashedPassword = await bcrypt.hash('Test123!', 10);

  // --- 1. CREATE ADMIN ---
  const admin = await prisma.user.create({
    data: {
      email: 'admin@sportshis.com',
      passwordHash: hashedPassword,
      fullName: 'System Admin',
      role: Role.ADMIN,
      dateOfBirth: new Date('1980-01-01'),
      phoneNumber: '+1234567890',
      gender: 'Male'
    }
  });
  console.log('✅ Admin created:', admin.email);

  // --- 2. CREATE CLINICIANS ---
  const clinicians = [];
  
  const clinician1 = await prisma.user.create({
    data: {
      email: 'physio@sportshis.com',
      passwordHash: hashedPassword,
      fullName: 'Dr. Sarah Smith',
      role: Role.CLINICIAN,
      dateOfBirth: new Date('1985-03-15'),
      phoneNumber: '+1234567891',
      gender: 'Female',
      clinicianProfile: {
        create: {
          specialty: 'Physiotherapist'
        }
      }
    }
  });
  clinicians.push(clinician1);

  const clinician2 = await prisma.user.create({
    data: {
      email: 'ortho@sportshis.com',
      passwordHash: hashedPassword,
      fullName: 'Dr. Ahmed Ali',
      role: Role.CLINICIAN,
      dateOfBirth: new Date('1982-07-20'),
      phoneNumber: '+1234567892',
      gender: 'Male',
      clinicianProfile: {
        create: {
          specialty: 'Orthopedic Surgeon'
        }
      }
    }
  });
  clinicians.push(clinician2);

  const clinician3 = await prisma.user.create({
    data: {
      email: 'sports.med@sportshis.com',
      passwordHash: hashedPassword,
      fullName: 'Dr. Maria Garcia',
      role: Role.CLINICIAN,
      dateOfBirth: new Date('1988-11-05'),
      phoneNumber: '+1234567893',
      gender: 'Female',
      clinicianProfile: {
        create: {
          specialty: 'Sports Medicine'
        }
      }
    }
  });
  clinicians.push(clinician3);

  console.log(`✅ ${clinicians.length} clinicians created\n`);

  // --- 3. CREATE ATHLETES ---
  const athletes = [];

  const athleteData = [
    { name: 'John Doe', email: 'john@athlete.com', position: 'Forward', jersey: 10, dob: '2000-05-15' },
    { name: 'Emma Wilson', email: 'emma@athlete.com', position: 'Midfielder', jersey: 8, dob: '1999-08-22' },
    { name: 'Michael Brown', email: 'michael@athlete.com', position: 'Defender', jersey: 5, dob: '2001-03-10' },
    { name: 'Sophia Taylor', email: 'sophia@athlete.com', position: 'Goalkeeper', jersey: 1, dob: '1998-12-01' },
    { name: 'David Martinez', email: 'david@athlete.com', position: 'Forward', jersey: 11, dob: '2000-09-18' },
    { name: 'Olivia Anderson', email: 'olivia@athlete.com', position: 'Midfielder', jersey: 7, dob: '2002-01-25' },
    { name: 'James Johnson', email: 'james@athlete.com', position: 'Defender', jersey: 3, dob: '1999-06-14' },
    { name: 'Ava Thomas', email: 'ava@athlete.com', position: 'Forward', jersey: 9, dob: '2001-11-30' },
  ];

  for (const data of athleteData) {
    const athlete: { id: number } = await prisma.user.create({
      data: {
        email: data.email,
        passwordHash: hashedPassword,
        fullName: data.name,
        role: Role.ATHLETE,
        dateOfBirth: new Date(data.dob),
        phoneNumber: `+12345678${90 + athletes.length}`,
        gender: ['John', 'Michael', 'David', 'James'].includes(data.name.split(' ')[0]!) ? 'Male' : 'Female',
        athleteProfile: {
          create: {
            position: data.position,
            jerseyNumber: data.jersey
          }
        }
      }
    });
    athletes.push(athlete);
  }

  console.log(`✅ ${athletes.length} athletes created\n`);

  // --- 4. CREATE APPOINTMENTS ---
  const appointments = [];
  const now = new Date();

  for (let i = 0; i < 12; i++) {
    const athleteIndex = i % athletes.length;
    const clinicianIndex = i % clinicians.length;
    const daysAgo = 30 - (i * 2);

    const appointment = await prisma.appointment.create({
      data: {
        athleteId: athletes[athleteIndex]!.id,
        clinicianId: clinicians[clinicianIndex]!.id,
        scheduledAt: new Date(now.getTime() - daysAgo * 24 * 60 * 60 * 1000),
        height: 170 + (i * 3),
        weight: 65 + (i * 2),
        status: i < 10 ? ApptStatus.COMPLETED : ApptStatus.SCHEDULED,
        diagnosisNotes: `Initial assessment - appointment ${i + 1}`
      }
    });
    appointments.push(appointment);
  }

  console.log(`✅ ${appointments.length} appointments created\n`);

  // --- 5. CREATE CASES ---
  const caseTemplates = [
    { diagnosis: 'ACL Tear', icd10: 'S83.5', severity: Severity.SEVERE, grade: 'Grade 3' },
    { diagnosis: 'Ankle Sprain', icd10: 'S93.4', severity: Severity.MODERATE, grade: 'Grade 2' },
    { diagnosis: 'Hamstring Strain', icd10: 'S76.1', severity: Severity.MILD, grade: 'Grade 1' },
    { diagnosis: 'Shoulder Dislocation', icd10: 'S43.0', severity: Severity.SEVERE, grade: 'Anterior' },
    { diagnosis: 'Concussion', icd10: 'S06.0', severity: Severity.MODERATE, grade: 'Grade 2' },
    { diagnosis: 'Meniscus Tear', icd10: 'S83.2', severity: Severity.MODERATE, grade: 'Medial' },
    { diagnosis: 'Tennis Elbow', icd10: 'M77.1', severity: Severity.MILD, grade: 'Lateral' },
    { diagnosis: 'Stress Fracture', icd10: 'M84.3', severity: Severity.MODERATE, grade: 'Tibia' },
  ];

  const cases = [];
  const completedAppointments = appointments.filter(a => a.status === ApptStatus.COMPLETED);

  // Create cases with initial appointment references (one-to-one: each appointment can only be initial for one case)
  for (let i = 0; i < Math.min(8, completedAppointments.length); i++) {
    const athleteIndex = i % athletes.length;
    const clinicianIndex = i % clinicians.length;
    const template = caseTemplates[i]!;
    
    // Each completed appointment is the initial appointment for exactly one case
    const initialAppointment = completedAppointments[i];
    
    if (!initialAppointment) {
      throw new Error(`No initial appointment found for case ${i}`);
    }
    
    const newCase = await prisma.case.create({
      data: {
        athleteId: athletes[athleteIndex]!.id,
        managingClinicianId: clinicians[clinicianIndex]!.id,
        initialAppointmentId: initialAppointment.id, // Link to the initial appointment (one-to-one)
        diagnosisName: template.diagnosis,
        icd10Code: template.icd10,
        injuryDate: initialAppointment?.scheduledAt || new Date(now.getTime() - (i * 5) * 24 * 60 * 60 * 1000),
        status: Math.random() > 0.3 ? CaseStatus.ACTIVE : CaseStatus.RECOVERED,
        severity: template.severity,
        medicalGrade: template.grade
      }
    });
    cases.push(newCase);
  }

  console.log(`✅ ${cases.length} cases created\n`);

  // --- 6. LINK FOLLOW-UP APPOINTMENTS TO CASES ---
  // Create additional follow-up appointments for some cases
  // (Don't link the initial appointments again as they're already linked via initialAppointmentId)
  const usedInitialAppointmentIds = new Set(cases.map(c => c.initialAppointmentId).filter(id => id !== null));
  
  for (let i = 0; i < appointments.length; i++) {
    const appointment = appointments[i]!;
    
    // Only link completed appointments that aren't already used as initial appointments
    if (appointment.status === ApptStatus.COMPLETED && !usedInitialAppointmentIds.has(appointment.id)) {
      // Link to a random case as a follow-up appointment
      const caseForAppointment = cases[i % cases.length]!;
      
      await prisma.appointment.update({
        where: { id: appointment.id },
        data: { caseId: caseForAppointment.id }
      });
    }
  }

  console.log(`✅ Follow-up appointments linked to cases\n`);

  // --- 7. CREATE EXAMS FOR SOME CASES ---
  
  for (let i = 0; i < cases.length; i++) {
    const hasDicom = i === 0 || i === 2; // Add DICOM to first and third exams
    await prisma.exam.create({
      data: {
        caseId: cases[i]!.id,
        modality: ['MRI', 'CT', 'X-RAY', 'ULTRASOUND'][i % 4]!,
        bodyPart: ['Knee', 'Ankle', 'Shoulder', 'Elbow'][i % 4]!,
        status: i < 5 ? 'COMPLETED' : 'ORDERED',
        scheduledAt: new Date(now.getTime() - (i * 2) * 24 * 60 * 60 * 1000),
        performedAt: i < 5 ? new Date(now.getTime() - (i * 2 - 1) * 24 * 60 * 60 * 1000) : null,
        radiologistNotes: i < 5 ? `Examination complete - findings documented` : null,
        conclusion: i < 5 ? `${['Normal', 'Abnormal'][i % 2]} findings observed` : null,
        cost: 200 + (i * 50),
        ...(hasDicom && {
          dicomFileName: `demo_${i === 0 ? 'pure_acl' : 'dual_injury'}_${cases[i]!.id}.dcm`,
          dicomSupabasePath: `dicom_images/demo_${i === 0 ? 'pure_acl' : 'dual_injury'}_${cases[i]!.id}.dcm`,
          dicomPublicUrl: `https://your-supabase-url.supabase.co/storage/v1/object/public/dicom-images/demo_${i === 0 ? 'pure_acl' : 'dual_injury'}_${cases[i]!.id}.dcm`,
          dicomUploadedAt: new Date(now.getTime() - (i * 2 - 1) * 24 * 60 * 60 * 1000)
        })
      }
    });
  }

  console.log(`✅ ${cases.length} exams created\n`);

  // --- 7. CREATE LAB TESTS ---
  for (let i = 0; i < 5; i++) {
    await prisma.labTest.create({
      data: {
        caseId: cases[i]!.id,
        testName: ['CBC', 'Lipid Profile', 'Liver Function', 'Kidney Function', 'Thyroid Panel'][i]!,
        category: 'Hematology',
        status: i < 3 ? 'COMPLETED' : 'PENDING',
        ...(i < 3 && { resultValues: { RBC: 5.0 + i, WBC: 7.5, Hemoglobin: 14.5 } }),
        sampleDate: new Date(now.getTime() - (i * 3) * 24 * 60 * 60 * 1000),
        cost: 50 + (i * 20)
      }
    });
  }

  console.log(`✅ 5 lab tests created\n`);

  // --- 8. CREATE TREATMENTS ---
  for (let i = 0; i < 6; i++) {
    await prisma.treatment.create({
      data: {
        caseId: cases[i]!.id,
        type: ['Medication', 'Surgery', 'Physical Therapy', 'Injection'][i % 4]!,
        description: `Treatment plan ${i + 1} - comprehensive rehabilitation protocol`,
        providerName: i % 2 === 0 ? 'Internal Clinic' : 'External Specialist',
        cost: 100 + (i * 150),
        date: new Date(now.getTime() - (i * 2) * 24 * 60 * 60 * 1000)
      }
    });
  }

  console.log(`✅ 6 treatments created\n`);

  // --- 9. CREATE PHYSIO PROGRAMS ---
  for (let i = 0; i < 5; i++) {
    await prisma.physioProgram.create({
      data: {
        caseId: cases[i]!.id,
        title: `Rehabilitation Program ${i + 1}`,
        numberOfSessions: 10 + (i * 2),
        sessionsCompleted: i * 2,
        startDate: new Date(now.getTime() - (i * 7) * 24 * 60 * 60 * 1000),
        weeklyRepetition: 3,
        costPerSession: 75 + (i * 10)
      }
    });
  }

  console.log(`✅ 5 physio programs created\n`);

  // --- 10. CREATE DEDICATED DATA FOR CLINICIAN 2 & ATHLETE 6 (FOR CONSULTATION TESTING) ---
  console.log('🎯 Creating dedicated data for Clinician ID 2 and Athlete ID 6...\n');

  // Get Clinician 2 (Dr. Ahmed Ali - Orthopedic Surgeon) and Athlete 6 (Olivia Anderson)
  const clinician2Id = 2; // Dr. Ahmed Ali
  const athlete6Id = 6; // Olivia Anderson

  // Create 3 appointments between them
  const consultationAppointments = [];
  for (let i = 0; i < 3; i++) {
    const appt = await prisma.appointment.create({
      data: {
        athleteId: athlete6Id,
        clinicianId: clinician2Id,
        scheduledAt: new Date(now.getTime() - (15 - i * 5) * 24 * 60 * 60 * 1000),
        height: 168,
        weight: 62,
        status: ApptStatus.COMPLETED,
        diagnosisNotes: `Consultation appointment ${i + 1} - Sports injury assessment`
      }
    });
    consultationAppointments.push(appt);
  }

  // Create 2 cases linked to these appointments
  const consultationCases = [];

  // Case 1: ACL Tear
  const case1 = await prisma.case.create({
    data: {
      athleteId: athlete6Id,
      managingClinicianId: clinician2Id,
      initialAppointmentId: consultationAppointments[0]!.id,
      diagnosisName: 'Complete ACL Tear with Meniscus Damage',
      icd10Code: 'S83.5',
      injuryDate: new Date(now.getTime() - 20 * 24 * 60 * 60 * 1000),
      status: CaseStatus.ACTIVE,
      severity: Severity.SEVERE,
      medicalGrade: 'Grade 3'
    }
  });
  consultationCases.push(case1);

  // Case 2: Shoulder Injury
  const case2 = await prisma.case.create({
    data: {
      athleteId: athlete6Id,
      managingClinicianId: clinician2Id,
      initialAppointmentId: consultationAppointments[1]!.id,
      diagnosisName: 'Rotator Cuff Strain',
      icd10Code: 'S46.0',
      injuryDate: new Date(now.getTime() - 10 * 24 * 60 * 60 * 1000),
      status: CaseStatus.ACTIVE,
      severity: Severity.MODERATE,
      medicalGrade: 'Grade 2'
    }
  });
  consultationCases.push(case2);

  // Link follow-up appointment to case 1
  await prisma.appointment.update({
    where: { id: consultationAppointments[2]!.id },
    data: { caseId: case1.id }
  });

  // Create detailed exams for both cases
  const consultationExams = [];

  // Exams for Case 1 (ACL Tear)
  const exam1 = await prisma.exam.create({
    data: {
      caseId: case1.id,
      modality: 'MRI',
      bodyPart: 'Knee',
      status: 'COMPLETED',
      scheduledAt: new Date(now.getTime() - 18 * 24 * 60 * 60 * 1000),
      performedAt: new Date(now.getTime() - 17 * 24 * 60 * 60 * 1000),
      radiologistNotes: 'Complete rupture of anterior cruciate ligament. Associated medial meniscus tear identified. Moderate joint effusion present.',
      conclusion: 'Complete ACL tear with medial meniscus damage. Surgical intervention recommended.',
      cost: 2500.00,
      dicomFileName: 'knee_mri_acl_tear.dcm',
      dicomSupabasePath: 'scans/knee_mri_acl_tear.dcm',
      dicomPublicUrl: 'https://demo-supabase-url.supabase.co/storage/v1/object/public/dicoms/scans/knee_mri_acl_tear.dcm',
      dicomUploadedAt: new Date(now.getTime() - 17 * 24 * 60 * 60 * 1000)
    }
  });
  consultationExams.push(exam1);

  const exam2 = await prisma.exam.create({
    data: {
      caseId: case1.id,
      modality: 'X-RAY',
      bodyPart: 'Knee',
      status: 'COMPLETED',
      scheduledAt: new Date(now.getTime() - 19 * 24 * 60 * 60 * 1000),
      performedAt: new Date(now.getTime() - 19 * 24 * 60 * 60 * 1000),
      radiologistNotes: 'No fracture identified. Joint space appears normal. Soft tissue swelling noted.',
      conclusion: 'No bony abnormalities detected.',
      cost: 300.00
    }
  });
  consultationExams.push(exam2);

  // Exams for Case 2 (Shoulder)
  const exam3 = await prisma.exam.create({
    data: {
      caseId: case2.id,
      modality: 'MRI',
      bodyPart: 'Shoulder',
      status: 'COMPLETED',
      scheduledAt: new Date(now.getTime() - 8 * 24 * 60 * 60 * 1000),
      performedAt: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000),
      radiologistNotes: 'Partial thickness tear of supraspinatus tendon. Mild tendinopathy of infraspinatus.',
      conclusion: 'Rotator cuff strain with partial tear. Conservative management with possible surgical consideration if no improvement.',
      cost: 2200.00,
      dicomFileName: 'shoulder_mri_rotator_cuff.dcm',
      dicomSupabasePath: 'scans/shoulder_mri_rotator_cuff.dcm',
      dicomPublicUrl: 'https://demo-supabase-url.supabase.co/storage/v1/object/public/dicoms/scans/shoulder_mri_rotator_cuff.dcm',
      dicomUploadedAt: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
    }
  });
  consultationExams.push(exam3);

  const exam4 = await prisma.exam.create({
    data: {
      caseId: case2.id,
      modality: 'Ultrasound',
      bodyPart: 'Shoulder',
      status: 'COMPLETED',
      scheduledAt: new Date(now.getTime() - 9 * 24 * 60 * 60 * 1000),
      performedAt: new Date(now.getTime() - 9 * 24 * 60 * 60 * 1000),
      radiologistNotes: 'Real-time assessment shows reduced range of motion. Fluid accumulation in subacromial bursa.',
      conclusion: 'Subacromial bursitis confirmed.',
      cost: 450.00
    }
  });
  consultationExams.push(exam4);

  // Create lab tests for both cases
  const consultationLabTests = [];

  // Lab tests for Case 1 (ACL)
  const lab1 = await prisma.labTest.create({
    data: {
      caseId: case1.id,
      testName: 'Complete Blood Count (CBC)',
      category: 'Hematology',
      status: 'COMPLETED',
      resultValues: {
        RBC: 5.1,
        WBC: 7.2,
        Hemoglobin: 14.8,
        Hematocrit: 44.5,
        Platelets: 245,
        MCV: 88,
        MCH: 29
      },
      labTechnicianNotes: 'All values within normal range. Patient cleared for surgery.',
      sampleDate: new Date(now.getTime() - 16 * 24 * 60 * 60 * 1000),
      cost: 85.00
    }
  });
  consultationLabTests.push(lab1);

  const lab2 = await prisma.labTest.create({
    data: {
      caseId: case1.id,
      testName: 'Coagulation Profile',
      category: 'Hematology',
      status: 'COMPLETED',
      resultValues: {
        PT: 12.5,
        INR: 1.0,
        aPTT: 28,
        Fibrinogen: 320
      },
      labTechnicianNotes: 'Normal coagulation parameters. Safe to proceed with surgical intervention.',
      sampleDate: new Date(now.getTime() - 16 * 24 * 60 * 60 * 1000),
      cost: 120.00
    }
  });
  consultationLabTests.push(lab2);

  const lab3 = await prisma.labTest.create({
    data: {
      caseId: case1.id,
      testName: 'Inflammatory Markers',
      category: 'Chemistry',
      status: 'COMPLETED',
      resultValues: {
        CRP: 8.5,
        ESR: 15
      },
      labTechnicianNotes: 'Slightly elevated CRP consistent with acute injury. ESR within normal limits.',
      sampleDate: new Date(now.getTime() - 15 * 24 * 60 * 60 * 1000),
      cost: 95.00
    }
  });
  consultationLabTests.push(lab3);

  // Lab tests for Case 2 (Shoulder)
  const lab4 = await prisma.labTest.create({
    data: {
      caseId: case2.id,
      testName: 'Complete Blood Count (CBC)',
      category: 'Hematology',
      status: 'COMPLETED',
      resultValues: {
        RBC: 4.9,
        WBC: 6.8,
        Hemoglobin: 14.2,
        Hematocrit: 43.1,
        Platelets: 238
      },
      labTechnicianNotes: 'All parameters normal.',
      sampleDate: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000),
      cost: 85.00
    }
  });
  consultationLabTests.push(lab4);

  const lab5 = await prisma.labTest.create({
    data: {
      caseId: case2.id,
      testName: 'Vitamin D Level',
      category: 'Endocrinology',
      status: 'COMPLETED',
      resultValues: {
        VitaminD: 28,
        Unit: 'ng/mL'
      },
      labTechnicianNotes: 'Vitamin D slightly below optimal range. Supplementation recommended.',
      sampleDate: new Date(now.getTime() - 6 * 24 * 60 * 60 * 1000),
      cost: 75.00
    }
  });
  consultationLabTests.push(lab5);

  console.log(`✅ Created for Consultation Testing:`);
  console.log(`   - ${consultationAppointments.length} appointments (Clinician 2 ↔ Athlete 6)`);
  console.log(`   - ${consultationCases.length} cases (ACL Tear & Rotator Cuff Strain)`);
  console.log(`   - ${consultationExams.length} exams (2 MRI, 1 X-RAY, 1 Ultrasound)`);
  console.log(`   - ${consultationLabTests.length} lab tests (CBC, Coagulation, Inflammatory, Vitamin D)\n`);

  console.log('🎉 Seeding completed successfully!\n');
  console.log('📊 Summary:');
  console.log(`   - 1 Admin`);
  console.log(`   - ${clinicians.length} Clinicians`);
  console.log(`   - ${athletes.length} Athletes`);
  console.log(`   - ${appointments.length + consultationAppointments.length} Appointments`);
  console.log(`   - ${cases.length + consultationCases.length} Cases`);
  console.log(`   - ${cases.length + consultationExams.length} Exams`);
  console.log(`   - ${5 + consultationLabTests.length} Lab Tests`);
  console.log(`   - 6 Treatments`);
  console.log(`   - 5 Physio Programs\n`);
}

main()
  .catch((e) => {
    console.error('❌ Seeding error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });