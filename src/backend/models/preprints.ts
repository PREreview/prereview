import { EntityRepository, MikroORM, Repository } from '@mikro-orm/core';
import { Preprint } from './entities';
import { isString } from '../../common/utils/strings';
import { decodePreprintId } from '../../common/utils/ids';
import { ChainError } from '../../common/errors';

@Repository(Preprint)
export class PreprintModel extends EntityRepository<Preprint> {
  findOneByHandle(value: string): any {
    try {
      const { id } = decodePreprintId(value);
      return this.findOne({ handle: id });
    } catch (err) {
      throw new ChainError('Failed to parse handle.', err);
    }
  }

  findOneByIdOrHandle(value: number | string): any {
    if (Number.isInteger(value)) {
      return this.findOne(value as number);
    } else if (isString(value)) {
      return this.findOneByHandle(value as string);
    }
    throw new ChainError(`'${value}' is not a valid ID or Handle`);
  }
}

export function preprintModelWrapper(db: MikroORM): PreprintModel {
  return db.em.getRepository(Preprint);
}
