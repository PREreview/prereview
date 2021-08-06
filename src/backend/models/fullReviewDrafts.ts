import { EntityRepository, MikroORM, Repository } from '@mikro-orm/core';
import { FullReviewDraft } from './entities';

@Repository(FullReviewDraft)
export class FullReviewDraftModel extends EntityRepository<FullReviewDraft> {
  async search(query: string): Promise<any> {
    const connection = this.em.getConnection();

    return await connection.execute(
      `SELECT * FROM full_review_draft WHERE fts @@ websearch_to_tsquery('english'::regconfig, '${query}') LIMIT 10000;`,
    );
  }
}

export function fullReviewDraftModelWrapper(
  db: MikroORM,
): FullReviewDraftModel {
  return db.em.getRepository(FullReviewDraft);
}
