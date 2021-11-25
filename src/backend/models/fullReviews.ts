import { EntityRepository, MikroORM } from '@mikro-orm/core';
import { FullReview } from './entities';

export class FullReviewModel extends EntityRepository<FullReview> {}

export function fullReviewModelWrapper(db: MikroORM): FullReviewModel {
  return db.em.getRepository(FullReview);
}
