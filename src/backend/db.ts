import { MikroORM, RequestContext } from '@mikro-orm/core';
import 'reflect-metadata';

type Middleware = (
  ctx: Record<string, unknown>,
  next: (...args: any[]) => Promise<void>,
) => Promise<void>;

const dbWrapper = async (): Promise<[MikroORM, Middleware]> => {
  const orm = await MikroORM.init();
  const dbMiddleware: Middleware = (_, next) =>
    RequestContext.createAsync(orm.em, next);
  return [orm, dbMiddleware];
};

export default dbWrapper;
