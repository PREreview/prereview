import { EntityRepository, MikroORM, Repository } from '@mikro-orm/core';
import { Key } from './entities';

@Repository(Key)
export class KeyModel extends EntityRepository<Key> {}

export function keyModelWrapper(db: MikroORM): KeyModel {
  return db.em.getRepository(Key);
}
