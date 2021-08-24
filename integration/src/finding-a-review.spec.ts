import { expect, test } from './test';
import { screenshot } from './utils';

test.asAReturningUser('might not find anything', async ({ page }) => {
  await page.goto('/');

  await page.fill(
    '[placeholder*="Search preprints"]',
    'this should not find anything',
  );
  await page.keyboard.press('Enter');

  const content = await page.waitForSelector(
    '.MuiContainer-root:has([placeholder*="Search preprints"])',
  );

  expect(await content.innerText()).toContain('No preprints about');

  expect(await screenshot(page, content)).toMatchSnapshot('empty-list.png');
});

test.asAReturningUser('can find and view a preprint', async ({ page }) => {
  await page.goto('/');

  await page.fill('[placeholder*="Search preprints"]', 'Silly String Theory');
  await page.keyboard.press('Enter');

  let content = await page.waitForSelector(
    '.MuiContainer-root:has([placeholder*="Search preprints"])',
  );

  expect(await content.innerText()).not.toContain('No preprints about');

  expect(await screenshot(page, content)).toMatchSnapshot('1-preprint.png');

  await page.click(':text("Silly String Theory")');

  content = await page.waitForSelector('.MuiDrawer-paper');

  expect(await content.innerText()).toContain('1 request');

  expect(await screenshot(page, content)).toMatchSnapshot('preprint.png');
});
