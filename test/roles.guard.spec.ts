import { ExecutionContext, ForbiddenException, UnauthorizedException } from '@nestjs/common';
import { describe, expect, it, vi } from 'vitest';
import { Role } from '../src/generated/prisma/client.js';
import { RolesGuard } from '../src/auth/guards/roles.guard.js';

function context(user?: unknown) {
  return {
    getHandler: vi.fn(),
    getClass: vi.fn(),
    switchToHttp: () => ({ getRequest: () => ({ user }) }),
  } as unknown as ExecutionContext;
}

describe('RolesGuard', () => {
  it('permite cuando no se definieron roles', () => {
    const reflector = { getAllAndOverride: vi.fn().mockReturnValue(undefined) };
    expect(new RolesGuard(reflector as any).canActivate(context())).toBe(true);
  });

  it('rechaza si falta el usuario autenticado', () => {
    const reflector = { getAllAndOverride: vi.fn().mockReturnValue([Role.ADMIN]) };
    expect(() => new RolesGuard(reflector as any).canActivate(context())).toThrow(UnauthorizedException);
  });

  it('rechaza un rol que no está autorizado', () => {
    const reflector = { getAllAndOverride: vi.fn().mockReturnValue([Role.ADMIN]) };
    expect(() => new RolesGuard(reflector as any).canActivate(context({ role: Role.PATIENT }))).toThrow(ForbiddenException);
  });

  it('permite un rol autorizado', () => {
    const reflector = { getAllAndOverride: vi.fn().mockReturnValue([Role.ADMIN]) };
    expect(new RolesGuard(reflector as any).canActivate(context({ role: Role.ADMIN }))).toBe(true);
  });
});
