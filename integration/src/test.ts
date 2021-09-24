import { test as baseTest } from '@playwright/test';
import { dataFixtures, fakerFixtures, httpFixtures } from './fixtures';

const dataTest = baseTest
  .extend(fakerFixtures)
  .extend(httpFixtures)
  .extend(dataFixtures);

const asANewUser = dataTest;

const asAReturningUser = asANewUser.extend({
  storageState: async ({}, use) => {
    await use('state/returning-user.json');
  },
});

const asALoggedInUser = asAReturningUser.extend({
  storageState: async ({}, use) => {
    await use('state/logged-in-user.json');
  },
});

export const test = { asANewUser, asAReturningUser, asALoggedInUser };

export { expect } from '@playwright/test';
