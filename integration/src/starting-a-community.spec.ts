import { expect, test } from './test';

test.asAReturningUser(
  'starting a community goes to a form',
  async ({ page }) => {
    await page.goto('/communities');

    await page.click(':text("Start your own community")');

    expect(await page.textContent('form')).toContain('Request to start');
  },
);
