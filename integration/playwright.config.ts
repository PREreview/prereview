import { devices, PlaywrightTestConfig } from '@playwright/test';

const config: PlaywrightTestConfig = {
  use: {
    baseURL: process.env.BASE_URL,
    headless: true,
    screenshot: 'only-on-failure',
    trace: 'retain-on-failure',
    video: 'retain-on-failure',
  },
  globalSetup: require.resolve('./src/global-setup'),
  retries: parseInt(process.env.RETRIES) || 0,
  timeout: 60000,
  preserveOutput: 'failures-only',
  projects: [
    {
      name: 'Desktop Chrome',
      testDir: 'src/browser',
      use: {
        browserName: 'chromium',
        ...devices['Desktop Chrome'],
      },
    },
    {
      name: 'iPhone 11',
      testDir: 'src/browser',
      use: {
        browserName: 'webkit',
        ...devices['iPhone 11'],
      },
    },
    {
      name: 'API',
      testDir: 'src/api',
    },
  ],
};

export default config;
