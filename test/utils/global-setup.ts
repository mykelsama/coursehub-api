import { existsSync } from 'node:fs';
import pg from 'pg';
import { TEST_DB_NAME } from './test-env.js';

/**
 * Crea la base de datos de pruebas si no existe. Se ejecuta una sola vez
 * antes de todas las pruebas e2e.
 */
export default async function globalSetup(): Promise<void> {
  if (existsSync('.env')) {
    // No sobrescribe variables ya definidas (por ejemplo, las del CI).
    process.loadEnvFile('.env');
  }

  if (!/_test$/.test(TEST_DB_NAME)) {
    throw new Error(
      `La base de pruebas debe terminar en "_test" (recibido: "${TEST_DB_NAME}")`,
    );
  }

  const client = new pg.Client({
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT ?? 5432),
    user: process.env.DB_USER ?? process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: 'postgres',
  });

  await client.connect();
  try {
    const { rowCount } = await client.query(
      'SELECT 1 FROM pg_database WHERE datname = $1',
      [TEST_DB_NAME],
    );
    if (!rowCount) {
      await client.query(`CREATE DATABASE "${TEST_DB_NAME}"`);
    }
  } finally {
    await client.end();
  }
}
