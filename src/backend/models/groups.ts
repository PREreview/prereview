import { EntityRepository, MikroORM, Repository } from '@mikro-orm/core';
import { NotFoundError } from '../../common/errors';
import { Group } from './entities';

@Repository(Group)
export class GroupModel extends EntityRepository<Group> {
  isMemberOf(groupName: string, userId: number): boolean {
    const group = this.findOne({ name: groupName }, ['members']);
    if (!group) {
      throw new NotFoundError(`No such group ${groupName}`);
    }
    return group.members.includes(userId);
  }
}

export function groupModelWrapper(db: MikroORM): GroupModel {
  return db.em.getRepository(Group);
}
