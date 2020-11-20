import { EntityRepository, MikroORM, Repository } from '@mikro-orm/core';
import { FullReview } from './entities';

@Repository(FullReview)
export class FullReviewModel extends EntityRepository<FullReview> {}

export function fullReviewModelWrapper(db: MikroORM): FullReviewModel {
  return db.em.getRepository(FullReview);
}
