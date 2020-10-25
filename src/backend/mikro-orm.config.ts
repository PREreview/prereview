import { TsMorphMetadataProvider } from '@mikro-orm/reflection';
import config from './config.js';

const dbType = config.isDev ? 'sqlite' : 'postgres';
const authString =
  config.dbUser && config.dbPass ? `${config.dbUser}:${config.dbPass}@` : '';
const portString = config.dbPort ? `:${config.dbPort}` : '';

export default {
  metadataProvider: TsMorphMetadataProvider, // use actual TS types
  entities: ['../../dist/backend/entities'],
  entitiesTS: ['models/entities'],
  type: dbType,
  clientUrl: `${dbType}://${authString}${config.dbHost}${portString}/${
    config.dbName
  }`,
};
