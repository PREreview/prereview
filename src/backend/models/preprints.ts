import { EntityRepository, MikroORM, Repository } from '@mikro-orm/core';
import { PostgreSqlConnection } from '@mikro-orm/postgresql';
import { SqliteConnection } from '@mikro-orm/sqlite';
import { Preprint } from './entities';
import { isString } from '../../common/utils/strings';
import { decodePreprintId } from '../../common/utils/ids';
import { ChainError } from '../../common/errors';

interface PreprintQuery {
  limit: number;
  offset: number;
  desc: boolean;
  search: string;
  order: string;
}

@Repository(Preprint)
export class PreprintModel extends EntityRepository<Preprint> {
  findOneByHandle(value: string, params: string[]): any {
    try {
      const { id, scheme } = decodePreprintId(value);
      return this.findOne({ handle: `${scheme}:${id}` }, params);
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

  async search(query: PreprintQuery, params?: string[]): Promise<any> {
    const connection = this.em.getConnection();
    let res: Array<object>;
    let count: string | number;
    if (connection instanceof PostgreSqlConnection) {
      const knex = connection.getKnex();
      res = await knex
        .table('preprint')
        .select('preprint.*')
        .where('title', 'ilike', `%${query.search}%`)
        .orWhere('handle', 'ilike', `%${query.search}%`)
        .orWhere('abstract_text', 'ilike', `%${query.search}%`)
        .orWhere('authors', 'ilike', `%${query.search}%`)
        //.whereRaw("fts @@ websearch_to_tsquery('english'::regconfig, ?)", [
        //  `${query.search}:*`,
        //])
        .modify(qb => {
          let order = 'date_posted';
          if (query.order) {
            if (query.order === 'recentRequests') {
              qb.max('request.created_at AS requested_at').leftJoin('request', 'request.preprint_id', 'preprint.id').groupBy('preprint.id');
              order = 'requested_at';
            } else if (query.order === 'recentRapid') {
              qb.max('rapid_review.created_at AS rapidreviewed_at').leftJoin('rapid_review', 'rapid_review.preprint_id', 'preprint.id').groupBy('preprint.id');
              order = 'rapidreviewed_at';
            } else if (query.order === 'recentFull') {
              qb.max('full_review.created_at AS fullreviewed_at').leftJoin('full_review', 'full_review.preprint_id', 'preprint.id').groupBy('preprint.id');
              order = 'fullreviewed_at';
            }
          }
          if (query.desc) {
            qb.orderBy(order, 'desc');
          } else {
            qb.orderBy(order, 'asc');
          }

          if (query.limit) {
            qb.limit(query.limit);
          }

          if (query.offset) {
            qb.offset(query.offset);
          }
        });
      count = await knex
        .table('preprint')
        .count()
        .where('title', 'ilike', `%${query.search}%`)
        .orWhere('handle', 'ilike', `%${query.search}%`)
        .orWhere('abstract_text', 'ilike', `%${query.search}%`)
        .orWhere('authors', 'ilike', `%${query.search}%`);
      //.whereRaw("fts @@ websearch_to_tsquery('english'::regconfig, ?)", [
      //  `${query.search}:*`,
      //]);
      count = count[0]['count'];
    } else if (connection instanceof SqliteConnection) {
      const knex = connection.getKnex();
      const subquery = knex.select('rowid').from('preprint_fts').whereRaw('preprint_fts MATCH ?', [query.search]);
      res = await knex
        .table('preprint')
        .select('preprint.*')
        .whereIn('preprint.id', subquery)
        .modify(qb => {
          let order = 'date_posted';
          if (query.order) {
            if (query.order === 'recentRequests') {
              qb.max('request.created_at AS requested_at').leftJoin('request', 'request.preprint_id', 'preprint.id').groupBy('preprint.id');
              order = 'requested_at';
            } else if (query.order === 'recentRapid') {
              qb.max('rapid_review.created_at AS rapidreviewed_at').leftJoin('rapid_review', 'rapid_review.preprint_id', 'preprint.id').groupBy('preprint.id');
              order = 'rapidreviewed_at';
            } else if (query.order === 'recentFull') {
              qb.max('full_review.created_at AS fullreviewed_at').leftJoin('full_review', 'full_review.preprint_id', 'preprint.id').groupBy('preprint.id');
              order = 'fullreviewed_at';
            }
          }
          if (query.desc) {
            qb.orderBy(order, 'desc');
          } else {
            qb.orderBy(order, 'asc');
          }

          if (query.limit) {
            qb.limit(query.limit);
          }

          if (query.offset) {
            qb.offset(query.offset);
          }
        });
      count = await knex.table('preprint').count();
      count = count[0]['count(*)'];
    } else {
      throw new ChainError('Database type does not support full-text search');
    }
    const preprints = res.map(row => this.map(row)); // Map rows to full objects
    if (params) {
      await this.em.populate(preprints, params);
    }

    return [preprints, count as number];
  }
}

export function preprintModelWrapper(db: MikroORM): PreprintModel {
  return db.em.getRepository(Preprint);
}
