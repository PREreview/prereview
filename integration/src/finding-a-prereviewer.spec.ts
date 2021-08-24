import { expect, test } from './test';
import { screenshot } from './utils';

test.asAReturningUser('might not find anyone', async ({ page }) => {
  await page.goto('/prereviewers');

  await page.fill(
    '[placeholder*="Search users"]',
    'this should not find anyone',
  );
  await page.keyboard.press('Enter');

  await expect(page.locator('h2')).toContainText('0 PREreviewers');

  expect(
    await screenshot(
      page,
      '.MuiContainer-root:has([placeholder*="Search users"])',
    ),
  ).toMatchSnapshot('empty-list.png');
});
