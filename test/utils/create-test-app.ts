import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { App } from 'supertest/types';
import { DataSource } from 'typeorm';
import { AppModule } from '../../src/app.module.js';
import { configureApp } from '../../src/app.setup.js';
import { User } from '../../src/users/entities/user.entity.js';
import { UserRole } from '../../src/users/user-role.enum.js';

export type TestApp = {
  app: INestApplication<App>;
  dataSource: DataSource;
};

/**
 * Arranca la aplicación completa (rutas, guards, pipes, filter, persistencia)
 * y deja la base de pruebas vacía con el esquema actual de las entidades.
 */
export async function createTestApp(): Promise<TestApp> {
  const moduleFixture = await Test.createTestingModule({
    imports: [AppModule],
  }).compile();

  const app = moduleFixture.createNestApplication<INestApplication<App>>({
    logger: false,
  });
  configureApp(app);
  await app.init();

  const dataSource = app.get(DataSource);
  const { database } = dataSource.options;
  if (typeof database !== 'string' || !database.endsWith('_test')) {
    await app.close();
    throw new Error(
      `Las pruebas e2e solo pueden limpiar una base "_test" (actual: "${String(database)}")`,
    );
  }

  // Elimina todas las tablas y las recrea: cada prueba empieza sin datos.
  await dataSource.synchronize(true);

  return { app, dataSource };
}

/**
 * Crea una identidad de práctica con el rol indicado y devuelve su token.
 * El registro público siempre crea estudiantes, por eso el rol se asigna
 * directamente en la base de pruebas.
 */
export async function createUserAndLogin(
  { app, dataSource }: TestApp,
  email: string,
  role: UserRole,
): Promise<{ id: number; token: string }> {
  const password = 'Practica-e2e-123';

  const registered = await request(app.getHttpServer())
    .post('/auth/register')
    .send({ email, password })
    .expect(201);

  if (role !== UserRole.STUDENT) {
    await dataSource.getRepository(User).update({ email }, { role });
  }

  const login = await request(app.getHttpServer())
    .post('/auth/login')
    .send({ email, password })
    .expect(200);

  return { id: registered.body.id as number, token: login.body.accessToken as string };
}
