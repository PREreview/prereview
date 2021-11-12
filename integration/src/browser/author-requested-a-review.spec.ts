import { expect, test } from './test';
import { screenshot } from './utils';

test.asALoggedInUser('see an author-requested review', async ({ page, preprint, requestByAuthor }) => {
  await page.goto(`preprints/${preprint.uuid}`);

  await page.click(':text("Add Request")');

  const paper = page.locator('.MuiDrawer-paper');

  await expect(paper.locator('.MuiAvatarGroup-avatar')).toContainText('Author');
  expect(await screenshot(paper)).toMatchSnapshot('with-author-request.png');
});
