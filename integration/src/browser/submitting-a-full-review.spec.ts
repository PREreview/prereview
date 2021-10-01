import { expect, test } from './test';
import { screenshot } from './utils';

test.asALoggedInUser(
  'submit a full review',
  async ({ page, preprint, rapidReview }) => {
    await page.goto(
      `preprints/${preprint.uuid}/rapid-reviews/${rapidReview.uuid}`,
    );
    await page.click('button:has-text("Add PREreview")');
    await page.click('button:has-text("Yes")');

    const paper = page.locator('.MuiDrawer-paper');

    await expect(paper).toContainText('Full PREreview');
    expect(await screenshot(paper)).toMatchSnapshot('add-form.png');

    await page.type('.ql-editor', 'This is a ');
    await page.click('.ql-bold');
    await page.type('.ql-editor', 'review');
    await page.keyboard.press('Enter');
    await page.click('.ql-list');
    await page.type('.ql-editor', 'With a list');

    expect(await screenshot(paper)).toMatchSnapshot('draft.png');

    page.on('dialog', async dialog => await dialog.accept());

    const [formDialog] = await Promise.all([
      page.waitForEvent('dialog'),
      page.click('button:has-text("Submit")'),
    ]);

    expect(formDialog.message()).toContain(
      'Are you sure you want to publish this review?',
    );

    await expect(paper).toContainText('Congratulations');
    expect(await screenshot(paper)).toMatchSnapshot('submitted.png');

    await page.reload();
    await page.click(':text("Read PREreviews")');

    await expect(paper).toContainText('1 full PREreview');

    const reviews = page.locator(
      '.MuiAccordion-root:has-text("Full PREreviews")',
    );

    expect(await screenshot(reviews)).toMatchSnapshot('reviews.png');
  },
);
