import { ConfigService } from '@nestjs/config';
import { createDatabaseOptions } from './database.config.js';

describe('createDatabaseOptions', () => {
  const config = (nodeEnv: string) =>
    new ConfigService({
      NODE_ENV: nodeEnv,
      DB_HOST: 'localhost',
      DB_PORT: 5432,
      DB_USER: 'coursehub_local',
      DB_PASSWORD: 'local-only-test-password',
      DB_NAME: 'coursehub',
    });

  it('enables synchronization and loads registered entities in development', () => {
    const options = createDatabaseOptions(config('development'));

    expect(options).toMatchObject({
      type: 'postgres',
      host: 'localhost',
      port: 5432,
      username: 'coursehub_local',
      database: 'coursehub',
      autoLoadEntities: true,
      synchronize: true,
    });
  });

  it.each(['production', 'test'])(
    'disables synchronization in %s',
    (nodeEnv) => {
      const options = createDatabaseOptions(config(nodeEnv));

      expect(options.synchronize).toBe(false);
      expect(options.autoLoadEntities).toBe(true);
    },
  );
});
