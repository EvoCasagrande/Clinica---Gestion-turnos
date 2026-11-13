import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types.js';
import { AppModule } from './../src/app.module.js';

describe('Aplicación (e2e)', () => {
  let app: INestApplication<App>;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  it('devuelve 404 para una ruta inexistente', () => {
    return request(app.getHttpServer())
      .get('/ruta-que-no-existe')
      .expect(404);
  });

  afterEach(async () => {
    await app.close();
  });
});
