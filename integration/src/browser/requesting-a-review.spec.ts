import { expect, test } from './test';
import { screenshot } from './utils';

test.asALoggedInUser('requesting a review', async ({ page, preprint }) => {
  await page.goto('/reviews');

  await page.click(':text("Add Request")');

  const dialog = page.locator('[role="dialog"]');

  await expect(dialog).toContainText('Search for a preprint');
  expect(await screenshot(dialog)).toMatchSnapshot('search.png');

  await dialog.locator('input').fill(preprint.doi);
  await page.click(':text("Request PREreviews")');
  await page.click(':text("Add Request")');

  const paper = page.locator('.MuiDrawer-paper');

  await expect(paper).toContainText('0 requests');
  expect(await screenshot(paper)).toMatchSnapshot('add-request.png');

  await page.click(':text("Add a request for PREreview")');
  await page.reload();
  await page.click(':text("Add Request")');

  await expect(paper).toContainText('1 request');
  expect(await screenshot(paper)).toMatchSnapshot('added-a-request.png');
});

test.asAReturningUser('have to log in with ORCID', async ({ page }) => {
  await page.goto('/reviews');

  await page.click(':text("Add Request")');

  const dialog = page.locator('[role="dialog"]');

  await expect(dialog).toContainText('You must be logged in');
  expect(await screenshot(dialog)).toMatchSnapshot('log-in.png');
});
