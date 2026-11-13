import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { beforeAll, afterAll, describe, expect, it } from 'vitest';
import { AppModule } from '../src/app.module.js';

describe('Appointments flow (e2e)', () => {
  let app: INestApplication;
  let patientToken: string;
  let doctorToken: string;
  let doctorId: string;
  let appointmentId: string;
  let startsAt: string;
  let endsAt: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.setGlobalPrefix('api/v1');
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }));
    await app.init();

    const doctorLogin = await request(app.getHttpServer())
      .post('/api/v1/auth/login')
      .send({ email: 'doctor@clinica.local', password: 'Password123!' })
      .expect(201);

    doctorToken = doctorLogin.body.token;
    const doctorUserId = doctorLogin.body.publicUser.id;

    const doctorsResponse = await request(app.getHttpServer())
      .get('/api/v1/doctors-profiles')
      .expect(200);

    const doctor = doctorsResponse.body.find((profile: { userId: string }) => profile.userId === doctorUserId);
    expect(doctor).toBeDefined();
    doctorId = doctor.id;

    const email = `appointments-e2e-${Date.now()}@clinica.local`;
    const password = 'Password123!';

    await request(app.getHttpServer())
      .post('/api/v1/auth/register')
      .send({ email, password })
      .expect(201);

    const patientLogin = await request(app.getHttpServer())
      .post('/api/v1/auth/login')
      .send({ email, password })
      .expect(201);

    patientToken = patientLogin.body.token;

    await request(app.getHttpServer())
      .post('/api/v1/patients-profiles/me')
      .set('Authorization', `Bearer ${patientToken}`)
      .send({ firstName: 'Paciente', lastName: 'E2E' })
      .expect(201);

    const uniqueOffset = Date.now() % (24 * 60 * 60 * 1000);
    const blockStart = new Date(Date.now() + 48 * 60 * 60 * 1000 + uniqueOffset);
    const blockEnd = new Date(blockStart.getTime() + 60 * 60 * 1000);
    startsAt = blockStart.toISOString();
    endsAt = new Date(blockStart.getTime() + 30 * 60 * 1000).toISOString();

    await request(app.getHttpServer())
      .post('/api/v1/schedules-blocks')
      .set('Authorization', `Bearer ${doctorToken}`)
      .send({
        doctorId,
        startsAt,
        endsAt: blockEnd.toISOString(),
      })
      .expect(201);
  });

  afterAll(async () => {
    await app.close();
  });

  it('permite reservar un turno disponible', async () => {
    const response = await request(app.getHttpServer())
      .post('/api/v1/appointments')
      .set('Authorization', `Bearer ${patientToken}`)
      .send({ doctorId, startsAt, endsAt })
      .expect(201);

    expect(response.body.status).toBe('SCHEDULED');
    appointmentId = response.body.id;
  });

  it('muestra el turno en mis turnos', async () => {
    const response = await request(app.getHttpServer())
      .get('/api/v1/appointments/my')
      .set('Authorization', `Bearer ${patientToken}`)
      .expect(200);

    expect(response.body.some((appointment: { id: string }) => appointment.id === appointmentId)).toBe(true);
  });

  it('permite reprogramar y cancelar el turno', async () => {
    const newStartsAt = new Date(new Date(startsAt).getTime() + 30 * 60 * 1000).toISOString();
    const newEndsAt = new Date(new Date(startsAt).getTime() + 60 * 60 * 1000).toISOString();

    await request(app.getHttpServer())
      .patch(`/api/v1/appointments/${appointmentId}/reschedule`)
      .set('Authorization', `Bearer ${patientToken}`)
      .send({ startsAt: newStartsAt, endsAt: newEndsAt })
      .expect(200);

    const response = await request(app.getHttpServer())
      .patch(`/api/v1/appointments/${appointmentId}/cancel`)
      .set('Authorization', `Bearer ${patientToken}`)
      .expect(200);

    expect(response.body.status).toBe('CANCELLED');
  });
});
