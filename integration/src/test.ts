import { test as baseTest } from '@playwright/test';

const asANewUser = baseTest;

const asAReturningUser = baseTest.extend({
  storageState: async ({}, use) => {
    await use('state/returning-user.json');
  },
});

const asALoggedInUser = baseTest.extend({
  storageState: async ({}, use) => {
    await use('state/logged-in-user.json');
  },
});

export const test = { asANewUser, asAReturningUser, asALoggedInUser };

export { expect } from '@playwright/test';
