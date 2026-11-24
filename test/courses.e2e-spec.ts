import request from 'supertest';
import { UserRole } from '../src/users/user-role.enum.js';
import {
  createTestApp,
  createUserAndLogin,
  type TestApp,
} from './utils/create-test-app.js';

describe('Courses (e2e)', () => {
  let testApp: TestApp;

  beforeEach(async () => {
    testApp = await createTestApp();
  });

  afterEach(async () => {
    await testApp.app.close();
  });

  const http = () => request(testApp.app.getHttpServer());
  const newCourse = { title: 'NestJS e2e', level: 'beginner' };

  it('GET /courses lists courses publicly and starts empty', async () => {
    const response = await http().get('/courses').expect(200);

    expect(response.body).toEqual({
      items: [],
      meta: { total: 0, page: 1, limit: 10, totalPages: 0 },
    });
  });

  it('POST /courses without a token responds 401 and creates nothing', async () => {
    const response = await http().post('/courses').send(newCourse).expect(401);

    expect(response.body).toMatchObject({ statusCode: 401, path: '/courses' });
    const list = await http().get('/courses').expect(200);
    expect(list.body.meta.total).toBe(0);
  });

  it('POST /courses with a student role responds 403 and creates nothing', async () => {
    const student = await createUserAndLogin(
      testApp,
      'student@coursehub.test',
      UserRole.STUDENT,
    );

    await http()
      .post('/courses')
      .set('Authorization', `Bearer ${student.token}`)
      .send(newCourse)
      .expect(403);

    const list = await http().get('/courses').expect(200);
    expect(list.body.meta.total).toBe(0);
  });

  it('POST /courses as a teacher creates the course owned by that teacher', async () => {
    const teacher = await createUserAndLogin(
      testApp,
      'teacher@coursehub.test',
      UserRole.TEACHER,
    );

    const created = await http()
      .post('/courses')
      .set('Authorization', `Bearer ${teacher.token}`)
      .send(newCourse)
      .expect(201);

    expect(created.body).toMatchObject({
      id: expect.any(Number),
      ...newCourse,
      createdByUserId: teacher.id,
    });

    const list = await http().get('/courses').expect(200);
    expect(list.body.items).toEqual([
      expect.objectContaining({ id: created.body.id, title: newCourse.title }),
    ]);
  });

  it('POST /courses rejects an invalid body with 400', async () => {
    const teacher = await createUserAndLogin(
      testApp,
      'teacher@coursehub.test',
      UserRole.TEACHER,
    );

    const response = await http()
      .post('/courses')
      .set('Authorization', `Bearer ${teacher.token}`)
      .send({ title: '', level: 'expert', price: 10 })
      .expect(400);

    expect(response.body.message).toEqual(expect.any(Array));
  });

  it('PATCH /courses/:id by a different teacher responds 403 and keeps the course', async () => {
    const owner = await createUserAndLogin(
      testApp,
      'owner@coursehub.test',
      UserRole.TEACHER,
    );
    const other = await createUserAndLogin(
      testApp,
      'other@coursehub.test',
      UserRole.TEACHER,
    );

    const created = await http()
      .post('/courses')
      .set('Authorization', `Bearer ${owner.token}`)
      .send(newCourse)
      .expect(201);

    await http()
      .patch(`/courses/${created.body.id}`)
      .set('Authorization', `Bearer ${other.token}`)
      .send({ title: 'Cambio no autorizado' })
      .expect(403);

    const course = await http().get(`/courses/${created.body.id}`).expect(200);
    expect(course.body.title).toBe(newCourse.title);
  });

  it('PATCH /courses/:id by the owner teacher updates the course', async () => {
    const owner = await createUserAndLogin(
      testApp,
      'owner@coursehub.test',
      UserRole.TEACHER,
    );

    const created = await http()
      .post('/courses')
      .set('Authorization', `Bearer ${owner.token}`)
      .send(newCourse)
      .expect(201);

    const updated = await http()
      .patch(`/courses/${created.body.id}`)
      .set('Authorization', `Bearer ${owner.token}`)
      .send({ title: 'NestJS avanzado' })
      .expect(200);

    expect(updated.body.title).toBe('NestJS avanzado');
  });

  it('GET /courses/:id with a non-numeric id responds 400', async () => {
    await http().get('/courses/abc').expect(400);
  });
});
