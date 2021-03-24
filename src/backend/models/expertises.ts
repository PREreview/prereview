import { EntityRepository, MikroORM, Repository } from '@mikro-orm/core';
import { Expertise } from './entities';

@Repository(Expertise)
export class ExpertiseModel extends EntityRepository<Expertise> {}

export function expertiseModelWrapper(db: MikroORM): ExpertiseModel {
  return db.em.getRepository(Expertise);
}
