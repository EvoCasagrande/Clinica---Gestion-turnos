import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { describe, expect, it, beforeAll, afterAll } from 'vitest';
import { AppModule } from '../src/app.module.js';

describe('Auth flow (e2e)', () => {
  let app: INestApplication;
  let email: string;
  let password: string;
  let token: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.setGlobalPrefix('api/v1');
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }));
    await app.init();

    email = `e2e-${Date.now()}@clinica.local`;
    password = 'Password123!';
  });

  afterAll(async () => {
    await app.close();
  });

  it('registra un paciente', async () => {
    const response = await request(app.getHttpServer())
      .post('/api/v1/auth/register')
      .send({ email, password })
      .expect(201);

    expect(response.body.email).toBe(email);
    expect(response.body).not.toHaveProperty('passwordHash');
  });

  it('inicia sesión y obtiene un JWT', async () => {
    const response = await request(app.getHttpServer())
      .post('/api/v1/auth/login')
      .send({ email, password })
      .expect(201);

    expect(response.body.token).toEqual(expect.any(String));
    token = response.body.token;
  });

  it('devuelve el usuario autenticado en /auth/me', async () => {
    const response = await request(app.getHttpServer())
      .get('/api/v1/auth/me')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    expect(response.body.email).toBe(email);
    expect(response.body).not.toHaveProperty('passwordHash');
  });
});
