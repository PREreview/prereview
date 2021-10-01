import {
  Fixtures,
  PlaywrightTestArgs,
  PlaywrightTestOptions,
} from '@playwright/test';
import crc32 from 'crc-32';
import faker from 'faker';
import fs from 'fs';
import { Agent } from 'http';
import {
  Community,
  ensureCommunity,
  ensurePreprint,
  ensureTemplate,
  findUser,
  Preprint,
  Template,
  User,
} from './api';
import { Fetch, fetch } from './fetch';
import { loggingAgent } from './http';

type FakerFixtures = {
  seed: number;
  faker: typeof faker;
};

type HttpFixtures = {
  agent: Agent;
  fetch: Fetch;
};

type DataFixtures = {
  community: Community;
  preprint: Preprint;
  template: Template;
};

type UserFixtures = {
  user: User;
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
  agent: async ({}, use, { outputPath }) => {
    const log = fs.createWriteStream(outputPath('http.txt'));

    await use(loggingAgent(log));

    log.close();
  },
  fetch: async (
    // Types needed due to https://github.com/microsoft/playwright/issues/9125
    { agent, baseURL }: PlaywrightTestOptions & HttpFixtures,
    use: (r: Fetch) => Promise<void>,
  ) => {
    await use(fetch(baseURL, agent));
  },
};

export const dataFixtures: Fixtures<
  DataFixtures,
  {},
  FakerFixtures & HttpFixtures
> = {
  community: async ({ faker, fetch }, use) => {
    const community = await ensureCommunity(fetch, {
      name: faker.lorem.words(),
      slug: faker.lorem.slug(),
    });

    await use(community);
  },
  preprint: async ({ faker, fetch }, use) => {
    const preprint = await ensurePreprint(fetch, {
      handle: `doi:10.5555/${faker.datatype.uuid()}`,
      title: faker.lorem.sentence(),
      abstractText: faker.lorem.sentences(),
    });

    await use(preprint);
  },
  template: async ({ community, faker, fetch }, use) => {
    const template = await ensureTemplate(fetch, community.uuid, {
      title: faker.lorem.words(),
      contents: faker.lorem.sentences(),
    });

    await use(template);
  },
};

export const userFixtures: Fixtures<
  UserFixtures,
  {},
  HttpFixtures & PlaywrightTestArgs & PlaywrightTestOptions
> = {
  user: async ({ baseURL, context, fetch }, use) => {
    const cookie = await context
      .cookies(baseURL)
      .then(cookies => cookies.find(cookie => cookie.name === 'PRE_user'));

    if (!cookie) {
      throw new Error('Cookie not found');
    }

    const user = await findUser(fetch, cookie.value);

    if (!user) {
      throw new Error('User not found');
    }

    await use(user);
  },
};
