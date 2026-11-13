import { BadRequestException, ConflictException, ForbiddenException, NotFoundException } from '@nestjs/common';
import { describe, expect, it, vi } from 'vitest';
import { AppointmentStatus, Role } from '../src/generated/prisma/client.js';
import { AppointmentsService } from '../src/appointments/appointments.service.js';

const future = (minutes: number) => new Date(Date.now() + minutes * 60_000).toISOString();

function createPrismaMock() {
  return {
    patientProfile: { findUnique: vi.fn() },
    doctorProfile: { findUnique: vi.fn() },
    scheduleBlock: { findFirst: vi.fn() },
    appointment: {
      findFirst: vi.fn(),
      findUnique: vi.fn(),
      findMany: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
    },
  };
}

const patient = { id: 'patient-user', role: Role.PATIENT } as any;
const doctor = { id: 'doctor-user', role: Role.DOCTOR } as any;
const admin = { id: 'admin-user', role: Role.ADMIN } as any;

describe('AppointmentsService', () => {
  it('crea un turno dentro de disponibilidad y sin superposición', async () => {
    const prisma = createPrismaMock();
    const service = new AppointmentsService(prisma as any);
    const startsAt = future(60);
    const endsAt = future(90);
    const created = { id: 'appointment-1', status: AppointmentStatus.SCHEDULED };

    prisma.patientProfile.findUnique.mockResolvedValue({ id: 'patient-profile' });
    prisma.doctorProfile.findUnique.mockResolvedValue({ id: 'doctor-profile' });
    prisma.scheduleBlock.findFirst.mockResolvedValue({ id: 'block-1' });
    prisma.appointment.findFirst.mockResolvedValue(null);
    prisma.appointment.create.mockResolvedValue(created);

    await expect(service.create(patient, { doctorId: 'doctor-profile', startsAt, endsAt })).resolves.toEqual(created);
    expect(prisma.appointment.create).toHaveBeenCalledWith(expect.objectContaining({
      data: expect.objectContaining({ patientId: 'patient-profile', doctorId: 'doctor-profile', status: AppointmentStatus.SCHEDULED }),
    }));
  });

  it('rechaza reservar si el paciente no tiene perfil', async () => {
    const prisma = createPrismaMock();
    prisma.patientProfile.findUnique.mockResolvedValue(null);
    const service = new AppointmentsService(prisma as any);

    await expect(service.create(patient, { doctorId: 'doctor', startsAt: future(60), endsAt: future(90) }))
      .rejects.toBeInstanceOf(NotFoundException);
  });

  it('rechaza un horario fuera de la disponibilidad', async () => {
    const prisma = createPrismaMock();
    prisma.patientProfile.findUnique.mockResolvedValue({ id: 'patient-profile' });
    prisma.doctorProfile.findUnique.mockResolvedValue({ id: 'doctor-profile' });
    prisma.scheduleBlock.findFirst.mockResolvedValue(null);
    const service = new AppointmentsService(prisma as any);

    await expect(service.create(patient, { doctorId: 'doctor-profile', startsAt: future(60), endsAt: future(90) }))
      .rejects.toBeInstanceOf(ConflictException);
  });

  it('rechaza una reserva superpuesta', async () => {
    const prisma = createPrismaMock();
    prisma.patientProfile.findUnique.mockResolvedValue({ id: 'patient-profile' });
    prisma.doctorProfile.findUnique.mockResolvedValue({ id: 'doctor-profile' });
    prisma.scheduleBlock.findFirst.mockResolvedValue({ id: 'block-1' });
    prisma.appointment.findFirst.mockResolvedValue({ id: 'existing' });
    const service = new AppointmentsService(prisma as any);

    await expect(service.create(patient, { doctorId: 'doctor-profile', startsAt: future(60), endsAt: future(90) }))
      .rejects.toBeInstanceOf(ConflictException);
  });

  it('permite reprogramar al paciente dueño y excluye el turno actual del solapamiento', async () => {
    const prisma = createPrismaMock();
    const appointment = { id: 'appointment-1', patientId: 'patient-profile', doctorId: 'doctor-profile', status: AppointmentStatus.SCHEDULED };
    prisma.appointment.findUnique.mockResolvedValue(appointment);
    prisma.patientProfile.findUnique.mockResolvedValue({ id: 'patient-profile' });
    prisma.scheduleBlock.findFirst.mockResolvedValue({ id: 'block-1' });
    prisma.appointment.findFirst.mockResolvedValue(null);
    prisma.appointment.update.mockResolvedValue({ ...appointment, startsAt: new Date(), endsAt: new Date() });
    const service = new AppointmentsService(prisma as any);

    await service.reschedule(patient, 'appointment-1', { startsAt: future(120), endsAt: future(150) });
    expect(prisma.appointment.findFirst).toHaveBeenCalledWith(expect.objectContaining({ where: expect.objectContaining({ id: { not: 'appointment-1' } }) }));
  });

  it('rechaza que un paciente acceda al turno de otro paciente', async () => {
    const prisma = createPrismaMock();
    prisma.appointment.findUnique.mockResolvedValue({ id: 'appointment-1', patientId: 'other-profile', doctorId: 'doctor-profile' });
    prisma.patientProfile.findUnique.mockResolvedValue({ id: 'patient-profile' });
    const service = new AppointmentsService(prisma as any);

    await expect(service.findOne(patient, 'appointment-1')).rejects.toBeInstanceOf(ForbiddenException);
  });

  it('solo permite al médico marcar completado o ausente', async () => {
    const prisma = createPrismaMock();
    prisma.appointment.findUnique.mockResolvedValue({ id: 'appointment-1', doctorId: 'doctor-profile', status: AppointmentStatus.SCHEDULED });
    prisma.doctorProfile.findUnique.mockResolvedValue({ id: 'doctor-profile' });
    const service = new AppointmentsService(prisma as any);

    await expect(service.updateStatus(doctor, 'appointment-1', { status: AppointmentStatus.CANCELLED }))
      .rejects.toBeInstanceOf(ForbiddenException);
  });

  it('rechaza cancelar un turno que ya no está programado', async () => {
    const prisma = createPrismaMock();
    prisma.appointment.findUnique.mockResolvedValue({ id: 'appointment-1', patientId: 'patient-profile', status: AppointmentStatus.COMPLETED });
    prisma.patientProfile.findUnique.mockResolvedValue({ id: 'patient-profile' });
    const service = new AppointmentsService(prisma as any);

    await expect(service.cancel(patient, 'appointment-1')).rejects.toBeInstanceOf(BadRequestException);
  });

  it('permite al administrador consultar cualquier turno', async () => {
    const prisma = createPrismaMock();
    const appointment = { id: 'appointment-1', patientId: 'patient-profile', doctorId: 'doctor-profile' };
    prisma.appointment.findUnique.mockResolvedValue(appointment);
    const service = new AppointmentsService(prisma as any);

    await expect(service.findOne(admin, 'appointment-1')).resolves.toEqual(appointment);
  });
});
