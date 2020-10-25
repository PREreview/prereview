import { EntityRepository, MikroORM, Repository } from '@mikro-orm/core';
import Tag from './entities/tag.ts';

@Repository(Tag)
class TagModel extends EntityRepository<Tag> {}

const tagModelWrapper = (db: MikroORM): TagModel => db.em.getRepository(Tag);

export default tagModelWrapper;
