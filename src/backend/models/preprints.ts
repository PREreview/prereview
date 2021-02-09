import { EntityRepository, MikroORM, Repository } from '@mikro-orm/core';
import { Preprint } from './entities';
import { decodePreprintId } from '../../common/utils/ids';
import { ChainError } from '../../common/errors';
import { getLogger } from '../log.js';

const log = getLogger('backend:model:preprints');

@Repository(Preprint)
export class PreprintModel extends EntityRepository<Preprint> {
  async findOneByUuidOrHandle(value: string, params: string[]): Promise<any> {
    try {
      const { id, scheme } = decodePreprintId(value);
      return this.findOne({ handle: `${scheme}:${id}` }, params);
    } catch (err) {
      log.warn('Failed to extract handle, trying as a uuid');
    }
    try {
      return this.findOne({ uuid: value }, params);
    } catch (err) {
      throw new ChainError(`'${value}' is not a valid UUID or Handle`);
    }
  }
}

export function preprintModelWrapper(db: MikroORM): PreprintModel {
  return db.em.getRepository(Preprint);
}
