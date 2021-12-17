import { EntityRepository, MikroORM } from '@mikro-orm/core';
import { ORCID as orcidUtils } from 'orcid-utils';
import { validate as uuidValidate } from 'uuid';
import { User } from './entities';
import ChainedError from 'typescript-chained-error';

export class UserModel extends EntityRepository<User> {
  findOneByUuidOrOrcid(value: string, params: string[]): Promise<User | null> {
    try {
      if (orcidUtils.isValid(value)) {
        return this.findOne({ orcid: value }, params);
      }
      return this.findOne({ uuid: value }, params);
    } catch (err) {
      throw new ChainedError('Failed to parse ORCID for user.', err);
    }
  }

  findOneByPersona(value: string, params: string[]): Promise<User | null> {
    try {
      if (!uuidValidate(value)) {
        throw new Error(`Not a valid uuid: ${value}`);
      }
      return this.findOne({ personas: { uuid: value } }, params);
    } catch (err) {
      throw new ChainedError(`Failed to find user for persona ${value}.`, err);
    }
  }

  findOneByKey(
    app: string,
    secret: string,
    params?: string[],
  ): Promise<User | null> {
    try {
      return this.em.findOne(
        User,
        { keys: { app: app, secret: secret } },
        params,
      );
    } catch (err) {
      throw new ChainedError(`Failed to find user for API appId ${app}.`, err);
    }
  }
}

export function userModelWrapper(db: MikroORM): UserModel {
  return db.em.getRepository(User);
}
