import { test, expect } from '@playwright/test';

test.describe('starting a community', () => {
  test('goes to a form', async ({ page }) => {
    await page.goto('/communities');

    await page.click(':text("Start your own community")');

    expect(await page.textContent('form')).toContain('Request to start');
  });
});
