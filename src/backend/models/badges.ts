import { EntityRepository, MikroORM, Repository } from '@mikro-orm/core';
import { Badge } from './entities';

@Repository(Badge)
export class BadgeModel extends EntityRepository<Badge> {}

export function badgeModelWrapper(db: MikroORM): BadgeModel {
  return db.em.getRepository(Badge);
}
