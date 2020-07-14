import bcrypt from 'bcryptjs';
import _ from 'lodash/core';
import { validate } from '../../common/schemas/user.js';
import { BadRequestError, ForbiddenError } from '../../common/errors.js';

function comparePass(userPassword, databasePassword) {
  return bcrypt.compareSync(userPassword, databasePassword);
}

/**
 * Initialize the QueueManager data model
 *
 * @class
 */
export default class User {
  constructor(db) {
    this._db = db;
  }

  async create(user, lid) {
    try {
      await validate(user);
      return this._db.transaction(async trx => {
        const location = user.location;
        const role = user.role;
        delete user.location;
        delete user.role;

        const query = {
          username: user.username,
          password: user.password,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          phone: user.phone,
          extension: user.extension,
          isActive: user.isActive,
        };

        if (!_.isEmpty(user)) {
          const salt = bcrypt.genSaltSync();
          query.password = bcrypt.hashSync(user.password, salt);
          await trx('users').insert(query);
        }

        let ids = [];
        ids = await trx('users')
          .select()
          .where({ username: user.username });

        if (location) {
          let lids = [];
          lids = await trx('libraries')
            .select('id')
            .where({ id: parseInt(lid ? lid : location) });

          if (!Array.isArray(lids) || lids.length < 1) {
            throw new BadRequestError('Invalid library ID.');
          }

          await trx('library_users')
            .del()
            .where({ uid: ids[0].id });

          await trx('library_users').insert({
            lid: lids[0].id,
            uid: ids[0].id,
          });
        }

        if (role) {
          let gids = [];
          gids = await trx('groups')
            .select('id')
            .where({ id: parseInt(role) });

          if (!Array.isArray(gids) || gids.length < 1) {
            throw new BadRequestError('Invalid group ID.');
          }

          await trx('user_groups')
            .del()
            .where({ uid: ids[0].id });

          await trx('user_groups').insert({ gid: gids[0].id, uid: ids[0].id });
        }
        return ids;
      });
    } catch (err) {
      throw new BadRequestError('Failed to create user: ', err);
    }
  }

  async update(id, user) {
    try {
      await validate(user);
    } catch (err) {
      throw new BadRequestError('Failed to update user: ', err);
    }
    return this._db.transaction(async trx => {
      const query = {
        username: user.username,
        password: user.password,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phone: user.phone,
        extension: user.extension,
        isActive: user.isActive,
      };

      if (user.location) {
        let lids = await trx('libraries')
          .select('id')
          .where({ id: parseInt(user.location) });

        lids = lids ? lids : [];

        if (lids.length < 1) {
          throw new BadRequestError('Invalid library ID.');
        }

        await trx('library_users')
          .del()
          .where({ uid: parseInt(id) });

        await trx('library_users').insert({ lid: lids[0].id, uid: id });
        delete user.location;
      }

      if (user.role) {
        let gids = await trx('groups')
          .select('id')
          .where({ id: parseInt(user.role) });

        gids = gids ? gids : [];

        if (gids.length < 0) {
          throw new BadRequestError('Invalid group ID.');
        }

        await trx('user_groups')
          .del()
          .where({ uid: parseInt(id) });

        await trx('user_groups').insert({ gid: gids[0].id, uid: id });
        delete user.role;
      }

      if (!_.isEmpty(user)) {
        if (user.password) {
          const salt = bcrypt.genSaltSync();
          query.password = bcrypt.hashSync(user.password, salt);
        }
        return await trx('users')
          .where({ id: parseInt(id) })
          .update(query, [
            'id',
            'firstName',
            'lastName',
            'username',
            'email',
            'phone',
            'extension',
            'isActive',
          ]);
      } else {
        return [id];
      }
    });
  }

  async updateSelf(id, user) {
    try {
      await validate(user, true);
    } catch (err) {
      throw new BadRequestError('Failed to update user: ', err);
    }

    const query = {
      firstName: user.firstName,
      lastName: user.lastName,
      username: user.username,
      email: user.email,
      phone: user.phone,
      extension: user.extension,
    };

    try {
      if (user.oldPassword && user.newPassword) {
        const record = await this.findById(id, true);
        if (!comparePass(user.oldPassword, record[0].password)) {
          throw new Error('Authentication failed.');
        }
        const salt = bcrypt.genSaltSync();
        const hash = bcrypt.hashSync(user.newPassword, salt);
        query.password = hash;
      }
    } catch (err) {
      throw new ForbiddenError('Failed to update user: ', err);
    }

    return this._db
      .table('users')
      .update(query)
      .where({ id: parseInt(id) });
  }

  async delete(id) {
    return this._db
      .table('users')
      .del()
      .where({ id: parseInt(id) })
      .returning('*');
  }

  async find({
    start: start = 0,
    end: end,
    asc: asc = true,
    sort_by: sort_by = 'users.id',
    from: from,
    to: to,
    library: library,
    group: group,
  }) {
    const rows = await this._db
      .select({
        id: 'users.id',
        username: 'users.username',
        firstName: 'users.firstName',
        lastName: 'users.lastName',
        location: 'libraries.id',
        location_name: 'libraries.name',
        location_address: 'libraries.physical_address',
        role: 'groups.id',
        role_name: 'groups.name',
        email: 'users.email',
        phone: 'users.phone',
        extension: 'users.extension',
        isActive: 'users.isActive',
      })
      .from('users')
      .leftJoin('library_users', 'users.id', 'library_users.uid')
      .leftJoin('libraries', 'libraries.id', 'library_users.lid')
      .leftJoin('user_groups', 'users.id', 'user_groups.uid')
      .leftJoin('groups', 'groups.id', 'user_groups.gid')
      .modify(queryBuilder => {
        if (from) {
          queryBuilder.where('created_at', '>', from);
        }

        if (to) {
          queryBuilder.where('created_at', '<', to);
        }

        if (library) {
          queryBuilder.where('libraries.id', '=', library);
        }

        if (group) {
          queryBuilder.where('role', '=', group);
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

  /**
   * Find user by Id
   *
   * @param {integer} id - Find user by id
   */
  async findById(id, privileged = false) {
    if (privileged) {
      return this._db
        .select({
          id: 'users.id',
          username: 'users.username',
          password: 'users.password',
          firstName: 'users.firstName',
          lastName: 'users.lastName',
          location: 'libraries.id',
          location_name: 'libraries.name',
          location_address: 'libraries.physical_address',
          role: 'groups.id',
          role_name: 'groups.name',
          email: 'users.email',
          phone: 'users.phone',
          extension: 'users.extension',
          isActive: 'users.isActive',
        })
        .from('users')
        .leftJoin('library_users', 'users.id', 'library_users.uid')
        .leftJoin('libraries', 'libraries.id', 'library_users.lid')
        .leftJoin('user_groups', 'users.id', 'user_groups.uid')
        .leftJoin('groups', 'groups.id', 'user_groups.gid')
        .where({ 'users.id': parseInt(id) });
    } else {
      return this._db
        .select({
          id: 'users.id',
          username: 'users.username',
          firstName: 'users.firstName',
          lastName: 'users.lastName',
          location: 'libraries.id',
          location_name: 'libraries.name',
          location_address: 'libraries.physical_address',
          role: 'groups.id',
          role_name: 'groups.name',
          email: 'users.email',
          phone: 'users.phone',
          extension: 'users.extension',
          isActive: 'users.isActive',
        })
        .from('users')
        .leftJoin('library_users', 'users.id', 'library_users.uid')
        .leftJoin('libraries', 'libraries.id', 'library_users.lid')
        .leftJoin('user_groups', 'users.id', 'user_groups.uid')
        .leftJoin('groups', 'groups.id', 'user_groups.gid')
        .where({ 'users.id': parseInt(id) });
    }
  }

  /**
   * Find user by Id
   *
   * @param {integer} id - Find user by id
   */
  async findByUsername(username, privileged = false) {
    if (privileged) {
      return this._db
        .select({
          id: 'users.id',
          username: 'users.username',
          password: 'users.password',
          firstName: 'users.firstName',
          lastName: 'users.lastName',
          location: 'libraries.id',
          location_name: 'libraries.name',
          location_address: 'libraries.physical_address',
          role: 'groups.id',
          role_name: 'groups.name',
          email: 'users.email',
          phone: 'users.phone',
          extension: 'users.extension',
          isActive: 'users.isActive',
        })
        .from('users')
        .leftJoin('library_users', 'users.id', 'library_users.uid')
        .leftJoin('libraries', 'libraries.id', 'library_users.lid')
        .leftJoin('user_groups', 'users.id', 'user_groups.uid')
        .leftJoin('groups', 'groups.id', 'user_groups.gid')
        .where({ 'users.username': username })
        .first();
    } else {
      return this._db
        .select({
          id: 'users.id',
          username: 'users.username',
          firstName: 'users.firstName',
          lastName: 'users.lastName',
          location: 'libraries.id',
          location_name: 'libraries.name',
          location_address: 'libraries.physical_address',
          role: 'groups.id',
          role_name: 'groups.name',
          email: 'users.email',
          phone: 'users.phone',
          extension: 'users.extension',
          isActive: 'users.isActive',
        })
        .from('users')
        .leftJoin('library_users', 'users.id', 'library_users.uid')
        .leftJoin('libraries', 'libraries.id', 'library_users.lid')
        .leftJoin('user_groups', 'users.id', 'user_groups.uid')
        .leftJoin('groups', 'groups.id', 'user_groups.gid')
        .where({ 'users.username': username })
        .first();
    }
  }

  /**
   * Find user by username
   *
   * @param {integer} username - Find user by username
   */
  async findAll() {
    return this._db.table('users').select('*');
  }

  async addToLibrary(lid, id) {
    return await this._db.transaction(async trx => {
      let lids = [];
      lids = await trx('libraries')
        .select()
        .where({ id: parseInt(lid) });

      if (lids.length === 0) {
        throw new BadRequestError('Invalid library ID.');
      }

      let ids = [];
      ids = await trx('users')
        .select()
        .where({ id: parseInt(id) });

      if (ids.length === 0) {
        throw new BadRequestError('Invalid user ID.');
      }
      await trx('library_users')
        .del()
        .where({ uid: parseInt(id) });

      await trx('library_users').insert({ lid: lid, uid: id });
    });
  }

  async removeFromLibrary(lid, id) {
    return this._db
      .table('library_users')
      .del()
      .where({ lid: parseInt(lid) })
      .andWhere({ uid: parseInt(id) })
      .returning('*');
  }
}
