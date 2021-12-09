import { expect, test } from './test';
import { screenshot } from './utils';

test.asACommunityModerator(
  'can add a request to a community',
  async ({ community, page, preprint }, { fixme }) => {
    await page.goto(`/communities/${community.slug}`);

    const addRequestButton = page.locator('button:has-text("Add Request")');
    const preprints = page.locator(
      '.MuiPaper-root:has-text("Preprints with PREreviews or requests for PREreviews")',
    );

    fixme(true, '"Add Request" button is not shown for moderators');

    await expect(addRequestButton).toBeVisible();
    expect(await screenshot(preprints)).toMatchSnapshot(
      'empty-with-button.png',
    );

    await addRequestButton.click();

    const dialog = page.locator('[role="dialog"]');

    await expect(dialog).toContainText('Search for a preprint');
    expect(await screenshot(dialog)).toMatchSnapshot('search.png');

    await dialog.locator('input').fill(preprint.handle.replace(/^doi:/, ''));
    await page.click('button:has-text("Request PREreviews")');

    page.on('dialog', async (dialog) => await dialog.dismiss());
    const [addDialog] = await Promise.all([
      page.waitForEvent('dialog'),
      page.click('button:has-text("Add a request")'),
    ]);

    expect(addDialog.message()).toContain(
      'PREreview request submitted successfully.',
    );

    await page.goto(`/communities/${community.slug}`);

    await expect(preprints).toContainText(preprint.title);
    expect(await screenshot(preprints)).toMatchSnapshot('with-request.png');
  },
);

test.asAReturningUser(
  'cannot add a request to a community',
  async ({ community, page }) => {
    await page.goto(`/communities/${community.slug}`);

    const addRequestButton = page.locator('button:has-text("Add Request")');
    const preprints = page.locator(
      '.MuiPaper-root:has-text("Preprints with PREreviews or requests for PREreviews")',
    );

    await expect(addRequestButton).not.toBeVisible();
    expect(await screenshot(preprints)).toMatchSnapshot('empty.png');
  },
);
