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
  const page = await browser.newPage();

  await page.goto(process.env.BASE_URL);
  await page.click(':text("Get started")');

  await page.context().storageState({ path: 'state/returning-user.json' });

  await browser.close();
}
