import { test, expect } from '@playwright/test';
import { screenshot } from './utils';

test.describe('finding a review', () => {
  test('might not find anything', async ({ page }) => {
    await page.goto('/');
    await page.click(':text("Get started")');

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

  test('can find and view a preprint', async ({ page }) => {
    await page.goto('/');
    await page.click(':text("Get started")');

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
});
