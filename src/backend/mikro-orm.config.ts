import { Options } from '@mikro-orm/core';
import {
  Badge,
  BaseEntity,
  Comment,
  Community,
  Contact,
  FullReview,
  FullReviewDraft,
  Group,
  Persona,
  Preprint,
  RapidReview,
  Request,
  Tag,
  Template,
  User,
  Work,
} from './models/entities';
import config from './config';

type DbDrivers = 'postgresql' | 'sqlite' | 'mongo' | 'mysql' | 'mariadb';

const dbType: DbDrivers = config.dbType;

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
    FullReview,
    FullReviewDraft,
    Group,
    Persona,
    Preprint,
    RapidReview,
    Request,
    Tag,
    Template,
    User,
    Work,
  ],
  type: dbType,
  debug: config.logLevel === 'trace',
  clientUrl: `
  ${dbType}://${authString}${config.dbHost}${portString}/${config.dbName}`,
  cache: {
    pretty: true,
    options: {
      cacheDir: '.mikroorm-cache',
    },
  },
  migrations: {
    disableForeignKeys: false,
    path: `src/backend/db/migrations/${config.dbType}`,
  },
};

if (config.dbType === 'postgresql' && config.dbTls) {
  options.driverOptions = { connection: { ssl: true } };
}

export default options;
