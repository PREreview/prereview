import { TsMorphMetadataProvider } from '@mikro-orm/reflection';
import Comment from './models/entities/comment';
import Community from './models/entities/community';
import FullReview from './models/entities/fullReview';
import FullReviewDraft from './models/entities/fullReviewDraft';
import Group from './models/entities/group';
import Persona from './models/entities/persona';
import Preprint from './models/entities/preprint';
import RapidReview from './models/entities/rapidReview';
import Request from './models/entities/request';
import Tag from './models/entities/tag';
import User from './models/entities/user';
import config from './config.js';

const dbType = config.isDev ? 'sqlite' : 'postgres';
const authString =
  config.dbUser && config.dbPass ? `${config.dbUser}:${config.dbPass}@` : '';
const portString = config.dbPort ? `:${config.dbPort}` : '';

export default {
  //metadataProvider: TsMorphMetadataProvider, // use actual TS types
  //  entities: ['dist/models/entities'],
  entities: [
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
