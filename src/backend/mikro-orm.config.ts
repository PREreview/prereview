import { TsMorphMetadataProvider } from '@mikro-orm/reflection';
import config from './config.js';

const dbType = config.isDev ? 'sqlite' : 'postgres';
const authString =
  config.dbUser && config.dbPass ? `${config.dbUser}:${config.dbPass}@` : '';
const portString = config.dbPort ? `:${config.dbPort}` : '';

export default {
  metadataProvider: TsMorphMetadataProvider, // use actual TS types
  entities: ['dist/backend/models/entities'],
  entitiesTs: ['src/backend/models/entities'],
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
