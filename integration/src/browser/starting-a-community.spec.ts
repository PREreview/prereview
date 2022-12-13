import { expect, test } from './test';

test.asAReturningUser(
  'starting a community goes to a form',
  async ({ page }, { fixme }) => {
    await page.goto('/communities');

    fixme(true, '"Start your own community" button is not shown');

    await page.click(':text("Start your own community")');

    await expect(page.locator('form')).toContainText('Request to start');
  },
);
