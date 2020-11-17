import { EntityRepository, MikroORM, Repository } from '@mikro-orm/core';
import { FullReviewDraft } from './entities';

@Repository(FullReviewDraft)
export class FullReviewDraftModel extends EntityRepository<FullReviewDraft> {}

export function fullReviewDraftModelWrapper(
  db: MikroORM,
): FullReviewDraftModel {
  return db.em.getRepository(FullReviewDraft);
}
