import request from 'supertest';
import { createTestApp, type TestApp } from './utils/create-test-app.js';

describe('AppController (e2e)', () => {
  let testApp: TestApp;

  beforeEach(async () => {
    testApp = await createTestApp();
  });

  afterEach(async () => {
    await testApp.app.close();
  });

  it('GET / responds with the API status message', () => {
    return request(testApp.app.getHttpServer())
      .get('/')
      .expect(200)
      .expect('CourseHub API esta en línea');
  });
});
