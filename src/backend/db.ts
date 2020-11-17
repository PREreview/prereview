import { MikroORM, RequestContext } from '@mikro-orm/core';
import 'reflect-metadata';
import config from './mikro-orm.config';

type Middleware = (
  ctx: Record<string, unknown>,
  next: (...args: any[]) => Promise<void>,
) => Promise<void>;

export async function dbWrapper(): Promise<[MikroORM, Middleware]> {
  const orm = await MikroORM.init(config);
  const dbMiddleware: Middleware = (_, next) =>
    RequestContext.createAsync(orm.em, next);
  return [orm, dbMiddleware];
}
