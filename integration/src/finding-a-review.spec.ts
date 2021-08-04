import { test, expect } from '@playwright/test';
import { blur } from './utils';

test.describe('finding a review', () => {
  test('might not find anything', async ({ page }) => {
    await page.goto('/');
    await page.route(/https?:\/\/(?:.+\.)?twitter.com(?:$|\/|\?|#)/, route =>
      route.abort(),
    );
    await page.click(':text("Get started")');

    await page.fill(
      '[placeholder*="Search preprints"]',
      'this should not find anything',
    );
    await page.keyboard.press('Enter');

    const content = await page.waitForSelector(
      '.MuiContainer-root:has([placeholder*="Search preprints"])',
    );
    await content.scrollIntoViewIfNeeded();

    expect(await content.innerText()).toContain('No preprints about');

    const screenshot = await page.screenshot().then(blur);

    expect(screenshot).toMatchSnapshot('empty-list.png');
  });
});
