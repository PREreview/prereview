import { test as baseTest } from '@playwright/test';
import {
  dataFixtures,
  fakerFixtures,
  httpFixtures,
  userDataFixtures,
  userFixtures,
} from '../fixtures';

const dataTest = baseTest
  .extend(fakerFixtures)
  .extend(httpFixtures)
  .extend(dataFixtures);

const asAnAnonymousAPIUser = dataTest;

const asAnAuthenticatedAPIUser = dataTest
  .extend(userFixtures)
  .extend(userDataFixtures)
  .extend({
    storageState: async ({}, use) => {
      await use('state/logged-in-user.json');
    },
  });

export const test = {
  asAnAnonymousAPIUser,
  asAnAuthenticatedAPIUser,
};

export { expect } from '@playwright/test';
