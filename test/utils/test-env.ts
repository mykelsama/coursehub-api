/**
 * Variables de entorno exclusivas de las pruebas e2e.
 *
 * Tienen prioridad sobre `.env` (ConfigModule no sobrescribe variables que ya
 * existen en `process.env`), así que las pruebas nunca usan la base de datos
 * de desarrollo ni el JWT_SECRET real. Las credenciales de conexión
 * (DB_HOST, DB_USER, DB_PASSWORD...) siguen saliendo de `.env` en local o de
 * las variables del flujo de CI.
 */
export const TEST_DB_NAME = process.env.DB_NAME_TEST ?? 'coursehub_test';

export const testEnv = {
  NODE_ENV: 'test',
  DB_NAME: TEST_DB_NAME,
  JWT_SECRET: 'e2e-only-secret-that-is-not-used-anywhere-else-123',
  JWT_EXPIRES_IN: '15m',
};
