import { MikroORM } from '@mikro-orm/core';
import { TsMorphMetadataProvider } from '@mikro-orm/reflection';

const dbWrapper = async (
  dbType: string,
  dbHost: string,
  dbPort: number,
  dbName: string,
  dbUser: string,
  dbPass: string,
): [MikroORM, function] => {
  const authString = dbUser && dbPass ? `${dbUser}:${dbPass}@` : '';
  const portString = dbPort ? `:${dbPort}` : '';

  const orm = await MikroORM.init({
    metadataProvider: TsMorphMetadataProvider, // use actual TS types
    entities: ['dist/backend/models/entities'],
    entitiesTS: ['src/backend/models/entities'],
    type: dbType,
    clientUrl: `${dbType}://${authString}${dbHost}${portString}/${dbName}`,
  });
  const dbMiddleware = (_, next) => RequestContext.createAsync(orm.em, next);
  return [orm, dbMiddleware];
};

export default dbWrapper;
