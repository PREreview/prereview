import { validate } from '../../common/schemas/setting.js';
import { BadRequestError } from '../../common/errors.js';

export default class SettingManager {
  constructor(db) {
    this._db = db;
  }

  async update(key, value) {
    try {
      await validate({ value: value });
    } catch (err) {
      throw new BadRequestError('Failed to update setting: ', err);
    }

    value = value || ' ';
    return this._db
      .table('settings')
      .where({ key: key })
      .update(
        {
          value: value,
        },
        ['key', 'value'],
      );
  }

  async delete(key) {
    return this._db
      .table('settings')
      .del()
      .where({ key: key })
      .returning('*');
  }

  async findById(key) {
    return this._db
      .table('settings')
      .select('*')
      .where({ key: key });
  }

  async findAll() {
    return this._db.table('settings').select('*');
  }
}
