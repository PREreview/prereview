import { Browser, chromium } from '@playwright/test';
import nullthrows from 'nullthrows';
import { fetch } from './fetch';
import { ensureCommunity, ensurePreprint, ensureRequest } from './api';

const apiFetch = fetch(process.env.BASE_URL);

export default async function globalSetup(): Promise<void> {
  await Promise.all([loadData(), captureState()]);
}

async function loadData() {
  await Promise.all([
    ensurePreprint(apiFetch, '10.5555/12345678').then(preprint =>
      ensureRequest(apiFetch, preprint.uuid),
    ),
    ensureCommunity(apiFetch, {
      name: 'Some Community',
      slug: 'some-community',
    }),
  ]);
}

async function captureState() {
  const browser = await chromium.launch();

  await Promise.all([
    captureReturningUserState(browser, 'state/returning-user.json'),
    captureLoggedInUserState(
      browser,
      nullthrows(process.env.TEST_USER_ORCID),
      nullthrows(process.env.TEST_USER_ORCID_PASSWORD),
      'state/logged-in-user.json',
    ),
    captureLoggedInUserState(
      browser,
      nullthrows(process.env.TEST_COMMUNITY_MODERATOR_ORCID),
      nullthrows(process.env.TEST_COMMUNITY_MODERATOR_ORCID_PASSWORD),
      'state/logged-in-community-moderator.json',
    ),
  ]);

  await browser.close();
}

async function captureReturningUserState(browser: Browser, path: string) {
  const context = await browser.newContext({ baseURL: process.env.BASE_URL });
  const page = await context.newPage();

  await page.goto('/');
  await page.click(':text("Get started")');

  await page.context().storageState({ path });

  await context.close();
}

async function captureLoggedInUserState(
  browser: Browser,
  username: string,
  password: string,
  path: string,
) {
  const context = await browser.newContext({ baseURL: process.env.BASE_URL });
  const page = await context.newPage();

  await page.goto('/');
  await page.click(':text("Get started")');

  await page.goto('/api/v2/orcid/login');

  await page.fill('#username', username);
  await page.fill('#password', password);
  await page.click('#signin-button');

  await page.click('.MuiSelect-select');
  await page.click('li:has-text("Public persona")');

  await page.context().storageState({ path });

  await context.close();
}
