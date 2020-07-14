import { validate } from '../../common/schemas/prereview.js';
import { BadRequestError } from '../../common/errors.js';

export default class Prereview {
  constructor(db) {
    this._db = db;
  }

  async create(prereview) {
    try {
      await validate(prereview);
    } catch (err) {
      throw new BadRequestError('Failed to create library: ', err);
    }
    return this._db
      .table('prereviews')
      .insert(prereview)
      .returning('*');
  }

  async update(id, prereview) {
    try {
      await validate(prereview);
    } catch (err) {
      throw new BadRequestError('Failed to update prereview: ', err);
    }
    return this._db
      .table('prereviews')
      .update(prereview)
      .where({ id: parseInt(id) })
      .update(prereview)
      .returning('*');
  }

  async delete(id) {
    return this._db
      .table('prereviews')
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
      .table('prereviews')
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
      .table('prereviews')
      .select('*')
      .where({ id: parseInt(id) });
  }

  async findAll() {
    return this._db.table('prereviews').select('*');
  }
}
