import { EntityRepository, MikroORM, Repository } from '@mikro-orm/core';
import { Group } from './entities';

@Repository(Group)
export class GroupModel extends EntityRepository<Group> {}

export function groupModelWrapper(db: MikroORM): GroupModel {
  return db.em.getRepository(Group);
}
