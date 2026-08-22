const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

async function main() {
  const hash = await bcrypt.hash('password123', 10)

  // Create Admin
  const admin = await prisma.user.upsert({
    where: { email: 'sneha@dayflow.com' },
    update: {},
    create: {
      employeeId: 'ADM001',
      name: 'Sneha HR',
      email: 'sneha@dayflow.com',
      password: hash,
      role: 'ADMIN',
      department: 'HR',
      jobTitle: 'HR Manager',
      baseSalary: 60000,
      allowances: 8000,
      deductions: 3000,
      isEmailVerified: true
    }
  })

  // Create Employee 1
  const emp1 = await prisma.user.upsert({
    where: { email: 'aditya@dayflow.com' },
    update: {},
    create: {
      employeeId: 'EMP001',
      name: 'Aditya Kumar',
      email: 'aditya@dayflow.com',
      password: hash,
      role: 'EMPLOYEE',
      department: 'Engineering',
      jobTitle: 'Frontend Developer',
      baseSalary: 45000,
      allowances: 5000,
      deductions: 2000,
      isEmailVerified: true
    }
  })

  // Create Employee 2
  const emp2 = await prisma.user.upsert({
    where: { email: 'priya@dayflow.com' },
    update: {},
    create: {
      employeeId: 'EMP002',
      name: 'Priya Nair',
      email: 'priya@dayflow.com',
      password: hash,
      role: 'EMPLOYEE',
      department: 'Design',
      jobTitle: 'UI Designer',
      baseSalary: 42000,
      allowances: 4000,
      deductions: 1500,
      isEmailVerified: true
    }
  })

  // Create Employee 3
  const emp3 = await prisma.user.upsert({
    where: { email: 'rahul@dayflow.com' },
    update: {},
    create: {
      employeeId: 'EMP003',
      name: 'Rahul Mehta',
      email: 'rahul@dayflow.com',
      password: hash,
      role: 'EMPLOYEE',
      department: 'Marketing',
      jobTitle: 'Marketing Lead',
      baseSalary: 38000,
      allowances: 3500,
      deductions: 1200,
      isEmailVerified: true
    }
  })

  // Seed Attendance
  await prisma.attendance.createMany({
    data: [
      {
        userId: emp1.id,
        date: new Date('2026-08-19'),
        checkIn: new Date('2026-08-19T09:00:00'),
        checkOut: new Date('2026-08-19T18:00:00'),
        status: 'PRESENT'
      },
      {
        userId: emp1.id,
        date: new Date('2026-08-20'),
        checkIn: new Date('2026-08-20T09:15:00'),
        checkOut: new Date('2026-08-20T18:00:00'),
        status: 'PRESENT'
      },
      {
        userId: emp1.id,
        date: new Date('2026-08-21'),
        status: 'ABSENT'
      },
      {
        userId: emp2.id,
        date: new Date('2026-08-19'),
        checkIn: new Date('2026-08-19T09:30:00'),
        checkOut: new Date('2026-08-19T13:00:00'),
        status: 'HALF_DAY'
      },
      {
        userId: emp2.id,
        date: new Date('2026-08-20'),
        status: 'ABSENT'
      },
    ],
    skipDuplicates: true
  })

  // Seed Leave Requests
  await prisma.leaveRequest.createMany({
    data: [
      {
        userId: emp2.id,
        type: 'SICK',
        startDate: new Date('2026-08-25'),
        endDate: new Date('2026-08-26'),
        remarks: 'Fever and cold',
        status: 'PENDING'
      },
      {
        userId: emp3.id,
        type: 'PAID',
        startDate: new Date('2026-08-28'),
        endDate: new Date('2026-08-29'),
        remarks: 'Family function',
        status: 'APPROVED',
        reviewedBy: admin.id,
        comment: 'Approved. Enjoy!'
      }
    ],
    skipDuplicates: true
  })

  console.log('✅ Database seeded successfully!')
  console.log('👤 Admin: sneha@dayflow.com / password123')
  console.log('👤 Employee: aditya@dayflow.com / password123')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })