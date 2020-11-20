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

const dbType = config.isDev ? 'sqlite' : 'postgres';
const authString =
  config.dbUser && config.dbPass ? `${config.dbUser}:${config.dbPass}@` : '';
const portString = config.dbPort ? `:${config.dbPort}` : '';

export default {
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
