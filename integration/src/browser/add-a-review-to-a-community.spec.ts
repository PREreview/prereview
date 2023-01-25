import { expect, test } from './test';
import { screenshot } from './utils';

test.asACommunityMember(
  'can add a review to a community',
  async ({ community, page, preprint }, { fixme }) => {
    await page.goto(`/communities/${community.slug}`);

    const addReviewButton = page.locator('button:has-text("Add PREreview")');
    const preprints = page.locator(
      '.MuiPaper-root:has-text("Preprints with PREreviews")',
    );

    await expect(addReviewButton).toBeVisible();
    expect(await screenshot(preprints)).toMatchSnapshot(
      'empty-with-button.png',
    );

    await addReviewButton.click();

    const dialog = page.locator('[role="dialog"]');

    await expect(dialog).toContainText('Search for a preprint');
    expect(await screenshot(dialog)).toMatchSnapshot('search.png');

    await dialog.locator('input').fill(preprint.handle.replace(/^doi:/, ''));

    fixme(true, '"Add PREreviews" button goes to the new site');

    await page.click('button:has-text("Add PREreviews")');

    await page.check(
      'tr:has-text("Are the findings novel?") [aria-label="N/A"]',
    );
    await page.check(
      'tr:has-text("Are the results likely to lead to future research?") [aria-label="N/A"]',
    );
    await page.check(
      'tr:has-text("Is sufficient detail provided to allow reproduction of the study?") [aria-label="N/A"]',
    );
    await page.check(
      'tr:has-text("Are the methods and statistics appropriate for the analysis?") [aria-label="N/A"]',
    );
    await page.check(
      'tr:has-text("Are the principal conclusions supported by the data and analysis?") [aria-label="N/A"]',
    );
    await page.check(
      'tr:has-text("Does the manuscript discuss limitations?") [aria-label="N/A"]',
    );
    await page.check(
      'tr:has-text("Have the authors adequately discussed ethical concerns?") [aria-label="N/A"]',
    );
    await page.check(
      'tr:has-text("Does the manuscript include new data?") [aria-label="N/A"]',
    );
    await page.check(
      'tr:has-text("Are the data used in the manuscript available?") [aria-label="N/A"]',
    );
    await page.check(
      'tr:has-text("Is the code used in the manuscript available?") [aria-label="N/A"]',
    );
    await page.check(
      'tr:has-text("Would you recommend this manuscript to others?") [aria-label="N/A"]',
    );
    await page.check(
      'tr:has-text("Do you recommend this manuscript for peer review?") [aria-label="N/A"]',
    );

    await page.click('button:has-text("Submit")');

    await expect(page.locator('body')).toContainText('Congratulations');

    await page.goto(`/communities/${community.slug}`);

    await expect(preprints).toContainText(preprint.title);
    expect(await screenshot(preprints)).toMatchSnapshot('with-review.png');
  },
);

test.asAReturningUser(
  'cannot add a review to a community',
  async ({ community, page }) => {
    await page.goto(`/communities/${community.slug}`);

    const addReviewButton = page.locator('button:has-text("Add PREreview")');
    const preprints = page.locator(
      '.MuiPaper-root:has-text("Preprints with PREreviews")',
    );

    await expect(addReviewButton).not.toBeVisible();
    expect(await screenshot(preprints)).toMatchSnapshot('empty.png');
  },
);
