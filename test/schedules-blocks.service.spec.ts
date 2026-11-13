import { BadRequestException, ConflictException, ForbiddenException, NotFoundException } from '@nestjs/common';
import { describe, expect, it, vi } from 'vitest';
import { Role } from '../src/generated/prisma/client.js';
import { SchedulesBlocksService } from '../src/schedules-blocks/schedules-blocks.service.js';

const future = (minutes: number) => new Date(Date.now() + minutes * 60_000).toISOString();
const doctor = { id: 'doctor-user', role: Role.DOCTOR } as any;
const admin = { id: 'admin-user', role: Role.ADMIN } as any;

function createPrismaMock() {
  return {
    doctorProfile: { findUnique: vi.fn() },
    scheduleBlock: { findUnique: vi.fn(), findFirst: vi.fn(), create: vi.fn(), update: vi.fn(), delete: vi.fn() },
  };
}

describe('SchedulesBlocksService', () => {
  it('permite a un médico crear disponibilidad propia', async () => {
    const prisma = createPrismaMock();
    prisma.doctorProfile.findUnique.mockResolvedValue({ id: 'doctor-profile', userId: 'doctor-user' });
    prisma.scheduleBlock.findFirst.mockResolvedValue(null);
    prisma.scheduleBlock.create.mockResolvedValue({ id: 'block-1' });
    const service = new SchedulesBlocksService(prisma as any);

    await expect(service.create(doctor, { doctorId: 'doctor-profile', startsAt: future(60), endsAt: future(120) }))
      .resolves.toEqual({ id: 'block-1' });
  });

  it('impide que un médico gestione disponibilidad ajena', async () => {
    const prisma = createPrismaMock();
    prisma.doctorProfile.findUnique.mockResolvedValue({ id: 'doctor-profile', userId: 'other-doctor' });
    const service = new SchedulesBlocksService(prisma as any);

    await expect(service.create(doctor, { doctorId: 'doctor-profile', startsAt: future(60), endsAt: future(120) }))
      .rejects.toBeInstanceOf(ForbiddenException);
  });

  it('rechaza una disponibilidad con fechas invertidas', async () => {
    const prisma = createPrismaMock();
    prisma.doctorProfile.findUnique.mockResolvedValue({ id: 'doctor-profile', userId: 'doctor-user' });
    const service = new SchedulesBlocksService(prisma as any);

    await expect(service.create(doctor, { doctorId: 'doctor-profile', startsAt: future(120), endsAt: future(60) }))
      .rejects.toBeInstanceOf(BadRequestException);
  });

  it('rechaza una disponibilidad superpuesta', async () => {
    const prisma = createPrismaMock();
    prisma.doctorProfile.findUnique.mockResolvedValue({ id: 'doctor-profile', userId: 'doctor-user' });
    prisma.scheduleBlock.findFirst.mockResolvedValue({ id: 'existing-block' });
    const service = new SchedulesBlocksService(prisma as any);

    await expect(service.create(doctor, { doctorId: 'doctor-profile', startsAt: future(60), endsAt: future(120) }))
      .rejects.toBeInstanceOf(ConflictException);
  });

  it('permite al administrador eliminar un bloque existente', async () => {
    const prisma = createPrismaMock();
    prisma.scheduleBlock.findUnique.mockResolvedValue({ id: 'block-1', doctorId: 'doctor-profile' });
    prisma.doctorProfile.findUnique.mockResolvedValue({ userId: 'doctor-user' });
    const service = new SchedulesBlocksService(prisma as any);

    await expect(service.remove(admin, 'block-1')).resolves.toBeUndefined();
    expect(prisma.scheduleBlock.delete).toHaveBeenCalledWith({ where: { id: 'block-1' } });
  });

  it('devuelve 404 al consultar un bloque inexistente', async () => {
    const prisma = createPrismaMock();
    prisma.scheduleBlock.findUnique.mockResolvedValue(null);
    const service = new SchedulesBlocksService(prisma as any);

    await expect(service.findOne('missing')).rejects.toBeInstanceOf(NotFoundException);
  });
});
