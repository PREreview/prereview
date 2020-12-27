import { EntityRepository, MikroORM, Repository } from '@mikro-orm/core';
import { Work } from './entities';

@Repository(Work)
export class WorkModel extends EntityRepository<Work> {}

export function workModelWrapper(db: MikroORM): WorkModel {
  return db.em.getRepository(Work);
}
