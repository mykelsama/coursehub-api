import Joi from 'joi';

export const envValidationSchema = Joi.object({
  NODE_ENV: Joi.string()
    .valid('development', 'test', 'production')
    .default('development'),
  PORT: Joi.number().port().default(3000),
  DB_HOST: Joi.string().trim().min(1).required(),
  DB_PORT: Joi.number().port().default(5432),
  DB_NAME: Joi.string().trim().min(1).required(),
  DB_USER: Joi.string().trim().min(1),
  DB_USERNAME: Joi.string().trim().min(1),
  DB_PASSWORD: Joi.string().when('NODE_ENV', {
    is: 'production',
    // Joi uses this key to define the production-only password constraint.
    // oxlint-disable-next-line unicorn/no-thenable
    then: Joi.string().min(1).required(),
    otherwise: Joi.string().allow('').required(),
  }),
  JWT_SECRET: Joi.string().trim().min(32).required(),
  JWT_EXPIRES_IN: Joi.string().trim().min(1).default('15m'),
  CORS_ORIGINS: Joi.when('NODE_ENV', {
    is: 'production',
    // Joi uses `then` to define the conditional production schema.
    // oxlint-disable-next-line unicorn/no-thenable
    then: Joi.string().trim().min(1).required(),
    otherwise: Joi.string().trim().min(1).default('http://localhost:5173'),
  }),
}).or('DB_USER', 'DB_USERNAME');

function parseCorsOrigins(value: string, nodeEnv: string): string[] {
  const origins = value.split(',').map((origin) => origin.trim());
  const isValid = origins.every((origin) => {
    if (!origin || origin === '*') {
      return false;
    }

    try {
      const parsed = new URL(origin);
      return (
        ['http:', 'https:'].includes(parsed.protocol) &&
        parsed.origin === origin &&
        !parsed.username &&
        !parsed.password &&
        (nodeEnv !== 'production' || parsed.protocol === 'https:')
      );
    } catch {
      return false;
    }
  });

  if (!isValid) {
    throw new Error(
      'Configuración de entorno inválida: CORS_ORIGINS (use orígenes HTTP/HTTPS explícitos separados por coma; producción requiere HTTPS)',
    );
  }

  return [...new Set(origins)];
}

export function validateEnvironment(
  config: Record<string, unknown>,
): Record<string, unknown> {
  const { error, value } = envValidationSchema.validate(config, {
    abortEarly: false,
    allowUnknown: true,
  });

  if (error) {
    const invalidVariables = error.details
      .map(({ path, type }) =>
        type === 'object.missing'
          ? 'DB_USER or DB_USERNAME is required'
          : `${path.join('.')} (${type})`,
      )
      .join(', ');
    throw new Error(`Configuración de entorno inválida: ${invalidVariables}`);
  }

  if (value.DB_USER === undefined) {
    value.DB_USER = value.DB_USERNAME;
  }

  value.CORS_ORIGINS = parseCorsOrigins(
    value.CORS_ORIGINS,
    value.NODE_ENV,
  );

  return value;
}
