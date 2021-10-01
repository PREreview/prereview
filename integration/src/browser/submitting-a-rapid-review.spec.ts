import { expect, test } from './test';
import { screenshot } from './utils';

test.asALoggedInUser('submit a rapid review', async ({ page, preprint }) => {
  await page.goto('/reviews');

  await page.click('button:has-text("Add PREreview")');

  const dialog = page.locator('[role="dialog"]');

  await expect(dialog).toContainText('Search for a preprint');
  expect(await screenshot(dialog)).toMatchSnapshot('search.png');

  await dialog.locator('input').fill(preprint.handle.replace(/^doi:/, ''));
  await dialog.locator(':text("Add PREreview")').click();
  await page.click(':text("Add PREreview")');

  const paper = page.locator('.MuiDrawer-paper');

  await expect(paper).toContainText('0 rapid PREreviews');
  expect(await screenshot(paper)).toMatchSnapshot('add-form.png');

  await page.check('tr:has-text("Are the findings novel?") [aria-label="Yes"]');
  await page.check(
    'tr:has-text("Are the results likely to lead to future research?") [aria-label="No"]',
  );
  await page.check(
    'tr:has-text("Is sufficient detail provided to allow reproduction of the study?") [aria-label="N/A"]',
  );
  await page.check(
    'tr:has-text("Are the methods and statistics appropriate for the analysis?") [aria-label="Unsure"]',
  );
  await page.check(
    'tr:has-text("Are the principal conclusions supported by the data and analysis?") [aria-label="Yes"]',
  );
  await page.check(
    'tr:has-text("Does the manuscript discuss limitations?") [aria-label="No"]',
  );
  await page.check(
    'tr:has-text("Have the authors adequately discussed ethical concerns?") [aria-label="N/A"]',
  );
  await page.check(
    'tr:has-text("Does the manuscript include new data?") [aria-label="Unsure"]',
  );
  await page.check(
    'tr:has-text("Are the data used in the manuscript available?") [aria-label="No"]',
  );
  await page.check(
    'tr:has-text("Is the code used in the manuscript available?") [aria-label="No"]',
  );
  await page.check(
    'tr:has-text("Would you recommend this manuscript to others?") [aria-label="N/A"]',
  );
  await page.check(
    'tr:has-text("Do you recommend this manuscript for peer review?") [aria-label="Unsure"]',
  );

  const submit = page.locator('button:has-text("Submit")');
  await submit.scrollIntoViewIfNeeded();
  expect(await screenshot(paper)).toMatchSnapshot('submit-form.png');

  await submit.click();

  await expect(paper).toContainText('Congratulations');
  expect(await screenshot(paper)).toMatchSnapshot('add-full.png');

  await page.click('button:has-text("No")');

  await expect(paper).not.toContainText('expand');
  expect(await screenshot(paper)).toMatchSnapshot('submitted.png');

  await page.reload();
  await page.click(':text("Read PREreviews")');

  await expect(paper).toContainText('1 rapid PREreview');
  expect(await screenshot(paper)).toMatchSnapshot('added-a-rapid-review.png');
});

test.asALoggedInUser('must complete the form', async ({ page, preprint }) => {
  await page.goto('/reviews');

  await page.click('button:has-text("Add PREreview")');

  const dialog = page.locator('[role="dialog"]');

  await expect(dialog).toContainText('Search for a preprint');

  await dialog.locator('input').fill(preprint.handle.replace(/^doi:/, ''));
  await dialog.locator(':text("Add PREreview")').click();
  await page.click(':text("Add PREreview")');

  const paper = page.locator('.MuiDrawer-paper');

  await expect(paper).toContainText('0 rapid PREreviews');

  const submit = page.locator('button:has-text("Submit")');
  await submit.scrollIntoViewIfNeeded();

  page.on('dialog', async dialog => await dialog.dismiss());

  const [formDialog] = await Promise.all([
    page.waitForEvent('dialog'),
    submit.click(),
  ]);

  expect(formDialog.message()).toContain('Please complete the required fields');
});

test.asAReturningUser('have to log in with ORCID', async ({ page }) => {
  await page.goto('/reviews');

  await page.click('button:has-text("Add PREreview")');

  const dialog = page.locator('[role="dialog"]');

  await expect(dialog).toContainText('You must be logged in');
  expect(await screenshot(dialog)).toMatchSnapshot('log-in.png');
});
