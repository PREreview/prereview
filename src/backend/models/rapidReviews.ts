import { EntityRepository, MikroORM, Repository } from '@mikro-orm/core';
import RapidReview from './entities/rapidReview';

@Repository(RapidReview)
export class RapidReviewModel extends EntityRepository<RapidReview> {}

const rapidReviewModelWrapper = (db: MikroORM): RapidReviewModel =>
  db.em.getRepository(RapidReview);

export default rapidReviewModelWrapper;
