import { MikroORM, RequestContext } from '@mikro-orm/core';
import { TsMorphMetadataProvider } from '@mikro-orm/reflection';
import 'reflect-metadata';

type Middleware = (
  ctx: Record<string, unknown>,
  next: (...args: any[]) => Promise<void>,
) => Promise<void>;

const dbWrapper = async (
  dbType: string,
  dbHost: string,
  dbPort: number,
  dbName: string,
  dbUser: string,
  dbPass: string,
): Promise<[MikroORM, Middleware]> => {
  const authString = dbUser && dbPass ? `${dbUser}:${dbPass}@` : '';
  const portString = dbPort ? `:${dbPort}` : '';

  const orm = await MikroORM.init();
  //if (dbType === 'postgresql') {
  //  orm = await MikroORM.init({
  //    metadataProvider: TsMorphMetadataProvider, // use actual TS types
  //    entities: ['dist/models/entities'],
  //    entitiesTs: ['src/backend/models/entities'],
  //    type: 'postgresql',
  //    clientUrl: `${dbType}://${authString}${dbHost}${portString}/${dbName}`,
  //  });
  //} else {
  //  orm = await MikroORM.init({
  //    metadataProvider: TsMorphMetadataProvider, // use actual TS types
  //    entities: ['dist/models/entities'],
  //    entitiesTs: ['src/backend/models/entities'],
  //    type: 'sqlite',
  //    clientUrl: `${dbType}://${authString}${dbHost}${portString}/${dbName}`,
  //  });
  //}

  const dbMiddleware: Middleware = (_, next) =>
    RequestContext.createAsync(orm.em, next);
  return [orm, dbMiddleware];
};

export default dbWrapper;
