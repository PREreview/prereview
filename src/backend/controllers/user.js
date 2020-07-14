import bcrypt from 'bcryptjs';
import Router from '@koa/router';
import moment from 'moment';
import Joi from '@hapi/joi';
import passport from 'koa-passport';
import { Strategy as LocalStrategy } from 'passport-local';
import { getLogger } from '../log.js';
import { BadRequestError } from '../../common/errors.js';
import _ from 'lodash/core';

const log = getLogger('backend:controllers:user');

function comparePass(userPassword, databasePassword) {
  return bcrypt.compareSync(userPassword, databasePassword);
}

const query_schema = Joi.object({
  start: Joi.number()
    .integer()
    .greater(-1),
  end: Joi.number()
    .integer()
    .positive(),
  asc: Joi.boolean(),
  sort_by: Joi.string(),
  from: Joi.string(),
  to: Joi.string(),
  library: Joi.number()
    .integer()
    .positive(),
  group: Joi.number()
    .integer()
    .positive(),
});

async function validate_query(query) {
  try {
    const value = await query_schema.validateAsync(query);
    return value;
  } catch (err) {
    throw new BadRequestError('Unable to validate query: ', err);
  }
}

/**
 * Initialize the user auth controller
 *
 * @param {Object} users - User model
 * @returns {Object} Auth controller Koa router
 */
export default function controller(users, thisUser) {
  const router = new Router();

  /**
   * Serialize user
   *
   * @param {Object} user - User info
   * @param {function} done - 'Done' callback
   */
  passport.serializeUser((user, done) => {
    done(null, user.id);
  });

  /**
   * Deserialize user from session
   *
   * @param {integer} id - User id
   * @param {function} done - 'Done' callback
   */
  passport.deserializeUser(async (id, done) => {
    try {
      const user = await users.findById(id);
      done(null, user);
    } catch (err) {
      done(err);
    }
  });

  /**
   * Initialize passport strategy
   *
   * @param {string} username - Username
   * @param {string} password - Password
   * @param {function} done - 'Done' callback
   */
  passport.use(
    new LocalStrategy(async (username, password, done) => {
      try {
        const user = await users.findByUsername(username, true);
        if (!comparePass(password, user.password)) {
          done(null, false);
        } else {
          done(null, user);
        }
      } catch (err) {
        done(err);
      }
    }),
  );

  /**
   * Login user.
   *
   * @param {Object} ctx - Koa context object
   */
  router.post('/login', async ctx => {
    return passport.authenticate('local', (err, user) => {
      if (!user) {
        ctx.body = { success: false };
        ctx.throw(401, 'Authentication failed.');
      } else {
        ctx.state.user = user;
        if (ctx.request.body.remember === 'true') {
          ctx.session.maxAge = 86400000; // 1 day
        } else {
          ctx.session.maxAge = 'session';
        }
        ctx.cookies.set('mv_user', user.username, { httpOnly: false });
        ctx.body = {
          success: true,
          user: user,
        };
        return ctx.login(user);
      }
    })(ctx);
  });

  /**
   * Logout user.
   *
   * @param {Object} ctx - Koa context object
   */
  router.get('/logout', async ctx => {
    if (ctx.isAuthenticated()) {
      ctx.logout();
      ctx.session = null;
      ctx.cookies.set('mv_user', null);
      ctx.redirect('/');
    } else {
      ctx.body = { success: false };
      ctx.throw(401, 'Logout failed.');
    }
  });

  /**
   * Authentication required
   *
   * @param {Object} auth - Authentication middleware
   * @param {Object} ctx - Koa context object
   */
  router.get(
    '/authenticated',
    thisUser.can('access private pages'),
    async ctx => {
      ctx.body = { msg: 'Authenticated', user: ctx.state.user.id };
    },
  );

  router.post('/users', thisUser.can('access admin pages'), async ctx => {
    log.debug('Adding new user.');
    let user, lid;

    if (ctx.params.lid) {
      lid = ctx.params.lid;
    }

    try {
      user = await users.create(ctx.request.body.data, lid);

      // workaround for sqlite
      if (Number.isInteger(user)) {
        user = await users.findById(user);
      }
    } catch (err) {
      log.error('HTTP 400 Error: ', err);
      ctx.throw(400, `Failed to parse user schema: ${err}`);
    }

    ctx.response.body = { statusCode: 201, status: 'created', data: user };
    ctx.response.status = 201;
  });

  router.get('/users', thisUser.can('view this library'), async ctx => {
    log.debug(`Retrieving users.`);
    let res;

    try {
      const query = await validate_query(ctx.query);
      let from, to;
      if (query.from) {
        const timestamp = moment(query.from);
        if (timestamp.isValid()) {
          log.error('HTTP 400 Error: Invalid timestamp value.');
          ctx.throw(400, 'Invalid timestamp value.');
        }
        from = timestamp.toISOString();
      }
      if (query.to) {
        const timestamp = moment(query.to);
        if (timestamp.isValid()) {
          log.error('HTTP 400 Error: Invalid timestamp value.');
          ctx.throw(400, 'Invalid timestamp value.');
        }
        to = timestamp.toISOString();
      }
      res = await users.find({
        start: query.start,
        end: query.end,
        asc: query.asc,
        sort_by: query.sort_by,
        from: from,
        to: to,
        library: ctx.params.lid,
        group: query.group,
      });
      ctx.response.body = {
        statusCode: 200,
        status: 'ok',
        data: res,
      };
      ctx.response.status = 200;
    } catch (err) {
      log.error('HTTP 400 Error: ', err);
      ctx.throw(400, `Failed to parse query: ${err}`);
    }
  });

  router.get('/users/:id', thisUser.can('access private pages'), async ctx => {
    log.debug(`Retrieving user ${ctx.params.id}.`);
    let user;

    try {
      if (!Number.isInteger(parseInt(ctx.params.id))) {
        user = await users.findByUsername(ctx.params.id);
      } else {
        user = await users.findById(ctx.params.id);
      }
    } catch (err) {
      ctx.throw(400, `Failed to parse query: ${err}`);
    }

    if (!_.isEmpty(user)) {
      ctx.response.body = { statusCode: 200, status: 'ok', data: [user] };
      ctx.response.status = 200;
    } else {
      log.error(
        `HTTP 404 Error: That user with ID ${ctx.params.id} does not exist.`,
      );
      ctx.throw(404, `That user with ID ${ctx.params.id} does not exist.`);
    }
  });

  router.put('/users/:id', thisUser.can('access private pages'), async ctx => {
    log.debug(`Updating user ${ctx.params.id}.`);
    let user;

    try {
      if (ctx.params.lid) {
        if (!thisUser.isMemberOf('admins', ctx.state.user[0].id)) {
          ctx.throw(403, 'Access denied.');
        }
        user = await users.addToLibrary(ctx.params.lid, ctx.params.id);
      } else {
        const id = parseInt(ctx.params.id);
        if (id === ctx.state.user[0].id) {
          user = await users.updateSelf(ctx.params.id, ctx.request.body.data);
        } else if (thisUser.isMemberOf('admins', ctx.state.user[0].id)) {
          user = await users.update(ctx.params.id, ctx.request.body.data);
        } else {
          ctx.throw(403, 'Access denied.');
        }
      }

      // workaround for sqlite
      if (Number.isInteger(user)) {
        user = await users.findById(ctx.params.id);
      }
    } catch (err) {
      log.error('HTTP 400 Error: ', err);
      ctx.throw(400, `Failed to parse query: ${err}`);
    }

    if (user && user.length) {
      ctx.response.body = { statusCode: 200, status: 'ok', data: user };
      ctx.response.status = 200;
    } else {
      log.error(
        `HTTP 404 Error: That user with ID ${ctx.params.id} does not exist.`,
      );
      ctx.throw(404, `That user with ID ${ctx.params.id} does not exist.`);
    }
  });

  router.delete('/users/:id', thisUser.can('access admin pages'), async ctx => {
    log.debug(`Deleting user ${ctx.params.id}.`);
    let user;

    try {
      if (ctx.params.lid) {
        user = await users.removeFromLibrary(ctx.params.lid, ctx.params.id);
      } else {
        user = await users.delete(ctx.params.id);
      }
    } catch (err) {
      log.error('HTTP 400 Error: ', err);
      ctx.throw(400, `Failed to parse query: ${err}`);
    }

    if (user.length) {
      ctx.response.body = { statusCode: 200, status: 'ok', data: user };
      ctx.response.status = 200;
    } else {
      log.error(
        `HTTP 404 Error: That user with ID ${ctx.params.id} does not exist.`,
      );
      ctx.throw(404, `That user with ID ${ctx.params.id} does not exist.`);
    }
  });

  return router;
}
