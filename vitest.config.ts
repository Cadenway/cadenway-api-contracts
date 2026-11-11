import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    include: ['test/**/*.spec.ts'],
    // The pipeline tests start the real tools (orval, Modelina, Spectral, Redocly, the TypeScript
    // and Angular compilers) as child processes, which takes seconds rather than milliseconds.
    testTimeout: 120_000,
    hookTimeout: 240_000,
  },
});
