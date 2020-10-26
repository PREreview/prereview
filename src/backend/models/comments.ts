import { EntityRepository, MikroORM, Repository } from '@mikro-orm/core';
import Comment from './entities/Comment';

@Repository(Comment)
export class CommentModel extends EntityRepository<Comment> {}

const commentModelWrapper = (db: MikroORM): CommentModel =>
  db.em.getRepository(Comment);

export default commentModelWrapper;
