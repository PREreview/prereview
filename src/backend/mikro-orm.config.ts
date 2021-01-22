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
    User,
    Work,
  ],
  type: dbType,
  clientUrl: `${dbType}://${authString}${config.dbHost}${portString}/${
    config.dbName
  }`,
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

if (config.dbType === 'postgresql' && true) {
  options.driverOptions = { connection: { ssl: true } };
}

export default options;
