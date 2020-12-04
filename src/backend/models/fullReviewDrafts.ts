import { EntityRepository, MikroORM, Repository } from '@mikro-orm/core';
import { PostgreSqlConnection } from '@mikro-orm/postgresql';
import { SqliteConnection } from '@mikro-orm/sqlite';
import { FullReviewDraft } from './entities';
import { ChainError } from '../../common/errors';

@Repository(FullReviewDraft)
export class FullReviewDraftModel extends EntityRepository<FullReviewDraft> {
  async search(query: string): Promise<any> {
    const connection = this.em.getConnection();
    let res: Array<object>;
    if (connection instanceof PostgreSqlConnection) {
      res = await connection.execute(
        `SELECT * FROM full_review_draft WHERE fts @@ websearch_to_tsquery('english'::regconfig, '${query}') LIMIT 10000;`,
      );
    } else if (connection instanceof SqliteConnection) {
      res = await connection.execute(
        `SELECT * FROM full_review_draft_fts WHERE full_review_draft_fts MATCH '${query}' ORDER BY rank;`,
      );
    } else {
      throw new ChainError('Database type does not support full-text search');
    }
    console.log('***res***:', res);
    return res;
  }
}

export function fullReviewDraftModelWrapper(
  db: MikroORM,
): FullReviewDraftModel {
  return db.em.getRepository(FullReviewDraft);
}
