import { EntityRepository, MikroORM, Repository } from '@mikro-orm/core';
import FullReviewDraft from './entities/FullReviewDraft';

@Repository(FullReviewDraft)
export class FullReviewDraftModel extends EntityRepository<FullReviewDraft> {}

const fullReviewDraftModelWrapper = (db: MikroORM): FullReviewDraftModel =>
  db.em.getRepository(FullReviewDraft);

export default fullReviewDraftModelWrapper;
