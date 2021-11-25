import { EntityRepository, MikroORM } from '@mikro-orm/core';
import { Key } from './entities';

export class KeyModel extends EntityRepository<Key> {}

export function keyModelWrapper(db: MikroORM): KeyModel {
  return db.em.getRepository(Key);
}
