import { Options } from '@mikro-orm/core';
import {
  BaseEntity,
  Comment,
  Community,
  FullReview,
  FullReviewDraft,
  Group,
  Persona,
  Preprint,
  RapidReview,
  Request,
  Tag,
  User,
} from './models/entities';
import config from './config';

type DbDrivers = 'postgresql' | 'sqlite' | 'mongo' | 'mysql' | 'mariadb';

let dbType: DbDrivers;
if (config.isDev) {
  dbType = 'sqlite';
} else {
  dbType = 'postgresql';
}
const authString =
  config.dbUser && config.dbPass ? `${config.dbUser}:${config.dbPass}@` : '';
const portString = config.dbPort ? `:${config.dbPort}` : '';

const options: Options = {
  entities: [
    BaseEntity,
    Comment,
    Community,
    FullReview,
    FullReviewDraft,
    Group,
    Persona,
    Preprint,
    RapidReview,
    Request,
    Tag,
    User,
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
    path: 'src/backend/db/migrations',
  },
};

export default options;
