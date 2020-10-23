import { EntityRepository, MikroORM, Repository } from '@mikro-orm/core';
import Request from './entities/request.ts';

@Repository(Request)
class RequestModel extends EntityRepository<Request> {}

const requestModelWrapper = (db: MikroORM): RequestModel =>
  db.em.getRepository(Request);

export default requestModelWrapper;
