import { EntityRepository, MikroORM, Repository } from '@mikro-orm/core';
import FullReview from './entities/fullReview.ts';

@Repository(FullReview)
class FullReviewModel extends EntityRepository<FullReview> {}

const fullReviewModelWrapper = (db: MikroORM): FullReviewModel =>
  db.em.getRepository(FullReview);

export default fullReviewModelWrapper;
