import { EntityRepository, MikroORM, Repository } from '@mikro-orm/core';
import orcidUtils from 'orcid-utils';
import { User } from './entities';
import { isString } from '../../common/utils/strings';
import { ChainError } from '../../common/errors';

@Repository(User)
export class UserModel extends EntityRepository<User> {
  findOneByOrcid(value: string, params: string[]): any {
    try {
      if (!orcidUtils.isValid(value)) {
        throw new ChainError(`Invalid ORCID: ${value}`);
      }
      return this.findOne({ orcid: value }, params);
    } catch (err) {
      throw new ChainError('Failed to parse ORCID for user.', err);
    }
  }

  findOneByIdOrOrcid(value: number | string, params: string[]): any {
    if (Number.isInteger(value)) {
      return this.findOne(value as number, params);
    } else if (isString(value)) {
      return this.findOneByOrcid(value as string, params);
    }
    throw new ChainError(`'${value}' is not a valid ID or ORCID`);
  }
}

export function userModelWrapper(db: MikroORM): UserModel {
  return db.em.getRepository(User);
}
