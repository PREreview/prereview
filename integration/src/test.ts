import { test as baseTest } from '@playwright/test';
import crc32 from 'crc-32';
import faker from 'faker';
import { ensurePreprint, Preprint } from './api';

type DataFixtures = {
  seed: number;
  preprint: Preprint;
};

const dataTest = baseTest.extend<DataFixtures>({
  seed: async ({}, use, testInfo) => {
    await use(crc32.str(testInfo.snapshotPath(testInfo.title)));
  },
  preprint: async ({ seed }, use) => {
    faker.seed(seed);

    const preprint: Preprint = {
      doi: `10.5555/${faker.datatype.uuid()}`,
      title: faker.lorem.sentence(),
      abstract: faker.lorem.sentences(),
    };

    await ensurePreprint(preprint);

    await use(preprint);
  },
});

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
