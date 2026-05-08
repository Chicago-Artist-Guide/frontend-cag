/// <reference types="vitest/config" />
import { defineConfig } from 'vitest/config';

// Dedicated config for firestore.rules tests. Runs in `node` (no jsdom),
// includes only the rules test files, and intentionally does NOT pull in
// the app setup file. Driven by `npm run test:rules`, which boots the
// firestore emulator first via `firebase emulators:exec`.
export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    include: ['src/test/**/*.rules.test.ts'],
    testTimeout: 30000
  }
});
