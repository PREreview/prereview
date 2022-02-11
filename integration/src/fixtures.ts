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
  AuthHeaders,
  ApiKey,
  Community,
  ensureRapidReview,
  ensureApiKey,
  ensureCommunity,
  ensureFullReview,
  ensurePreprint,
  ensureRequestByAuthor,
  ensureTemplate,
  findUser,
  FullReview,
  Preprint,
  RapidReview,
  Request,
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
  fullReview: FullReview;
  preprint: Preprint;
  requestByAuthor: Request;
  template: Template;
};

type UserFixtures = {
  apiFetch: Fetch;
  apiHeaders: AuthHeaders;
  apiKey: ApiKey;
  user: User;
};

type UserDataFixtures = {
  fullReview: FullReview;
  rapidReview: RapidReview;
};

export const fakerFixtures: Fixtures<FakerFixtures> = {
  seed: async ({}, use, testInfo) => {
    await use(crc32.str(testInfo.snapshotPath(testInfo.title.replace(/ /g, '-'))));
  },
  faker: async ({ seed }, use) => {
    faker.seed(seed);

    await use(faker);
  },
};

export const httpFixtures: Fixtures<
  HttpFixtures,
  Record<never, never>,
  PlaywrightTestOptions
> = {
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
  Record<never, never>,
  FakerFixtures & HttpFixtures
> = {
  community: async ({ faker, fetch }, use) => {
    const community = await ensureCommunity(fetch, {
      name: faker.lorem.words(),
      slug: faker.lorem.slug(),
    });

    await use(community);
  },
  fullReview: async ({ fetch, preprint }, use) => {
    const fullReview = await ensureFullReview(fetch, preprint.uuid);

    await use(fullReview);
  },
  preprint: async ({ faker, fetch }, use) => {
    const preprint = await ensurePreprint(fetch, {
      handle: `doi:10.5555/${faker.datatype.uuid()}`,
      title: faker.lorem.sentence(),
      abstractText: faker.lorem.sentences(),
    });

    await use(preprint);
  },
  requestByAuthor: async ({ fetch, preprint }, use) => {
    const requestByAuthor = await ensureRequestByAuthor(fetch, preprint.uuid);

    await use(requestByAuthor);
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
  Record<never, never>,
  HttpFixtures & PlaywrightTestArgs & PlaywrightTestOptions
> = {
  apiFetch: async (
    // Types needed due to https://github.com/microsoft/playwright/issues/9125
    { apiHeaders, fetch }: PlaywrightTestOptions & HttpFixtures & UserFixtures,
    use: (r: Fetch) => Promise<void>,
  ) => {
    await use((url, init = {}) =>
      fetch(url, { ...init, headers: { ...apiHeaders, ...init.headers } }),
    );
  },
  apiHeaders: async ({ apiKey }, use) => {
    await use({
      'X-API-App': apiKey.app,
      'X-API-Key': apiKey.secret,
    });
  },
  apiKey: async ({ fetch, user }, use) => {
    const apiKey = await ensureApiKey(fetch, user.uuid);

    await use(apiKey);
  },
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

export const userDataFixtures: Fixtures<
  UserDataFixtures,
  Record<never, never>,
  DataFixtures & HttpFixtures & UserFixtures
> = {
  fullReview: async ({ apiHeaders, fetch, preprint }, use) => {
    const fullReview = await ensureFullReview(fetch, preprint.uuid, apiHeaders);

    await use(fullReview);
  },
  rapidReview: async ({ apiHeaders, fetch, preprint }, use) => {
    const rapidReview = await ensureRapidReview(
      fetch,
      preprint.uuid,
      apiHeaders,
    );

    await use(rapidReview);
  },
};
