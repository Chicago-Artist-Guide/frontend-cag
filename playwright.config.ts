import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  expect: {
    timeout: 10_000
  },
  fullyParallel: false,
  outputDir: '.next/playwright-results',
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] }
    }
  ],
  reporter: 'list',
  testDir: './e2e',
  testMatch: '**/*.e2e.ts',
  use: {
    baseURL: 'http://127.0.0.1:3000',
    trace: 'retain-on-failure'
  },
  webServer: {
    command: 'npm run dev -- --hostname 127.0.0.1',
    env: {
      NEXT_PUBLIC_FIREBASE_API_KEY:
        process.env.NEXT_PUBLIC_FIREBASE_API_KEY || 'cag-e2e-local-api-key',
      NEXT_PUBLIC_FIREBASE_APP_ID:
        process.env.NEXT_PUBLIC_FIREBASE_APP_ID || 'cag-e2e-local-app-id',
      NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID:
        process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID || 'G-CAGE2ELOCAL',
      NEXT_PUBLIC_FIREBASE_PROJECT_ID:
        process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || 'cag-e2e-local',
      NEXT_PUBLIC_FIREBASE_SENDER_ID:
        process.env.NEXT_PUBLIC_FIREBASE_SENDER_ID || 'cag-e2e-local-sender',
      NEXT_PUBLIC_LGL_API_KEY:
        process.env.NEXT_PUBLIC_LGL_API_KEY || 'cag-e2e-local-lgl-key'
    },
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
    url: 'http://127.0.0.1:3000/api/health/ready'
  }
});
