import { EntityRepository, MikroORM } from '@mikro-orm/core';
import { Badge } from './entities';

export class BadgeModel extends EntityRepository<Badge> {}

export function badgeModelWrapper(db: MikroORM): BadgeModel {
  return db.em.getRepository(Badge);
}
