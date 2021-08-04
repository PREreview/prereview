import { test, expect } from '@playwright/test';
import { blur } from './utils';

test.describe('finding a prereviewer', () => {
  test('might not find anyone', async ({ page }) => {
    await page.goto('/prereviewers');

    await page.fill(
      '[placeholder*="Search users"]',
      'this should not find anyone',
    );
    await page.keyboard.press('Enter');

    const content = await page.waitForSelector(
      '.MuiContainer-root:has([placeholder*="Search users"])',
    );
    await content.scrollIntoViewIfNeeded();

    expect(await page.textContent('h2')).toBe('0 PREreviewers');

    const screenshot = await page.screenshot().then(blur);

    expect(screenshot).toMatchSnapshot('empty-list.png');
  });
});
