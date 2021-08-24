import { test, expect } from '@playwright/test';
import { screenshot } from './utils';

test.describe('homepage', () => {
  test('shows a welcome message to first-time visitors', async ({ page }) => {
    await page.goto('/');

    const welcome = await page.waitForSelector('[aria-label="welcome"]');

    expect(await welcome.innerText()).toContain(
      'Welcome to the new PREreview.org',
    );

    expect(await screenshot(page, welcome)).toMatchSnapshot('welcome.png');
  });

  test('looks correct', async ({ page }) => {
    await page.goto('/');
    await page.click(':text("Get started")');

    expect(await screenshot(page)).toMatchSnapshot('home.png');
  });
});
