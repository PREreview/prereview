import { validate } from '../../common/schemas/preprint.js';
import { BadRequestError } from '../../common/errors.js';

export default class PreprintManager {
  constructor(db) {
    this._db = db;
  }

  async create(preprint) {
    try {
      await validate(preprint);
    } catch (err) {
      throw new BadRequestError('Failed to create library: ', err);
    }
    return this._db
      .table('preprints')
      .insert(preprint)
      .returning('*');
  }

  async update(id, preprint) {
    try {
      await validate(preprint);
    } catch (err) {
      throw new BadRequestError('Failed to update preprint: ', err);
    }
    return this._db
      .table('preprints')
      .update(preprint)
      .where({ id: parseInt(id) })
      .update(preprint)
      .returning('*');
  }

  async delete(id) {
    return this._db
      .table('preprints')
      .del()
      .where({ id: parseInt(id) })
      .returning('*');
  }

  async find({
    start: start = 0,
    end: end,
    asc: asc = true,
    sort_by: sort_by = 'id',
    from: from,
    to: to,
  }) {
    const rows = await this._db
      .table('preprints')
      .select('*')
      .modify(queryBuilder => {
        if (from) {
          queryBuilder.where('created_at', '>', from);
        }

        if (to) {
          queryBuilder.where('created_at', '<', to);
        }

        if (asc) {
          queryBuilder.orderBy(sort_by, 'asc');
        } else {
          queryBuilder.orderBy(sort_by, 'desc');
        }

        if (start > 0) {
          queryBuilder.offset(start);
        }

        if (end && end > start) {
          queryBuilder.limit(end - start);
        }
      });

    return rows || [];
  }

  async findById(id) {
    return this._db
      .table('preprints')
      .select('*')
      .where({ id: parseInt(id) });
  }

  async findAll() {
    return this._db.table('preprints').select('*');
  }
}
