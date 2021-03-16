import { EntityRepository, MikroORM, Repository } from '@mikro-orm/core';
import orcidUtils from 'orcid-utils';
import { validate as uuidValidate } from 'uuid';
import { User } from './entities';
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

  findOneByPersona(value: string, params: string[]): any {
    try {
      if (!uuidValidate(value)) {
        throw new Error(`Not a valid uuid: ${value}`);
      }
      return this.findOne({ personas: { uuid: value } }, params);
    } catch (err) {
      throw new ChainError(`Failed to find user for persona ${value}.`, err);
    }
  }

  findOneByKey(app: string, key: string, params: string[]): any {
    try {
      return this.em.findOne(User, { keys: { app: app, key: key } }, params);
    } catch (err) {
      throw new ChainError(`Failed to find user for API appId ${app}.`, err);
    }
  }
}

export function userModelWrapper(db: MikroORM): UserModel {
  return db.em.getRepository(User);
}
