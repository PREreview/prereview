import { EntityRepository, MikroORM, Repository } from '@mikro-orm/core';
import { RapidReview } from './entities';

@Repository(RapidReview)
export class RapidReviewModel extends EntityRepository<RapidReview> {}

export function rapidReviewModelWrapper(db: MikroORM): RapidReviewModel {
  return db.em.getRepository(RapidReview);
}
