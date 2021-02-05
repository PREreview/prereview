import { EntityRepository, MikroORM, Repository } from '@mikro-orm/core';
import orcidUtils from 'orcid-utils';
import { User } from './entities';
import { isString } from '../../common/utils/strings';
import { ChainError } from '../../common/errors';

@Repository(User)
export class UserModel extends EntityRepository<User> {
  findOneByUuidOrOrcid(value: string, params: string[]): any {
    try {
      if (orcidUtils.isValid(value)) {
        return this.findOne({ orcid: value }, params);
      }
      return this.findOne({ uuid: value }, params);
    } catch (err) {
      throw new ChainError('Failed to parse ORCID for user.', err);
    }
  }
}

export function userModelWrapper(db: MikroORM): UserModel {
  return db.em.getRepository(User);
}
