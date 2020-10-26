import { TsMorphMetadataProvider } from '@mikro-orm/reflection';
import config from './config.js';
import { Comment, Community, FullReview, FullReviewDraft, Group, Persona, Preprint, RapidReview, Request, Tag, User } from './models/entities';

const dbType = config.isDev ? 'sqlite' : 'postgres';
const authString =
  config.dbUser && config.dbPass ? `${config.dbUser}:${config.dbPass}@` : '';
const portString = config.dbPort ? `:${config.dbPort}` : '';

export default {
  metadataProvider: TsMorphMetadataProvider, // use actual TS types
  entities: [Comment, Community, FullReview, FullReviewDraft, Group, Persona, Preprint, RapidReview, Request, Tag, User],
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
