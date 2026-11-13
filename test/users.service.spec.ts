import { NotFoundException } from '@nestjs/common';
import { describe, expect, it, vi } from 'vitest';
import { UsersService } from '../src/users/users.service.js';

describe('UsersService', () => {
  it('devuelve usuarios sin passwordHash', async () => {
    const users = [{ id: 'user-1', email: 'test@test.com' }];
    const prisma = { user: { findMany: vi.fn().mockResolvedValue(users) } };
    const service = new UsersService(prisma as any);

    await expect(service.getAll()).resolves.toEqual(users);
    expect(prisma.user.findMany).toHaveBeenCalledWith(expect.objectContaining({ select: expect.not.objectContaining({ passwordHash: true }) }));
  });

  it('lanza NotFoundException si no encuentra un usuario', async () => {
    const prisma = { user: { findUnique: vi.fn().mockResolvedValue(null) } };
    const service = new UsersService(prisma as any);

    await expect(service.getById('missing')).rejects.toBeInstanceOf(NotFoundException);
  });

  it('findPublicById devuelve null sin convertirlo en error', async () => {
    const prisma = { user: { findUnique: vi.fn().mockResolvedValue(null) } };
    const service = new UsersService(prisma as any);

    await expect(service.findPublicById('missing')).resolves.toBeNull();
  });
});
