import { defineConfig, devices } from '@playwright/test';

export type PlaywrightServerMode = 'external' | 'managed';

const baseURL = 'http://127.0.0.1:3100';

export const readPlaywrightServerMode = (
  value = process.env.CAG_PLAYWRIGHT_SERVER_MODE
): PlaywrightServerMode => {
  if (value === undefined || value === 'managed') {
    return 'managed';
  }

  if (value === 'external') {
    return 'external';
  }

  throw new Error(`Unsupported CAG_PLAYWRIGHT_SERVER_MODE: ${value}`);
};

export const createPlaywrightConfig = (serverMode: PlaywrightServerMode) =>
  defineConfig({
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
      baseURL,
      trace: 'retain-on-failure'
    },
    ...(serverMode === 'managed'
      ? {
          webServer: {
            command:
              'npm run build && npm run start -- --hostname 127.0.0.1 --port 3100',
            env: {
              NEXT_PUBLIC_FIREBASE_API_KEY: 'cag-e2e-local-api-key',
              NEXT_PUBLIC_FIREBASE_APP_ID: 'cag-e2e-local-app-id',
              NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID: '',
              NEXT_PUBLIC_FIREBASE_PROJECT_ID: 'cag-e2e-local',
              NEXT_PUBLIC_FIREBASE_SENDER_ID: 'cag-e2e-local-sender',
              NEXT_PUBLIC_LGL_API_KEY: 'cag-e2e-local-lgl-key'
            },
            reuseExistingServer: false,
            timeout: 120_000,
            url: `${baseURL}/api/health/ready`
          }
        }
      : {})
  });

export default createPlaywrightConfig(readPlaywrightServerMode());
