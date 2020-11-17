import { EntityRepository, MikroORM, Repository } from '@mikro-orm/core';
import { Community } from './entities';

@Repository(Community)
export class CommunityModel extends EntityRepository<Community> {}

export function communityModelWrapper(db: MikroORM): CommunityModel {
  return db.em.getRepository(Community);
}
