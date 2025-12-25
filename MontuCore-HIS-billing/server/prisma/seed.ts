import { Role, Severity, CaseStatus, ApptStatus } from '@prisma/client';
import bcrypt from 'bcrypt';
import { prisma } from '../src/config/db.js';

async function main() {
  console.log('🌱 Starting comprehensive seeding...\n');

  // Clear existing data
  await prisma.$executeRaw`TRUNCATE TABLE "pacs_images", "exams", "lab_tests", "treatments", "physio_programs", "cases", "appointments", "athlete_profiles", "clinician_profiles", "users" RESTART IDENTITY CASCADE;`;
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
    
    const newCase = await prisma.case.create({
      data: {
        athleteId: athletes[athleteIndex]!.id,
        managingClinicianId: clinicians[clinicianIndex]!.id,
        initialAppointmentId: initialAppointment?.id, // Link to the initial appointment (one-to-one)
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
    await prisma.exam.create({
      data: {
        caseId: cases[i]!.id,
        modality: ['MRI', 'CT', 'X-RAY', 'ULTRASOUND'][i % 4]!,
        bodyPart: ['Knee', 'Ankle', 'Shoulder', 'Elbow'][i % 4]!,
        status: i < 5 ? 'IMAGING_COMPLETE' : 'ORDERED',
        scheduledAt: new Date(now.getTime() - (i * 2) * 24 * 60 * 60 * 1000),
        performedAt: i < 5 ? new Date(now.getTime() - (i * 2 - 1) * 24 * 60 * 60 * 1000) : null,
        radiologistNotes: i < 5 ? `Examination complete - findings documented` : null,
        conclusion: i < 5 ? `${['Normal', 'Abnormal'][i % 2]} findings observed` : null,
        cost: 200 + (i * 50)
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

  console.log('🎉 Seeding completed successfully!\n');
  console.log('📊 Summary:');
  console.log(`   - 1 Admin`);
  console.log(`   - ${clinicians.length} Clinicians`);
  console.log(`   - ${athletes.length} Athletes`);
  console.log(`   - ${appointments.length} Appointments`);
  console.log(`   - ${cases.length} Cases`);
  console.log(`   - ${cases.length} Exams`);
  console.log(`   - 5 Lab Tests`);
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