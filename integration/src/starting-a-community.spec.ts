import { expect, test } from './test';

test.asAReturningUser(
  'starting a community goes to a form',
  async ({ page }) => {
    await page.goto('/communities');

    await page.click(':text("Start your own community")');

    await expect(page.locator('form')).toContainText('Request to start');
  },
);
