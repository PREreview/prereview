import { EntityRepository, MikroORM } from '@mikro-orm/core';
import { Request } from './entities';

export class RequestModel extends EntityRepository<Request> {}

export function requestModelWrapper(db: MikroORM): RequestModel {
  return db.em.getRepository(Request);
}
