import { test, expect } from '@playwright/test';

test.describe('homepage', () => {
  test('looks correct', async ({ page }) => {
    await page.goto('/');
    await page.route(/https?:\/\/(?:.+\.)?twitter.com(?:$|\/|\?|#)/, route =>
      route.abort(),
    );
    await page.click(':text("Get started")');

    const carouselControls = await page.$$('.slick-dots :text("1")');
    await Promise.all(carouselControls.map(controls => controls.click()));

    const screenshot = await page.screenshot({ fullPage: true });

    expect(screenshot).toMatchSnapshot('home.png');
  });
});
