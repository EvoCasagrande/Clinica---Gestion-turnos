import 'dotenv/config';
import bcrypt from 'bcrypt';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient, AppointmentStatus, Role } from '../dist/generated/prisma/client.js';

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error('DATABASE_URL environment variable is not defined');
}

const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

const passwordHash = await bcrypt.hash('Password123!', 10);

try {
  const admin = await prisma.user.upsert({
    where: { email: 'admin@clinica.local' },
    update: { role: Role.ADMIN, passwordHash },
    create: {
      email: 'admin@clinica.local',
      passwordHash,
      role: Role.ADMIN,
    },
  });

  const doctorUser = await prisma.user.upsert({
    where: { email: 'doctor@clinica.local' },
    update: { role: Role.DOCTOR, passwordHash },
    create: {
      email: 'doctor@clinica.local',
      passwordHash,
      role: Role.DOCTOR,
    },
  });

  const patientUser = await prisma.user.upsert({
    where: { email: 'patient@clinica.local' },
    update: { role: Role.PATIENT, passwordHash },
    create: {
      email: 'patient@clinica.local',
      passwordHash,
      role: Role.PATIENT,
    },
  });

  const doctor = await prisma.doctorProfile.upsert({
    where: { userId: doctorUser.id },
    update: {
      firstName: 'Laura',
      lastName: 'Gómez',
      licenseNumber: 'MN-10001',
      bio: 'Especialista en clínica médica.',
    },
    create: {
      userId: doctorUser.id,
      firstName: 'Laura',
      lastName: 'Gómez',
      licenseNumber: 'MN-10001',
      bio: 'Especialista en clínica médica.',
    },
  });

  const patient = await prisma.patientProfile.upsert({
    where: { userId: patientUser.id },
    update: {
      firstName: 'Martín',
      lastName: 'Pérez',
      phone: '+54 11 5555-0101',
      birthDate: new Date('1995-06-15T00:00:00.000Z'),
    },
    create: {
      userId: patientUser.id,
      firstName: 'Martín',
      lastName: 'Pérez',
      phone: '+54 11 5555-0101',
      birthDate: new Date('1995-06-15T00:00:00.000Z'),
    },
  });

  const clinicalMedicine = await prisma.specialty.upsert({
    where: { name: 'Clínica médica' },
    update: { description: 'Atención médica general y seguimiento clínico.' },
    create: {
      name: 'Clínica médica',
      description: 'Atención médica general y seguimiento clínico.',
    },
  });

  const cardiology = await prisma.specialty.upsert({
    where: { name: 'Cardiología' },
    update: { description: 'Prevención y tratamiento de enfermedades cardiovasculares.' },
    create: {
      name: 'Cardiología',
      description: 'Prevención y tratamiento de enfermedades cardiovasculares.',
    },
  });

  await prisma.doctorSpecialty.upsert({
    where: { doctorId_specialtyId: { doctorId: doctor.id, specialtyId: clinicalMedicine.id } },
    update: {},
    create: { doctorId: doctor.id, specialtyId: clinicalMedicine.id },
  });

  await prisma.doctorSpecialty.upsert({
    where: { doctorId_specialtyId: { doctorId: doctor.id, specialtyId: cardiology.id } },
    update: {},
    create: { doctorId: doctor.id, specialtyId: cardiology.id },
  });

  const startsAt = new Date('2030-01-15T14:00:00.000Z');
  const endsAt = new Date('2030-01-15T17:00:00.000Z');
  const existingBlock = await prisma.scheduleBlock.findFirst({
    where: { doctorId: doctor.id, startsAt, endsAt },
  });

  const scheduleBlock = existingBlock ?? await prisma.scheduleBlock.create({
    data: { doctorId: doctor.id, startsAt, endsAt },
  });

  const appointmentStartsAt = new Date('2030-01-15T14:30:00.000Z');
  const appointmentEndsAt = new Date('2030-01-15T15:00:00.000Z');
  const existingAppointment = await prisma.appointment.findFirst({
    where: {
      doctorId: doctor.id,
      patientId: patient.id,
      startsAt: appointmentStartsAt,
      endsAt: appointmentEndsAt,
    },
  });

  if (!existingAppointment) {
    await prisma.appointment.create({
      data: {
        doctorId: doctor.id,
        patientId: patient.id,
        startsAt: appointmentStartsAt,
        endsAt: appointmentEndsAt,
        status: AppointmentStatus.SCHEDULED,
      },
    });
  }

  console.log('Seed completada correctamente.');
  console.log('Usuarios: admin@clinica.local, doctor@clinica.local, patient@clinica.local');
  console.log('Contraseña de desarrollo: Password123!');
  console.log(`Admin creado/actualizado: ${admin.email}`);
} finally {
  await prisma.$disconnect();
}
