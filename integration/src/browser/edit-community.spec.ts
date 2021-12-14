import { expect, test } from './test';
import { screenshot } from './utils';

test.asACommunityModerator(
  'can edit a community',
  async ({ community, page }) => {
    await page.goto(`/communities/${community.slug}`);

    const editButton = page.locator('[aria-label="Edit this community"]');

    await expect(editButton).toBeVisible();
    expect(await screenshot(page, editButton)).toMatchSnapshot(
      'edit-button.png',
    );

    await editButton.click();

    const editForm = page.locator('form');

    await expect(editForm).toContainText('Enter a description');
    expect(await screenshot(page, editForm)).toMatchSnapshot('edit-page.png');
  },
);

test.asACommunityMember(
  'cannot edit a community',
  async ({ community, page }) => {
    await page.goto(`/communities/${community.slug}`);

    const editButton = page.locator('[aria-label="Edit this community"]');

    await expect(page.locator('body')).toContainText(community.name);
    await expect(editButton).not.toBeVisible();
  },
);
