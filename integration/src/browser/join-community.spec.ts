import { expect, test } from './test';
import { screenshot } from './utils';

test.asALoggedInUser('can join a community', async ({ community, page }) => {
  await page.goto(`/communities/${community.slug}`);

  const joinButton = page.locator('button:has-text("Join community")');

  await expect(joinButton).toBeVisible();
  expect(await screenshot(page, joinButton)).toMatchSnapshot('join-button.png');

  page.on('dialog', async (dialog) => await dialog.dismiss());
  const [joinDialog] = await Promise.all([
    page.waitForEvent('dialog'),
    joinButton.click(),
  ]);

  await expect(joinDialog.message()).toContain(
    `Thanks for your request to join ${community.name}`,
  );
});

test.asAReturningUser(
  'have to log in with ORCID',
  async ({ community, page }) => {
    await page.goto(`/communities/${community.slug}`);

    await page.click('button:has-text("Join community")');

    const dialog = page.locator('[role="dialog"]');

    await expect(dialog).toContainText('You must be logged in');
    expect(await screenshot(dialog)).toMatchSnapshot('log-in.png');
  },
);

test.asACommunityMember(
  'cannot join a community',
  async ({ community, page }, { fixme }) => {
    await page.goto(`/communities/${community.slug}`);

    const joinButton = page.locator('button:has-text("Join community")');

    await expect(page.locator('body')).toContainText(community.name);

    fixme(true, '"Join community" button is still shown to members');

    await expect(joinButton).not.toBeVisible();
  },
);
