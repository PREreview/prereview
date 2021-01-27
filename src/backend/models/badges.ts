import { EntityRepository, MikroORM, Repository } from '@mikro-orm/core';
import { Badge } from './entities';
import { isString } from '../../common/utils/strings';
import { ChainError } from '../../common/errors';

@Repository(Badge)
export class BadgeModel extends EntityRepository<Badge> {
  findOneByIdOrName(value: number | string, params: string[]): any {
    if (Number.isInteger(value)) {
      return this.findOne(value as number, params);
    } else if (isString(value)) {
      return this.findOne({ name: value as string }, params);
    }
    throw new ChainError(`'${value}' is not a valid ID or name`);
  }
}

export function badgeModelWrapper(db: MikroORM): BadgeModel {
  return db.em.getRepository(Badge);
}
