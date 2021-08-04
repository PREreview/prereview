import { test, expect } from '@playwright/test';
import { screenshot } from './utils';

test.describe('finding a prereviewer', () => {
  test('might not find anyone', async ({ page }) => {
    await page.goto('/prereviewers');

    await page.fill(
      '[placeholder*="Search users"]',
      'this should not find anyone',
    );
    await page.keyboard.press('Enter');

    expect(await page.textContent('h2')).toBe('0 PREreviewers');

    expect(
      await screenshot(
        page,
        '.MuiContainer-root:has([placeholder*="Search users"])',
      ),
    ).toMatchSnapshot('empty-list.png');
  });
});
