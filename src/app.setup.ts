import { INestApplication, ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

/**
 * Configuración compartida entre `main.ts` y las pruebas e2e, para que las
 * pruebas ejerciten exactamente la misma aplicación que se despliega.
 */
export function configureApp(app: INestApplication): void {
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  const config = app.get(ConfigService);

  const origins = config
    .getOrThrow<string>('CORS_ORIGINS')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);

  app.enableCors({
    origin: origins,
    methods: ['GET', 'POST', 'PATCH', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  });
}
