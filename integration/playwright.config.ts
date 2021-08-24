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
  preserveOutput: 'failures-only',
  projects: [
    {
      name: 'Desktop Chrome',
      use: {
        browserName: 'chromium',
        ...devices['Desktop Chrome'],
      },
    },
    {
      name: 'iPhone 11',
      use: {
        browserName: 'webkit',
        ...devices['iPhone 11'],
      },
    },
  ],
};

export default config;
