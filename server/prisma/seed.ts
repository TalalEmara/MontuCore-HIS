import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting Seeding...')

  // --- 1. ADMIN ---
  const admin = await prisma.user.upsert({
    where: { email: 'admin@sportshis.com' },
    update: {},
    create: {
      email: 'admin@sportshis.com',
      passwordHash: 'secure_password_123', // In real app, hash this!
      fullName: 'System Admin',
      role: 'ADMIN',
    },
  })
  console.log('👤 Admin created')

  // --- 2. CLINICIANS ---
  // A. Physiotherapist
  const physio = await prisma.user.upsert({
    where: { email: 'doc@sportshis.com' },
    update: {},
    create: {
      email: 'doc@sportshis.com',
      passwordHash: '123456',
      fullName: 'Dr. Sarah Smith',
      role: 'CLINICIAN',
      clinicianProfile: {
        create: {
          specialty: 'Physiotherapist'
        }
      }
    },
  })

  // B. Orthopedic Surgeon
  const ortho = await prisma.user.upsert({
    where: { email: 'ortho@sportshis.com' },
    update: {},
    create: {
      email: 'ortho@sportshis.com',
      passwordHash: '123456',
      fullName: 'Dr. Ahmed Ali',
      role: 'CLINICIAN',
      clinicianProfile: {
        create: {
          specialty: 'Orthopedic Surgeon'
        }
      }
    },
  })
  console.log('🩺 Clinicians created')

  // --- 3. ATHLETES ---
  const athlete1 = await prisma.user.upsert({
    where: { email: 'mo.salah@liverpool.com' },
    update: {},
    create: {
      email: 'mo.salah@liverpool.com',
      passwordHash: '123456',
      fullName: 'Mo Salah',
      role: 'ATHLETE',
      dateOfBirth: new Date('1992-06-15'),
      gender: 'Male',
      athleteProfile: {
        create: {
          position: 'Winger',
          jerseyNumber: 11
        }
      }
    },
  })

  const athlete2 = await prisma.user.upsert({
    where: { email: 'messi@intermiami.com' },
    update: {},
    create: {
      email: 'messi@intermiami.com',
      passwordHash: '123456',
      fullName: 'Lionel Messi',
      role: 'ATHLETE',
      gender: 'Male',
      athleteProfile: {
        create: {
          position: 'Forward',
          jerseyNumber: 10
        }
      }
    },
  })
  console.log('🏃 Athletes created')

  // --- 4. APPOINTMENTS (For Dev 3 Testing) ---
  // A. Past Appointment (Completed)
  const appt1 = await prisma.appointment.create({
    data: {
      athleteId: athlete1.id,
      clinicianId: physio.id,
      scheduledAt: new Date(new Date().setDate(new Date().getDate() - 7)), // 7 days ago
      status: 'COMPLETED',
      diagnosisNotes: 'Patient complained of knee pain after match.',
      height: 175,
      weight: 71
    }
  })

  // B. Future Appointment (Scheduled)
  await prisma.appointment.create({
    data: {
      athleteId: athlete2.id,
      clinicianId: ortho.id,
      scheduledAt: new Date(new Date().setDate(new Date().getDate() + 2)), // In 2 days
      status: 'SCHEDULED'
    }
  })
  console.log('📅 Appointments created')

  // --- 5. MEDICAL CASE (For Dev 2 Testing) ---
  // Create a case linked to the past appointment (Mo Salah's Knee)
  const injuryCase = await prisma.case.create({
    data: {
      athleteId: athlete1.id,
      managingClinicianId: physio.id,
      appointmentId: appt1.id, // Mandatory link!
      diagnosisName: 'ACL Strain - Grade 1',
      severity: 'MILD',
      status: 'ACTIVE',
      injuryDate: new Date(),
    }
  })
  console.log('📂 Case created')

  // --- 6. EXAM & IMAGING (For PACS Testing) ---
  const exam = await prisma.exam.create({
    data: {
      caseId: injuryCase.id,
      modality: 'MRI',
      bodyPart: 'Left Knee',
      status: 'IMAGING_COMPLETE',
      scheduledAt: new Date(),
      cost: 150.00,
      images: {
        create: [
          {
            fileName: 'knee_scan_01.dcm',
            supabasePath: 'dicoms/knee_scan_01.dcm',
            publicUrl: 'https://placeholder.com/mock-dicom-url', // Frontend will replace this with real URL later
          }
        ]
      }
    }
  })
  console.log('🩻 Exams & PACS images created')

  console.log('✅ Seeding Finished!')
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })