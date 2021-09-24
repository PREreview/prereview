import { Fixtures } from '@playwright/test';
import crc32 from 'crc-32';
import faker from 'faker';
import { ensurePreprint, Preprint } from './api';

type FakerFixtures = {
  seed: number;
  faker: typeof faker;
};

type DataFixtures = {
  preprint: Preprint;
};

export const fakerFixtures: Fixtures<FakerFixtures> = {
  seed: async ({}, use, testInfo) => {
    await use(crc32.str(testInfo.snapshotPath(testInfo.title)));
  },
  faker: async ({ seed }, use) => {
    faker.seed(seed);

    await use(faker);
  },
};

export const dataFixtures: Fixtures<DataFixtures, {}, FakerFixtures> = {
  preprint: async ({ faker }, use) => {
    const preprint: Preprint = {
      doi: `10.5555/${faker.datatype.uuid()}`,
      title: faker.lorem.sentence(),
      abstract: faker.lorem.sentences(),
    };

    await ensurePreprint(preprint);

    await use(preprint);
  },
};
