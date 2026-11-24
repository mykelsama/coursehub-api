import { defineConfig } from 'vitest/config';
import tsconfigPaths from 'vite-tsconfig-paths';
import { testEnv } from './test/utils/test-env.js';

export default defineConfig({
  plugins: [tsconfigPaths()],
  test: {
    globals: true,
    root: './',
    include: ['**/*.e2e-spec.ts'],
    env: testEnv,
    globalSetup: ['./test/utils/global-setup.ts'],
    // Todos los archivos comparten la base de pruebas: se ejecutan en serie
    // (equivalente a `--runInBand` de Jest) para que no se pisen los datos.
    fileParallelism: false,
    hookTimeout: 30_000,
    testTimeout: 30_000,
  },
});
