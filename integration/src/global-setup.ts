import { chromium } from '@playwright/test';
import nullthrows from 'nullthrows';
import { fetch } from './fetch';
import { ensurePreprint, ensureRequest } from './api';

const apiFetch = fetch(process.env.BASE_URL);

export default async function globalSetup(): Promise<void> {
  await Promise.all([loadData(), captureState()]);
}

async function loadData() {
  await ensurePreprint(apiFetch, '10.5555/12345678').then(id =>
    ensureRequest(apiFetch, id),
  );
}

async function captureState() {
  const browser = await chromium.launch();
  const page = await browser.newPage({ baseURL: process.env.BASE_URL });

  await page.goto('/');
  await page.click(':text("Get started")');

  await page.context().storageState({ path: 'state/returning-user.json' });

  await page.goto('/api/v2/orcid/login');

  await page.fill('#username', nullthrows(process.env.TEST_USER_ORCID));
  await page.fill(
    '#password',
    nullthrows(process.env.TEST_USER_ORCID_PASSWORD),
  );
  await page.click('#signin-button');
  await page.waitForRequest('/');

  await page.context().storageState({ path: 'state/logged-in-user.json' });

  await browser.close();
}
