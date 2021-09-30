import { test as baseTest } from '@playwright/test';
import { ensureCommunityModerator } from '../api';
import {
  dataFixtures,
  fakerFixtures,
  httpFixtures,
  userFixtures,
} from '../fixtures';

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

const asALoggedInUser = asAReturningUser.extend(userFixtures).extend({
  storageState: async ({}, use) => {
    await use('state/logged-in-user.json');
  },
});

const asACommunityModerator = asALoggedInUser.extend({
  community: async ({ community, fetch, user }, use) => {
    await ensureCommunityModerator(
      fetch,
      community.uuid,
      user.defaultPersona.uuid,
    );

    await use(community);
  },
  storageState: async ({}, use) => {
    await use('state/logged-in-community-moderator.json');
  },
});

export const test = {
  asANewUser,
  asAReturningUser,
  asALoggedInUser,
  asACommunityModerator,
};

export { expect } from '@playwright/test';
