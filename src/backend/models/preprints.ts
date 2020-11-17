import { EntityRepository, MikroORM, Repository } from '@mikro-orm/core';
import { Preprint } from './entities';

@Repository(Preprint)
export class PreprintModel extends EntityRepository<Preprint> {}

export function preprintModelWrapper(db: MikroORM): PreprintModel {
  return db.em.getRepository(Preprint);
}
