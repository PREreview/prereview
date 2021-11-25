import { EntityRepository, MikroORM } from '@mikro-orm/core';
import { Work } from './entities';

export class WorkModel extends EntityRepository<Work> {}

export function workModelWrapper(db: MikroORM): WorkModel {
  return db.em.getRepository(Work);
}
