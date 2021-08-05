import { test, expect } from '@playwright/test';
import { screenshot } from './utils';

test.describe('requesting a review', () => {
  test('have to log in with ORCID', async ({ page }) => {
    await page.goto('/reviews');
    await page.click(':text("Get started")');

    await page.click(':text("Add Request")');

    const dialog = await page.waitForSelector('[role="dialog"]');

    expect(await dialog.innerText()).toContain('You must be logged in');

    expect(await screenshot(page, dialog)).toMatchSnapshot('log-in.png');
  });
});
