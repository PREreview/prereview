import { expect, test } from './test';
import { screenshot } from './utils';

test.asAReturningUser('have to log in with ORCID', async ({ page }) => {
  await page.goto('/reviews');

  await page.click(':text("Add Request")');

  const dialog = page.locator('[role="dialog"]');

  await expect(dialog).toContainText('You must be logged in');
  expect(await screenshot(page, dialog)).toMatchSnapshot('log-in.png');
});
