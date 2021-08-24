import { expect, test } from './test';
import { screenshot } from './utils';

test.asANewUser('shows a welcome message', async ({ page }) => {
  await page.goto('/');

  const welcome = await page.waitForSelector('[aria-label="welcome"]');

  expect(await welcome.innerText()).toContain(
    'Welcome to the new PREreview.org',
  );

  expect(await screenshot(page, welcome)).toMatchSnapshot('welcome.png');
});

test.asAReturningUser('looks correct', async ({ page }) => {
  await page.goto('/');

  expect(await screenshot(page)).toMatchSnapshot('home.png');
});
