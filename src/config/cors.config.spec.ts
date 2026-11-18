import { Controller, Get, INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import type { App } from 'supertest/types';
import { createCorsOptions } from './cors.config.js';

@Controller('cors-test')
class CorsTestController {
  @Get()
  get() {
    return { ok: true };
  }
}

describe('CORS configuration', () => {
  let app: INestApplication<App>;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      controllers: [CorsTestController],
    }).compile();

    app = moduleRef.createNestApplication();
    app.enableCors(createCorsOptions(['http://localhost:5173']));
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('allows the configured browser origin', async () => {
    await request(app.getHttpServer())
      .get('/cors-test')
      .set('Origin', 'http://localhost:5173')
      .expect(200)
      .expect('Access-Control-Allow-Origin', 'http://localhost:5173');
  });

  it('does not grant CORS access to an unconfigured origin', async () => {
    await request(app.getHttpServer())
      .get('/cors-test')
      .set('Origin', 'https://untrusted.example')
      .expect(200)
      .expect((response) => {
        expect(response.headers['access-control-allow-origin']).toBeUndefined();
      });
  });
});
