// prisma/seed.js
const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
  // 1. Create the Default Admin
  const admin = await prisma.user.upsert({
    where: { email: 'admin@sportshis.com' },
    update: {}, // If exists, do nothing
    create: {
      email: 'admin@sportshis.com',
      password_hash: 'secure_password_123', // In real app, hash this!
      role: 'ADMIN',
    },
  })

  // 2. Create a Default Clinician
  const physio = await prisma.user.upsert({
    where: { email: 'doc@sportshis.com' },
    update: {},
    create: {
      email: 'doc@sportshis.com',
      password_hash: '123456',
      role: 'CLINICIAN',
      clinicianProfile: {
        create: {
          specialty: 'Physiotherapist'
        }
      }
    },
  })

  console.log({ admin, physio })
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