import { test, expect } from '@playwright/test';
import { screenshot } from './utils';

test.describe('homepage', () => {
  test('looks correct', async ({ page }) => {
    await page.goto('/');
    await page.click(':text("Get started")');

    expect(await screenshot(page)).toMatchSnapshot('home.png');
  });
});
