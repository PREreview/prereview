import router from 'koa-joi-router';
import moment from 'moment';
import { getLogger } from '../log.js';
import { BadRequestError } from '../../common/errors.js';

const Joi = router.Joi;
const log = getLogger('backend:controllers:group');

async function validate_query(query) {
  try {
    const value = await query_schema.validateAsync(query);
    return value;
  } catch (err) {
    throw new BadRequestError('Unable to validate query: ', err);
  }
}

/**
 * Initialize the group auth controller
 *
 * @param {Object} groups - User model
 * @returns {Object} Auth controller Koa router
 */
// eslint-disable-next-line no-unused-vars
export default function controller(groups, thisUser) {
  const groupRoutes = router();

  groupRoutes.route({
    method: 'post',
    path: '/groups',
    // validate: {},
    pre: async ctx => {
      thisUser.can('access admin pages');
    },
    handler: async ctx => {
      log.debug('Adding new group.');
      let group;

      try {
        group = await groups.create(ctx.request.body.data);
        
      } catch (err) {
        log.error('HTTP 400 Error: ', err);
        ctx.throw(400, `Failed to parse group schema: ${err}`);
      }
      ctx.response.body = { statusCode: 201, status: 'created', data: group };
      ctx.response.status = 201;
    },
  });

  groupRoutes.route({
    method: 'get',
    path: '/groups',
    validate: {
      query: Joi.object({
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
      }),
    },
    pre: async ctx => {
      thisUser.can('access admin pages');
    },
    handler: async ctx => {
      log.debug(`Retrieving groups.`);
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
        res = await groups.find({
          start: query.start,
          end: query.end,
          asc: query.asc,
          sort_by: query.sort_by,
          from: from,
          to: to,
        });
        ctx.response.body = {
          statusCode: 200,
          status: 'ok',
          data: res,
        };
        ctx.response.status = 200;
      } catch (err) {
        ctx.throw(400, `Failed to parse query: ${err}`);
      }
    },
  });

  groupRoutes.route({
    method: 'get',
    path: '/groups/:id',
    pre: async ctx => {
      thisUser.can('access private pages');
    },
    handler: async ctx => {
      log.debug(`Retrieving group ${ctx.params.id}.`);
      let group;

      try {
        group = await groups.findById(ctx.params.id);
      } catch (err) {
        log.error('HTTP 400 Error: ', err);
        ctx.throw(400, `Failed to parse query: ${err}`);
      }

      if (group.length) {
        ctx.response.body = { statusCode: 200, status: 'ok', data: group };
        ctx.response.status = 200;
      } else {
        log.error(
          `HTTP 404 Error: That group with ID ${ctx.params.id} does not exist.`,
        );
        ctx.throw(404, `That group with ID ${ctx.params.id} does not exist.`);
      }
    },
  });

  groupRoutes.route({
    method: 'put',
    path: '/groups/:id',
    pre: async ctx => {
      thisUser.can('access admin pages');
    },
    handler: async ctx => {
      log.debug(`Updating group ${ctx.params.id}.`);
      let group;

      try {
        group = await groups.update(ctx.params.id, ctx.request.body.data);

        // workaround for sqlite
        if (Number.isInteger(group)) {
          group = await groups.findById(ctx.param.id);
        }
      } catch (err) {
        log.error('HTTP 400 Error: ', err);
        ctx.throw(400, `Failed to parse query: ${err}`);
      }

      if (group.length) {
        ctx.response.body = { statusCode: 200, status: 'ok', data: group };
        ctx.response.status = 200;
      } else {
        log.error(
          `HTTP 404 Error: That group with ID ${ctx.params.id} does not exist.`,
        );
        ctx.throw(404, `That group with ID ${ctx.params.id} does not exist.`);
      }
    },
  });

  groupRoutes.route({
    method: 'delete',
    path: '/groups/:id',
    pre: async ctx => {
      thisUser.can('access admin pages');
    },
    handler: async ctx => {
      log.debug(`Deleting group ${ctx.params.id}.`);
      let group;

      try {
        group = await groups.delete(ctx.params.id);
      } catch (err) {
        log.error('HTTP 400 Error: ', err);
        ctx.throw(400, `Failed to parse query: ${err}`);
      }

      if (group.length) {
        ctx.response.body = { statusCode: 200, status: 'ok', data: group };
        ctx.response.status = 200;
      } else {
        log.error(
          `HTTP 404 Error: That group with ID ${ctx.params.id} does not exist.`,
        );
        ctx.throw(404, `That group with ID ${ctx.params.id} does not exist.`);
      }
    },
  });

  groupRoutes.route({
    method: 'get',
    path: '/groups/:id/members',
    pre: async ctx => {
      thisUser.can('access admin pages');
    },
    handler: async ctx => {
      log.debug(`Retrieving members of group ${ctx.params.id}.`);
      let group;

      try {
        const query = await validate_query(ctx.query);
        group = await groups.members({
          gid: ctx.params.id,
          start: query.start,
          end: query.end,
          asc: query.asc,
        });
      } catch (err) {
        log.error('HTTP 400 Error: ', err);
        ctx.throw(400, `Failed to parse query: ${err}`);
      }

      if (group.length) {
        ctx.response.body = { statusCode: 200, status: 'ok', data: group };
        ctx.response.status = 200;
      } else {
        log.error(
          `HTTP 404 Error: That group with ID ${ctx.params.id} does not exist.`,
        );
        ctx.throw(404, `That group with ID ${ctx.params.id} does not exist.`);
      }
    },
  });

  groupRoutes.route({
    method: 'put',
    path: '/groups/:id/members/:uid',
    pre: async ctx => {
      thisUser.can('access admin pages');
    },
    handler: async ctx => {
      log.debug(`Adding user ${ctx.params.uid} to group ${ctx.params.id}.`);
      let res;

      try {
        res = await groups.memberAdd(ctx.params.id, ctx.params.uid);
      } catch (err) {
        log.error('HTTP 400 Error: ', err);
        ctx.throw(400, `Failed to parse query: ${err}`);
      }

      if (res) {
        ctx.response.body = { statusCode: 201, status: 'created', data: res };
        ctx.response.status = 201;
      } else {
        log.error(
          `HTTP 404 Error: That mapping with gid ${ctx.params.id} and uid ${
            ctx.params.uid
          } does not exist.`,
        );
        ctx.throw(
          404,
          `That mapping with gid ${ctx.params.id} and uid ${
            ctx.params.uid
          } does not exist.`,
        );
      }
    },
  });

  groupRoutes.route({
    method: 'delete',
    path: '/groups/:id/members/:uid',
    pre: async ctx => {
      thisUser.can('access admin pages');
    },
    handler: async ctx => {
      log.debug(`Removing user ${ctx.params.uid} from group ${ctx.params.id}.`);
      let res;

      try {
        res = await groups.memberRemove(ctx.params.id, ctx.params.uid);
      } catch (err) {
        log.error('HTTP 400 Error: ', err);
        ctx.throw(400, `Failed to parse query: ${err}`);
      }

      if (res) {
        ctx.response.body = { statusCode: 200, status: 'ok', data: res };
        ctx.response.status = 200;
      } else {
        log.error(
          `HTTP 404 Error: That mapping with gid ${ctx.params.id} and uid ${
            ctx.params.uid
          } does not exist.`,
        );
        ctx.throw(
          404,
          `That mapping with gid ${ctx.params.id} and uid ${
            ctx.params.uid
          } does not exist.`,
        );
      }
    },
  });

  return router;
}
