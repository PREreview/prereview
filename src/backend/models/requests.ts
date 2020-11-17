import { EntityRepository, MikroORM, Repository } from '@mikro-orm/core';
import { Request } from './entities';

@Repository(Request)
export class RequestModel extends EntityRepository<Request> {}

export function requestModelWrapper(db: MikroORM): RequestModel {
  return db.em.getRepository(Request);
}
