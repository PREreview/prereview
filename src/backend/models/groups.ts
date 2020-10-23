import { EntityRepository, MikroORM, Repository } from '@mikro-orm/core';
import Group from './entities/group.ts';

@Repository(Group)
class GroupModel extends EntityRepository<Group> {}

const groupModelWrapper = (db: MikroORM): GroupModel =>
  db.em.getRepository(Group);

export default groupModelWrapper;
