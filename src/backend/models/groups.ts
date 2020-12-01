import { EntityRepository, MikroORM, Repository } from '@mikro-orm/core';
import { NotFoundError } from '../../common/errors';
import { Group } from './entities';
import { User } from './entities';

@Repository(Group)
export class GroupModel extends EntityRepository<Group> {
  async isMemberOf(groupName: string, userId: number): Promise<boolean> {
    const group = await this.findOne({ name: groupName }, ['members']);
    const user = await this.em.getReference(User, userId);

    if (!user) return false;
    if (!group) {
      throw new NotFoundError(`No such group ${groupName}`);
    }
    return group.members.contains(user);
  }
}

export function groupModelWrapper(db: MikroORM): GroupModel {
  return db.em.getRepository(Group);
}
