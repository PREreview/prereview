import { Options } from '@mikro-orm/core';
import {
  badgeSchema,
  baseEntitySchema,
  commentSchema,
  communitySchema,
  contactSchema,
  eventSchema,
  expertiseSchema,
  fullReviewSchema,
  fullReviewDraftSchema,
  groupSchema,
  keySchema,
  personaSchema,
  preprintSchema,
  rapidReviewSchema,
  reportSchema,
  requestSchema,
  statementSchema,
  tagSchema,
  templateSchema,
  userSchema,
  workSchema,
} from './models/entities';
import config from './config';

const authString =
  config.dbUser && config.dbPass ? `${config.dbUser}:${config.dbPass}@` : '';
const portString = config.dbPort ? `:${config.dbPort}` : '';

const options: Options = {
  entities: [
    badgeSchema,
    baseEntitySchema,
    commentSchema,
    communitySchema,
    contactSchema,
    eventSchema,
    expertiseSchema,
    fullReviewSchema,
    fullReviewDraftSchema,
    groupSchema,
    keySchema,
    personaSchema,
    preprintSchema,
    rapidReviewSchema,
    reportSchema,
    requestSchema,
    statementSchema,
    tagSchema,
    templateSchema,
    userSchema,
    workSchema,
  ],
  type: 'postgresql',
  debug: config.logLevel === 'trace',
  clientUrl: `postgresql://${authString}${config.dbHost}${portString}/${config.dbName}`,
  cache: {
    pretty: true,
    options: {
      cacheDir: '.mikroorm-cache',
    },
  },
  migrations: {
    disableForeignKeys: false,
    path: 'src/backend/db/migrations/postgresql',
  },
};

if (config.dbTls) {
  options.driverOptions = { connection: { ssl: true } };
}

export default options;
