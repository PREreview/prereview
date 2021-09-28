import { expect, test } from './test';
import { screenshot } from './utils';

test.asANewUser('shows a welcome message', async ({ page }) => {
  await page.goto('/');

  const welcome = page.locator('[aria-label="welcome"]');

  await expect(welcome).toContainText('Welcome to the new PREreview.org');

  expect(await screenshot(page, welcome)).toMatchSnapshot('welcome.png');
});

test.asAReturningUser('looks correct', async ({ page }) => {
  await page.goto('/');

  expect(await screenshot(page)).toMatchSnapshot('home.png');
});

test.asALoggedInUser('looks correct when logged in', async ({ page }) => {
  await page.goto('/');

  expect(await screenshot(page, 'body')).toMatchSnapshot('home-logged-in.png');
});
