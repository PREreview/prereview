import { EntityRepository, MikroORM, Repository } from '@mikro-orm/core';
import { Comment } from './entities';

@Repository(Comment)
export class CommentModel extends EntityRepository<Comment> {}

export function commentModelWrapper(db: MikroORM): CommentModel {
  return db.em.getRepository(Comment);
}
