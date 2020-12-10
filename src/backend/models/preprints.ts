import { EntityRepository, MikroORM, Repository } from '@mikro-orm/core';
import { PostgreSqlConnection } from '@mikro-orm/postgresql';
import { SqliteConnection } from '@mikro-orm/sqlite';
import { Preprint } from './entities';
import { isString } from '../../common/utils/strings';
import { decodePreprintId } from '../../common/utils/ids';
import { ChainError } from '../../common/errors';

@Repository(Preprint)
export class PreprintModel extends EntityRepository<Preprint> {
  findOneByHandle(value: string, params: string[]): any {
    try {
      const { id } = decodePreprintId(value);
      return this.findOne({ handle: id }, params);
    } catch (err) {
      throw new ChainError('Failed to parse handle.', err);
    }
  }

  findOneByIdOrHandle(value: number | string, params: string[]): any {
    if (Number.isInteger(value)) {
      return this.findOne(value as number, params);
    } else if (isString(value)) {
      return this.findOneByHandle(value as string, params);
    }
    throw new ChainError(`'${value}' is not a valid ID or Handle`);
  }

  async search(query: string, params?: string[]): Promise<any> {
    const connection = this.em.getConnection();
    let res: Array<object>;
    if (connection instanceof PostgreSqlConnection) {
      res = await connection.execute(
        `SELECT * FROM preprint WHERE fts @@ websearch_to_tsquery('english'::regconfig, '${query}') LIMIT 10000;`,
      );
    } else if (connection instanceof SqliteConnection) {
      res = await connection.execute(
        `SELECT rowid AS id,* FROM preprint_fts WHERE preprint_fts MATCH '${query}' ORDER BY rank;`,
      );
    } else {
      throw new ChainError('Database type does not support full-text search');
    }
    const preprints = res.map(row => this.map(row)); // Map rows to full objects
    if (params) {
      await this.em.populate(preprints, params);
    }

    return preprints;
  }
}

export function preprintModelWrapper(db: MikroORM): PreprintModel {
  return db.em.getRepository(Preprint);
}
