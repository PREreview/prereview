import { Fixtures, PlaywrightTestOptions } from '@playwright/test';
import crc32 from 'crc-32';
import faker from 'faker';
import { ensurePreprint, Preprint } from './api';
import { Fetch, fetch } from './fetch';

type FakerFixtures = {
  seed: number;
  faker: typeof faker;
};

type HttpFixtures = {
  fetch: Fetch;
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

export const httpFixtures: Fixtures<HttpFixtures, {}, PlaywrightTestOptions> = {
  fetch: async (
    // Types needed due to https://github.com/microsoft/playwright/issues/9125
    { baseURL }: PlaywrightTestOptions,
    use: (r: Fetch) => Promise<void>,
  ) => {
    await use(fetch(baseURL));
  },
};

export const dataFixtures: Fixtures<
  DataFixtures,
  {},
  FakerFixtures & HttpFixtures
> = {
  preprint: async ({ faker, fetch }, use) => {
    const preprint: Preprint = {
      doi: `10.5555/${faker.datatype.uuid()}`,
      title: faker.lorem.sentence(),
      abstract: faker.lorem.sentences(),
    };

    await ensurePreprint(fetch, preprint);

    await use(preprint);
  },
};
