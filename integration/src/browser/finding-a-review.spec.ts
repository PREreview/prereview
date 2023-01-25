import { expect, test } from './test';
import { screenshot } from './utils';

test.asAReturningUser('might not find anything', async ({ page }) => {
  await page.goto('/');

  await page.fill(
    '[placeholder*="Search preprints"]',
    'this should not find anything',
  );
  await page.keyboard.press('Enter');

  const content = page.locator(
    '.MuiContainer-root:has([placeholder*="Search preprints"])',
  );

  await expect(content).toContainText('No preprints about');
  expect(await screenshot(page, content)).toMatchSnapshot('empty-list.png');
});

test.asAReturningUser(
  'can find and view a preprint',
  async ({ page }, { fixme }) => {
    await page.goto('/');

    await page.fill('[placeholder*="Search preprints"]', 'Silly String Theory');
    await page.keyboard.press('Enter');

    let content = page.locator(
      '.MuiContainer-root:has([placeholder*="Search preprints"])',
    );

    await expect(content).not.toContainText('No preprints about');
    expect(await screenshot(page, content)).toMatchSnapshot('1-preprint.png');

    fixme(true, 'Preprint goes to the new site');

    await page.click(':text("Silly String Theory")');

    content = page.locator('.MuiDrawer-paper');

    await expect(content).toContainText('1 request');
    expect(await screenshot(page, content)).toMatchSnapshot('preprint.png');
  },
);
