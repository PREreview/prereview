import { EntityRepository, MikroORM } from '@mikro-orm/core';
import { Expertise } from './entities';

export class ExpertiseModel extends EntityRepository<Expertise> {}

export function expertiseModelWrapper(db: MikroORM): ExpertiseModel {
  return db.em.getRepository(Expertise);
}
