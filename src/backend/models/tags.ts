import { EntityRepository, MikroORM } from '@mikro-orm/core';
import { Tag } from './entities';

export class TagModel extends EntityRepository<Tag> {}

export function tagModelWrapper(db: MikroORM): TagModel {
  return db.em.getRepository(Tag);
}
