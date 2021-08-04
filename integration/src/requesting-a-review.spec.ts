import { test, expect } from '@playwright/test';
import { blur } from './utils';

test.describe('requesting a review', () => {
  test('have to log in with ORCID', async ({ page }) => {
    await page.goto('/reviews');
    await page.route(/https?:\/\/(?:.+\.)?twitter.com(?:$|\/|\?|#)/, route =>
      route.abort(),
    );
    await page.click(':text("Get started")');

    await page.click(':text("Add Request")');

    const dialog = await page.waitForSelector('[role="dialog"]');
    await dialog.scrollIntoViewIfNeeded();

    expect(await dialog.innerText()).toContain('You must be logged in');

    const screenshot = await page.screenshot().then(blur);

    expect(screenshot).toMatchSnapshot('log-in.png');
  });
});
