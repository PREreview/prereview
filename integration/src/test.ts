import { test as baseTest } from '@playwright/test';

const asANewUser = baseTest;

const asAReturningUser = baseTest.extend({
  storageState: async ({}, use) => {
    await use('state/returning-user.json');
  },
});

export const test = { asANewUser, asAReturningUser };

export { expect } from '@playwright/test';
