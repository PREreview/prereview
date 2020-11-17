import { EntityRepository, MikroORM, Repository } from '@mikro-orm/core';
import { Tag } from './entities';

@Repository(Tag)
export class TagModel extends EntityRepository<Tag> {}

export function tagModelWrapper(db: MikroORM): TagModel {
  return db.em.getRepository(Tag);
}
