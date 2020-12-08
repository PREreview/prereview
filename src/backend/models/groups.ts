import { EntityRepository, MikroORM, Repository } from '@mikro-orm/core';
import orcidUtils from 'orcid-utils';
import { NotFoundError } from '../../common/errors';
import { isString } from '../../common/utils/strings';
import { Group } from './entities';
import { User } from './entities';
import { getLogger } from '../log.js';

const log = getLogger('backend:models:groups');

@Repository(Group)
export class GroupModel extends EntityRepository<Group> {
  async isMemberOf(
    groupName: string,
    userId: number | string,
  ): Promise<boolean> {
    const group = await this.findOne({ name: groupName }, ['members']);
    let user: any;
    if (isString(userId) && orcidUtils.isValid(userId)) {
      user = this.em.findOne(User, { orcid: userId as string });
    }
    user = this.em.getReference(User, userId as number);

    if (!user) return false;
    if (!group) {
      log.warn(`No such group ${groupName}`);
      return false;
    }
    return group.members.contains(user);
  }
}

export function groupModelWrapper(db: MikroORM): GroupModel {
  return db.em.getRepository(Group);
}
