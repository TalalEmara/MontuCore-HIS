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

  // 5 Physiotherapists
  const physioNames = [
    { name: 'Dr. Sarah Smith', email: 'physio1@sportshis.com', dob: '1985-03-15', gender: 'Female' },
    { name: 'Dr. John Davis', email: 'physio2@sportshis.com', dob: '1983-07-22', gender: 'Male' },
    { name: 'Dr. Emma Wilson', email: 'physio3@sportshis.com', dob: '1987-11-10', gender: 'Female' },
    { name: 'Dr. Michael Brown', email: 'physio4@sportshis.com', dob: '1984-05-18', gender: 'Male' },
    { name: 'Dr. Sophia Taylor', email: 'physio5@sportshis.com', dob: '1989-09-05', gender: 'Female' }
  ];

  for (let i = 0; i < physioNames.length; i++) {
    const clinician = await prisma.user.create({
      data: {
        email: physioNames[i]!.email,
        passwordHash: hashedPassword,
        fullName: physioNames[i]!.name,
        role: Role.CLINICIAN,
        dateOfBirth: new Date(physioNames[i]!.dob),
        phoneNumber: `+123456789${i + 1}`,
        gender: physioNames[i]!.gender,
        clinicianProfile: {
          create: {
            specialty: 'Physiotherapist'
          }
        }
      }
    });
    clinicians.push(clinician);
  }

  // 5 Physicians
  const physicianNames = [
    { name: 'Dr. Ahmed Ali', email: 'physician1@sportshis.com', dob: '1982-07-20', gender: 'Male', specialty: 'Orthopedic Surgeon' },
    { name: 'Dr. Maria Garcia', email: 'physician2@sportshis.com', dob: '1988-11-05', gender: 'Female', specialty: 'Sports Medicine' },
    { name: 'Dr. David Martinez', email: 'physician3@sportshis.com', dob: '1981-04-12', gender: 'Male', specialty: 'Internal Medicine' },
    { name: 'Dr. Olivia Anderson', email: 'physician4@sportshis.com', dob: '1986-08-30', gender: 'Female', specialty: 'Radiology' },
    { name: 'Dr. James Johnson', email: 'physician5@sportshis.com', dob: '1980-12-15', gender: 'Male', specialty: 'Neurology' }
  ];

  for (let i = 0; i < physicianNames.length; i++) {
    const clinician = await prisma.user.create({
      data: {
        email: physicianNames[i]!.email,
        passwordHash: hashedPassword,
        fullName: physicianNames[i]!.name,
        role: Role.CLINICIAN,
        dateOfBirth: new Date(physicianNames[i]!.dob),
        phoneNumber: `+12345678${i + 6}`,
        gender: physicianNames[i]!.gender,
        clinicianProfile: {
          create: {
            specialty: physicianNames[i]!.specialty
          }
        }
      }
    });
    clinicians.push(clinician);
  }

  console.log(`✅ ${clinicians.length} clinicians created (5 Physiotherapists, 5 Physicians)\n`);

  // --- 3. CREATE ATHLETES ---
  const athletes = [];

  const athleteData = [
    { name: 'John Doe', email: 'john@athlete.com', position: 'Forward', jersey: 10, dob: '2000-05-15', gender: 'Male' },
    { name: 'Emma Wilson', email: 'emma@athlete.com', position: 'Midfielder', jersey: 8, dob: '1999-08-22', gender: 'Female' },
    { name: 'Michael Brown', email: 'michael@athlete.com', position: 'Defender', jersey: 5, dob: '2001-03-10', gender: 'Male' },
    { name: 'Sophia Taylor', email: 'sophia@athlete.com', position: 'Goalkeeper', jersey: 1, dob: '1998-12-01', gender: 'Female' },
    { name: 'David Martinez', email: 'david@athlete.com', position: 'Forward', jersey: 11, dob: '2000-09-18', gender: 'Male' } // This will be the special athlete with multiple data
  ];

  for (const data of athleteData) {
    const athlete = await prisma.user.create({
      data: {
        email: data.email,
        passwordHash: hashedPassword,
        fullName: data.name,
        role: Role.ATHLETE,
        dateOfBirth: new Date(data.dob),
        phoneNumber: `+12345678${90 + athletes.length}`,
        gender: data.gender,
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

  // Regular appointments for all athletes
  for (let i = 0; i < 20; i++) {
    const athleteIndex = i % athletes.length;
    const clinicianIndex = i % clinicians.length;
    const daysAgo = 60 - (i * 3);

    const appointment = await prisma.appointment.create({
      data: {
        athleteId: athletes[athleteIndex]!.id,
        clinicianId: clinicians[clinicianIndex]!.id,
        scheduledAt: new Date(now.getTime() - daysAgo * 24 * 60 * 60 * 1000),
        height: 170 + (i * 2),
        weight: 65 + (i * 1.5),
        status: i < 15 ? ApptStatus.COMPLETED : ApptStatus.SCHEDULED,
        diagnosisNotes: `Initial assessment - appointment ${i + 1}`
      }
    });
    appointments.push(appointment);
  }

  // Special athlete (David Martinez, index 4) gets many more appointments
  const specialAthleteId = athletes[4]!.id;
  for (let i = 0; i < 30; i++) {
    const clinicianIndex = i % clinicians.length;
    const daysAgo = 90 - (i * 2);

    const appointment = await prisma.appointment.create({
      data: {
        athleteId: specialAthleteId,
        clinicianId: clinicians[clinicianIndex]!.id,
        scheduledAt: new Date(now.getTime() - daysAgo * 24 * 60 * 60 * 1000),
        height: 175,
        weight: 70,
        status: ApptStatus.COMPLETED,
        diagnosisNotes: `Special athlete assessment - appointment ${i + 1}`
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
  const usedAppointmentIds = new Set<number>();

  // Create cases for regular athletes
  for (let i = 0; i < 8; i++) {
    const athleteIndex = i % athletes.length;
    const clinicianIndex = i % clinicians.length;
    const template = caseTemplates[i % caseTemplates.length]!;
    
    // Find an unused completed appointment for this athlete
    const athleteAppointments = completedAppointments.filter(a => a.athleteId === athletes[athleteIndex]!.id && !usedAppointmentIds.has(a.id));
    const initialAppointment = athleteAppointments[0];
    if (!initialAppointment) continue;
    
    usedAppointmentIds.add(initialAppointment.id);
    
    const newCase = await prisma.case.create({
      data: {
        athleteId: athletes[athleteIndex]!.id,
        managingClinicianId: clinicians[clinicianIndex]!.id,
        initialAppointmentId: initialAppointment.id,
        diagnosisName: template.diagnosis,
        icd10Code: template.icd10,
        injuryDate: initialAppointment.scheduledAt,
        status: Math.random() > 0.3 ? CaseStatus.ACTIVE : CaseStatus.RECOVERED,
        severity: template.severity,
        medicalGrade: template.grade
      }
    });
    cases.push(newCase);
  }

  // Special athlete gets multiple cases
  const specialAppointments = completedAppointments.filter(a => a.athleteId === specialAthleteId && !usedAppointmentIds.has(a.id));
  for (let i = 0; i < 10 && i < specialAppointments.length; i++) {
    const clinicianIndex = i % clinicians.length;
    const template = caseTemplates[i % caseTemplates.length]!;
    const initialAppointment = specialAppointments[i];
    
    usedAppointmentIds.add(initialAppointment.id);
    
    const newCase = await prisma.case.create({
      data: {
        athleteId: specialAthleteId,
        managingClinicianId: clinicians[clinicianIndex]!.id,
        initialAppointmentId: initialAppointment.id,
        diagnosisName: template.diagnosis,
        icd10Code: template.icd10,
        injuryDate: initialAppointment.scheduledAt,
        status: CaseStatus.ACTIVE,
        severity: template.severity,
        medicalGrade: template.grade
      }
    });
    cases.push(newCase);
  }

  console.log(`✅ ${cases.length} cases created\n`);

  // --- 6. LINK FOLLOW-UP APPOINTMENTS TO CASES ---
  const usedInitialAppointmentIds = new Set(cases.map(c => c.initialAppointmentId));
  
  for (const appointment of appointments) {
    if (appointment.status === ApptStatus.COMPLETED && !usedInitialAppointmentIds.has(appointment.id)) {
      const athleteCases = cases.filter(c => c.athleteId === appointment.athleteId);
      if (athleteCases.length > 0) {
        const caseForAppointment = athleteCases[appointment.id % athleteCases.length]!;
        await prisma.appointment.update({
          where: { id: appointment.id },
          data: { caseId: caseForAppointment.id }
        });
      }
    }
  }

  console.log(`✅ Follow-up appointments linked to cases\n`);

  // --- 7. CREATE EXAMS FOR CASES ---
  for (const caseItem of cases) {
    const numExams = caseItem.athleteId === specialAthleteId ? 3 : 1; // Special athlete gets 3 exams per case
    for (let i = 0; i < numExams; i++) {
      const exam = await prisma.exam.create({
        data: {
          caseId: caseItem.id,
          modality: ['MRI', 'CT', 'X-RAY', 'ULTRASOUND'][i % 4]!,
          bodyPart: ['Knee', 'Ankle', 'Shoulder', 'Elbow'][i % 4]!,
          status: 'COMPLETED',
          scheduledAt: new Date(now.getTime() - (i * 5) * 24 * 60 * 60 * 1000),
          performedAt: new Date(now.getTime() - (i * 5 - 1) * 24 * 60 * 60 * 1000),
          radiologistNotes: `Examination complete - findings documented for ${caseItem.diagnosisName}`,
          conclusion: `Findings consistent with ${caseItem.diagnosisName}`,
          cost: 200 + (i * 50)
        }
      });

      // Add PACS images for some exams
      if (i === 0) {
        await prisma.pACSImage.create({
          data: {
            examId: exam.id,
            fileName: `exam_${exam.id}.dcm`,
            supabasePath: `dicom_images/exam_${exam.id}.dcm`,
            publicUrl: `https://demo-supabase-url.supabase.co/storage/v1/object/public/dicoms/exam_${exam.id}.dcm`,
            uploadedAt: new Date(now.getTime() - (i * 5 - 1) * 24 * 60 * 60 * 1000)
          }
        });
      }
    }
  }

  console.log(`✅ Exams created for cases\n`);

  // --- 8. CREATE LAB TESTS ---
  for (const caseItem of cases) {
    const numLabs = caseItem.athleteId === specialAthleteId ? 4 : 1; // Special athlete gets 4 lab tests per case
    for (let i = 0; i < numLabs; i++) {
      await prisma.labTest.create({
        data: {
          caseId: caseItem.id,
          testName: ['CBC', 'Lipid Profile', 'Liver Function', 'Kidney Function', 'Thyroid Panel'][i % 5]!,
          category: 'Hematology',
          status: 'COMPLETED',
          resultValues: { WBC: 7.5 + i, RBC: 5.0 + i * 0.1 },
          labTechnicianNotes: 'All values within normal range.',
          sampleDate: new Date(now.getTime() - (i * 3) * 24 * 60 * 60 * 1000),
          cost: 50 + (i * 20)
        }
      });
    }
  }

  console.log(`✅ Lab tests created\n`);

  // --- 9. CREATE TREATMENTS ---
  for (const caseItem of cases) {
    const numTreatments = caseItem.athleteId === specialAthleteId ? 3 : 1; // Special athlete gets 3 treatments per case
    for (let i = 0; i < numTreatments; i++) {
      await prisma.treatment.create({
        data: {
          caseId: caseItem.id,
          type: ['Medication', 'Surgery', 'Physical Therapy', 'Injection'][i % 4]!,
          description: `Treatment plan for ${caseItem.diagnosisName} - session ${i + 1}`,
          providerName: 'Internal Clinic',
          cost: 100 + (i * 150),
          date: new Date(now.getTime() - (i * 7) * 24 * 60 * 60 * 1000)
        }
      });
    }
  }

  console.log(`✅ Treatments created\n`);

  // --- 10. CREATE PHYSIO PROGRAMS ---
  for (const caseItem of cases) {
    const numPhysio = caseItem.athleteId === specialAthleteId ? 2 : 1; // Special athlete gets 2 physio programs per case
    for (let i = 0; i < numPhysio; i++) {
      await prisma.physioProgram.create({
        data: {
          caseId: caseItem.id,
          title: `Rehabilitation Program for ${caseItem.diagnosisName} - ${i + 1}`,
          numberOfSessions: 10 + (i * 2),
          sessionsCompleted: i * 3,
          startDate: new Date(now.getTime() - (i * 10) * 24 * 60 * 60 * 1000),
          weeklyRepetition: 3,
          costPerSession: 75 + (i * 10)
        }
      });
    }
  }

  console.log(`✅ Physio programs created\n`);

  console.log('🎉 Seeding completed successfully!\n');
  console.log('📊 Summary:');
  console.log(`   - 1 Admin`);
  console.log(`   - ${clinicians.length} Clinicians (5 Physiotherapists, 5 Physicians)`);
  console.log(`   - ${athletes.length} Athletes (1 with extensive medical history)`);
  console.log(`   - ${appointments.length} Appointments`);
  console.log(`   - ${cases.length} Cases`);
  console.log(`   - Exams, Lab Tests, Treatments, Physio Programs created accordingly\n`);
}

main()
  .catch((e) => {
    console.error('❌ Seeding error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });