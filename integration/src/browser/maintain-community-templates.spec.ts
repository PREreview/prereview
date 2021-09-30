import { expect, test } from './test';
import { screenshot } from './utils';

test.asACommunityModerator(
  'can add a template',
  async ({ community, faker, page }) => {
    const title = faker.lorem.words();

    await page.goto(`/community-settings/${community.slug}`);

    const templates = page.locator('#templates');

    expect(await screenshot(templates)).toMatchSnapshot('empty.png');

    await page.click('button:has-text("Add a template")');

    const addForm = page.locator('[tabindex="-1"]:has-text("Add a template")');

    expect(await screenshot(addForm)).toMatchSnapshot('add-form.png');

    await addForm.locator('#template-title').fill(title);
    await addForm.locator('#template-content').fill('Template contents');

    page.on('dialog', async dialog => await dialog.dismiss());
    const [submitDialog] = await Promise.all([
      page.waitForEvent('dialog'),
      addForm.locator('button:has-text("Submit")').click(),
    ]);

    expect(submitDialog.message()).toContain('Template updated successfully');
    await expect(templates.locator('tbody th')).toContainText(title);
    expect(await screenshot(templates)).toMatchSnapshot('added.png');
  },
);

test.asACommunityModerator(
  'can edit a template',
  async ({ community, page, template }, { fixme }) => {
    const newTitle = `Updated ${template.title}`;
    await page.goto(`/community-settings/${community.slug}`);

    const templates = page.locator('#templates');

    expect(await screenshot(templates)).toMatchSnapshot('to-be-edited.png');

    await page.click(`button:has-text("Edit ${template.title}")`);

    const editForm = page.locator('[tabindex="-1"]:has-text("Edit template")');

    expect(await screenshot(editForm)).toMatchSnapshot('edit-form.png');

    await editForm.locator('#template-title').fill(newTitle);

    page.on('dialog', async dialog => await dialog.dismiss());
    const [editedDialog] = await Promise.all([
      page.waitForEvent('dialog'),
      editForm.locator('button:has-text("Submit")').click(),
    ]);

    fixme(true, "Community moderators don't have permission to edit templates");
    expect(editedDialog.message()).toContain('Template updated successfully');

    await page.reload();

    await expect(templates.locator('tbody th')).toContainText(newTitle);
    expect(await screenshot(templates)).toMatchSnapshot('edited.png');
  },
);

test.asACommunityModerator(
  'can delete a template',
  async ({ community, page, template }, { fixme }) => {
    await page.goto(`/community-settings/${community.slug}`);

    const templates = page.locator('#templates');

    expect(await screenshot(templates)).toMatchSnapshot('to-be-deleted.png');

    page.on('dialog', async dialog => await dialog.accept());
    const [deleteConfirmation, deleteDialog] = await Promise.all([
      page.waitForEvent('dialog', dialog => dialog.type() === 'confirm'),
      page.waitForEvent('dialog', dialog => dialog.type() !== 'confirm'),
      page.click(`button:has-text("Delete ${template.title}")`),
    ]);

    expect(deleteConfirmation.message()).toContain(
      'Are you sure you want to delete this template?',
    );
    fixme(
      true,
      "Community moderators don't have permission to delete templates",
    );
    expect(deleteDialog.message()).toContain('Template deleted successfully');

    await expect(templates).not.toContainText(template.title);
    expect(await screenshot(templates)).toMatchSnapshot('deleted.png');
  },
);
