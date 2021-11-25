import { EntityRepository, MikroORM } from '@mikro-orm/core';
import { RapidReview } from './entities';

export class RapidReviewModel extends EntityRepository<RapidReview> {}

export function rapidReviewModelWrapper(db: MikroORM): RapidReviewModel {
  return db.em.getRepository(RapidReview);
}
