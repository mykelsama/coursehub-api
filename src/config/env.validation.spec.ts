import { validateEnvironment } from './env.validation.js';

describe('envValidationSchema', () => {
  const validConfig = {
    DB_HOST: 'localhost',
    DB_NAME: 'coursehub',
    DB_USER: 'postgres',
    DB_PASSWORD: '',
    NODE_ENV: 'test',
    JWT_SECRET: 'test-only-secret-with-at-least-32-characters',
  };

  it('requires database settings and applies defaults', () => {
    const value = validateEnvironment(validConfig);

    expect(value).toMatchObject({
      NODE_ENV: 'test',
      PORT: 3000,
      DB_PORT: 5432,
      CORS_ORIGINS: ['http://localhost:5173'],
    });
  });

  it('rejects missing required settings', () => {
    expect(() =>
      validateEnvironment({
        DB_NAME: 'coursehub',
        DB_PASSWORD: '',
      }),
    ).toThrow(/DB_HOST/);

    expect(() =>
      validateEnvironment({
        DB_NAME: 'coursehub',
        DB_PASSWORD: '',
      }),
    ).toThrow(/DB_USER|DB_USERNAME/);
  });

  it('rejects invalid ports and environment names', () => {
    expect(() =>
      validateEnvironment({
        ...validConfig,
        PORT: 'not-a-number',
        NODE_ENV: 'staging',
      }),
    ).toThrow(/PORT/);

    expect(() =>
      validateEnvironment({
        ...validConfig,
        PORT: 'not-a-number',
        NODE_ENV: 'staging',
      }),
    ).toThrow(/NODE_ENV/);
  });

  it('requires a non-empty password in production', () => {
    expect(() =>
      validateEnvironment({
        ...validConfig,
        NODE_ENV: 'production',
      }),
    ).toThrow(/DB_PASSWORD/);
  });

  it('accepts explicit comma-separated origins without wildcards', () => {
    const value = validateEnvironment({
      ...validConfig,
      CORS_ORIGINS: 'http://localhost:5173, https://coursehub.example.edu',
    });

    expect(value.CORS_ORIGINS).toEqual([
      'http://localhost:5173',
      'https://coursehub.example.edu',
    ]);
  });

  it('rejects wildcard or malformed CORS origins', () => {
    expect(() =>
      validateEnvironment({
        ...validConfig,
        CORS_ORIGINS: '*',
      }),
    ).toThrow(/CORS_ORIGINS/);

    expect(() =>
      validateEnvironment({
        ...validConfig,
        CORS_ORIGINS: 'localhost:5173',
      }),
    ).toThrow(/CORS_ORIGINS/);
  });

  it('requires an explicit HTTPS origin in production', () => {
    expect(() =>
      validateEnvironment({
        ...validConfig,
        NODE_ENV: 'production',
        DB_PASSWORD: 'production-db-password',
        CORS_ORIGINS: 'http://coursehub.example.edu',
      }),
    ).toThrow(/CORS_ORIGINS/);
  });

  it('accepts the previous DB_USERNAME variable for local compatibility', () => {
    const value = validateEnvironment({
      DB_HOST: 'localhost',
      DB_NAME: 'coursehub',
      DB_USERNAME: 'postgres',
      DB_PASSWORD: '',
      JWT_SECRET: 'test-only-secret-with-at-least-32-characters',
    });

    expect(value.DB_USER).toBe('postgres');
  });

  it('does not include environment values in validation errors', () => {
    let validationError: Error | undefined;

    try {
      validateEnvironment({
        ...validConfig,
        DB_PASSWORD: 'must-not-appear-in-errors',
        JWT_SECRET: undefined,
      });
    } catch (error) {
      if (error instanceof Error) {
        validationError = error;
      }
    }

    expect(validationError).toBeInstanceOf(Error);
    expect(validationError?.message).toContain('JWT_SECRET');
    expect(JSON.stringify(validationError)).not.toContain(
      'must-not-appear-in-errors',
    );
    expect(JSON.stringify(validationError)).not.toContain(
      'test-only-secret-with-at-least-32-characters',
    );
  });
});
