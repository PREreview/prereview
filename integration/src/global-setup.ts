import { chromium } from '@playwright/test';
import { ensurePreprint, ensureRequest } from './api';

export default async function globalSetup(): Promise<void> {
  await Promise.all([loadData(), captureState()]);
}

async function loadData() {
  await ensurePreprint('10.5555/12345678').then(ensureRequest);
}

async function captureState() {
  const browser = await chromium.launch();
  const page = await browser.newPage({ baseURL: process.env.BASE_URL });

  await page.goto('/');
  await page.click(':text("Get started")');

  await page.context().storageState({ path: 'state/returning-user.json' });

  await page.goto('/api/v2/orcid/login');

  await page.fill('#username', process.env.TEST_USER_ORCID);
  await page.fill('#password', process.env.TEST_USER_ORCID_PASSWORD);
  await page.click('#signin-button');
  await page.waitForRequest('/');

  await page.context().storageState({ path: 'state/logged-in-user.json' });

  await browser.close();
}
