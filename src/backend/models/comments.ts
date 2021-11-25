import { EntityRepository, MikroORM } from '@mikro-orm/core';
import { Comment } from './entities';

export class CommentModel extends EntityRepository<Comment> {}

export function commentModelWrapper(db: MikroORM): CommentModel {
  return db.em.getRepository(Comment);
}
