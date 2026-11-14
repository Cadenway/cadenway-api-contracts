import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    // The .mjs specs test the plain Node scripts of scripts/.
    include: ['tests/**/*.spec.ts', 'tests/**/*.spec.mjs'],
  },
});
