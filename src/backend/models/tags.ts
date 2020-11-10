import { EntityRepository, MikroORM, Repository } from '@mikro-orm/core';
import { Tag } from './entities';

@Repository(Tag)
export class TagModel extends EntityRepository<Tag> {}

const tagModelWrapper = (db: MikroORM): TagModel => db.em.getRepository(Tag);

export default tagModelWrapper;
