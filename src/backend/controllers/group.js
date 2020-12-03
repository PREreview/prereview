import router from 'koa-joi-router';
import moment from 'moment';
import { getLogger } from '../log.js';
import { getErrorMessages } from '../utils/errors.js';

const Joi = router.Joi;
const log = getLogger('backend:controllers:group');

const querySchema = Joi.object({
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
});

const groupSchema = Joi.object({
  name: Joi.string().required(),
});

const validationSchema = {
  body: groupSchema,
  query: querySchema,
  type: 'json',
  continueOnError: true,
};

const handleInvalid = ctx => {
  log.debug('Validation error!');
  log.error(ctx.invalid);
  ctx.status = 400;
  ctx.message = getErrorMessages(ctx.invalid);
};

// eslint-disable-next-line no-unused-vars
export default function controller(groupModel, thisUser) {
  const groupsRouter = router();

  groupsRouter.route({
    method: 'POST',
    path: '/groups',
    pre: (ctx, next) => thisUser.can('access admin pages')(ctx, next),
    validate: validationSchema,
    handler: async ctx => {
      if (ctx.invalid) {
        handleInvalid(ctx);
        return;
      }
      log.debug('Adding new group.');
      let group;

      try {
        group = groupModel.create(ctx.request.body);
        await groupModel.persistAndFlush(group);
      } catch (err) {
        log.error('HTTP 400 Error: ', err);
        ctx.throw(400, `Failed to parse group schema: ${err}`);
      }
      ctx.body = { status: 201, message: 'created', data: [group] };
      ctx.status = 201;
    },
  });

  groupsRouter.route({
    method: 'GET',
    path: '/groups',
    pre: (ctx, next) => thisUser.can('access admin pages')(ctx, next),
    validate: {
      query: querySchema,
    },
    handler: async ctx => {
      if (ctx.invalid) {
        handleInvalid(ctx);
        return;
      }
      log.debug(`Retrieving groups.`);
      let res;

      try {
        const query = ctx.query;
        let from, to;
        if (ctx.query.from) {
          const timestamp = moment(ctx.query.from);
          if (timestamp.isValid()) {
            log.error('HTTP 400 Error: Invalid timestamp value.');
            ctx.throw(400, 'Invalid timestamp value.');
          }
          from = timestamp.toISOString();
        }
        if (ctx.query.to) {
          const timestamp = moment(ctx.query.to);
          if (timestamp.isValid()) {
            log.error('HTTP 400 Error: Invalid timestamp value.');
            ctx.throw(400, 'Invalid timestamp value.');
          }
          to = timestamp.toISOString();
        }
        res = await groupModel.findAll({
          start: query.start,
          end: query.end,
          asc: query.asc,
          sort_by: query.sort_by,
          from: from,
          to: to,
        });
        ctx.body = {
          status: 200,
          message: 'ok',
          data: res,
        };
        ctx.status = 200;
      } catch (err) {
        ctx.throw(400, `Failed to parse query: ${err}`);
      }
    },
    meta: {
      swagger: {
        summary:
          'Endpoint to GET user groups on PREreview. Different user groups have varying authorization levels of access to API methods.',
      },
    },
  });

  // groupsRouter.get(
  //   '/groups/:id',
  //   validation(),
  //   // thisUser.can('access private pages'),
  //   async ctx => {
  //     log.debug(`Retrieving group ${ctx.params.id}.`);
  //     let group;

  //     try {
  //       group = await groupModel.findOne(ctx.params.id, ['members']);
  //       if (!group) {
  //         ctx.throw(404, `Group with ID ${ctx.params.id} doesn't exist`);
  //       }
  //     } catch (err) {
  //       log.error('HTTP 400 Error: ', err);
  //       ctx.throw(400, `Failed to parse query: ${err}`);
  //     }

  //     ctx.body = {
  //       status: 200,
  //       message: 'ok',
  //       data: [group],
  //     };
  //     ctx.status = 200;
  //   },
  // );

  groupsRouter.route({
    method: 'put',
    path: '/groups/:id',
    validate: {
      body: groupSchema,
      type: 'json',
    },
    pre: async (ctx, next) => {
      await thisUser.can('access admin pages');
      return next();
    },
    handler: async ctx => {
      log.debug(`Updating group ${ctx.params.id}.`);
      let group;

      try {
        group = await groupModel.findOne(ctx.params.id);
        if (!group) {
          ctx.throw(404, `Group with ID ${ctx.params.id} doesn't exist`);
        }
        groupModel.assign(group, ctx.request.body);
        await groupModel.persistAndFlush(group);
      } catch (err) {
        log.error('HTTP 400 Error: ', err);
        ctx.throw(400, `Failed to parse query: ${err}`);
      }

      // success
      ctx.status = 204;
    },
  });

  groupsRouter.route({
    method: 'DELETE',
    path: '/groups/:id',
    // pre: async () => {
    //   await thisUser.can('access admin pages');
    //   return next();
    // },
    handler: async ctx => {
      log.debug(`Deleting group ${ctx.params.id}.`);
      let group;

      try {
        group = await groupModel.findOne(ctx.params.id);
        if (!group) {
          ctx.throw(404, `Group with ID ${ctx.params.id} doesn't exist`);
        }
        await groupModel.removeAndFlush(group);
      } catch (err) {
        log.error('HTTP 400 Error: ', err);
        ctx.throw(400, `Failed to parse query: ${err}`);
      }

      ctx.status = 204;
    },
  });

  groupsRouter.route({
    method: 'put',
    path: '/groups/:id/members/:uid',
    validate: {
      body: {
        username: Joi.string(),
        password: Joi.string(),
        id: Joi.number(),
        firstName: Joi.string(),
        lastName: Joi.string(),
        email: Joi.string(),
        role: Joi.number(),
      },
      type: 'json',
    },
    pre: async (ctx, next) => {
      await thisUser.can('access admin pages');
      return next();
    },
    handler: async ctx => {
      log.debug(`Adding user ${ctx.params.uid} to group ${ctx.params.id}.`);
      let res;

      try {
        res = await groupModel.memberAdd(ctx.params.id, ctx.params.uid);
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

  groupsRouter.route({
    method: 'delete',
    path: '/groups/:id/members/:uid',
    pre: async (ctx, next) => {
      await thisUser.can('access admin pages');
      return next();
    },
    handler: async ctx => {
      log.debug(`Removing user ${ctx.params.uid} from group ${ctx.params.id}.`);
      let res;

      try {
        res = await groupModel.memberRemove(ctx.params.id, ctx.params.uid);
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

  return groupsRouter;
}
