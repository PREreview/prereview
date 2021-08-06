import { Options } from '@mikro-orm/core';
import {
  Badge,
  BaseEntity,
  Comment,
  Community,
  Contact,
  Event,
  Expertise,
  FullReview,
  FullReviewDraft,
  Group,
  Key,
  Persona,
  Preprint,
  RapidReview,
  Report,
  Request,
  Statement,
  Tag,
  Template,
  User,
  Work,
} from './models/entities';
import config from './config';

const authString =
  config.dbUser && config.dbPass ? `${config.dbUser}:${config.dbPass}@` : '';
const portString = config.dbPort ? `:${config.dbPort}` : '';

const options: Options = {
  entities: [
    Badge,
    BaseEntity,
    Comment,
    Community,
    Contact,
    Event,
    Expertise,
    FullReview,
    FullReviewDraft,
    Group,
    Key,
    Persona,
    Preprint,
    RapidReview,
    Report,
    Request,
    Statement,
    Tag,
    Template,
    User,
    Work,
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
