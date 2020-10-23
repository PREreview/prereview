import { EntityRepository, MikroORM, Repository } from '@mikro-orm/core';
import Community from './entities/community.ts';

@Repository(Community)
class CommunityModel extends EntityRepository<Community> {}

const communityModelWrapper = (db: MikroORM): CommunityModel =>
  db.em.getRepository(Community);

export default communityModelWrapper;
