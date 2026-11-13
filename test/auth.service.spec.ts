import { UnauthorizedException } from '@nestjs/common';
import { describe, expect, it, vi, beforeEach } from 'vitest';
import bcrypt from 'bcrypt';
import { AuthService } from '../src/auth/auth.service.js';
import { Role } from '../src/generated/prisma/client.js';

vi.mock('bcrypt', () => ({ default: { hash: vi.fn(), compare: vi.fn() } }));

describe('AuthService', () => {
  const prisma = { user: { create: vi.fn(), findUnique: vi.fn() } };
  const jwtService = { sign: vi.fn() };
  let service: AuthService;

  beforeEach(() => {
    vi.clearAllMocks();
    service = new AuthService(prisma as any, jwtService as any);
  });

  it('registra usando un hash y no guarda la contraseña original', async () => {
    vi.mocked(bcrypt.hash).mockResolvedValue('hashed-password' as never);
    const created = { id: 'user-1', email: 'test@test.com', role: Role.PATIENT };
    prisma.user.create.mockResolvedValue(created);

    await expect(service.register({ email: 'test@test.com', password: 'secret123' })).resolves.toEqual(created);
    expect(bcrypt.hash).toHaveBeenCalledWith('secret123', 10);
    expect(prisma.user.create).toHaveBeenCalledWith(expect.objectContaining({ data: expect.objectContaining({ passwordHash: 'hashed-password' }) }));
  });

  it('devuelve un token cuando las credenciales son correctas', async () => {
    prisma.user.findUnique.mockResolvedValue({ id: 'user-1', email: 'test@test.com', passwordHash: 'hash' });
    vi.mocked(bcrypt.compare).mockResolvedValue(true as never);
    jwtService.sign.mockReturnValue('jwt-token');

    await expect(service.login({ email: 'test@test.com', password: 'secret123' })).resolves.toEqual({
      publicUser: { id: 'user-1', email: 'test@test.com' },
      token: 'jwt-token',
    });
    expect(jwtService.sign).toHaveBeenCalledWith({ sub: 'user-1' });
  });

  it('usa el mismo error para email inexistente y contraseña incorrecta', async () => {
    prisma.user.findUnique.mockResolvedValue(null);
    await expect(service.login({ email: 'missing@test.com', password: 'secret123' })).rejects.toBeInstanceOf(UnauthorizedException);

    prisma.user.findUnique.mockResolvedValue({ id: 'user-1', email: 'test@test.com', passwordHash: 'hash' });
    vi.mocked(bcrypt.compare).mockResolvedValue(false as never);
    await expect(service.login({ email: 'test@test.com', password: 'wrong' })).rejects.toBeInstanceOf(UnauthorizedException);
  });
});
