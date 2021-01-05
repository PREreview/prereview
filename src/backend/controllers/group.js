import router from 'koa-joi-router';
// import moment from 'moment';
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
  // query: querySchema,
  type: 'json',
  continueOnError: true,
};

const handleInvalid = ctx => {
  log.debug('Validation error!');
  log.error(ctx.invalid);
  ctx.status = 400;
  ctx.message = getErrorMessages(ctx.invalid);
};

/**
 * Initialize the group auth controller
 *
 * @param {Object} groups - User model
 * @returns {Object} Auth controller Koa router
 */

// eslint-disable-next-line no-unused-vars
export default function controller(groupModel, thisUser) {
  const groupsRouter = router();

  groupsRouter.route({
    meta: {
      swagger: {
        operationId: 'PostGroups',
        summary:
          'Endpoint to POST a new user group (where each group have varying levels of authorizations) to PREreview. Admin users only.',
      },
    },
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
    pre: (ctx, next) => thisUser.can('access private pages')(ctx, next),
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
        res = await groupModel.findAll(['members']);

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
        operationId: 'GetGroups',
        summary:
          'Endpoint to GET user groups on PREreview. Different user groups have varying authorization levels of access to API methods.',
      },
    },
  });

  groupsRouter.route({
    method: 'GET',
    path: '/groups/:name',
    // validate: validationSchema,
    pre: (ctx, next) => thisUser.can('access private pages')(ctx, next),
    handler: async ctx => {
      if (ctx.invalid) {
        handleInvalid(ctx);
        return;
      }

      const groupName = ctx.params.name;

      log.debug(`Retrieving group ${groupName}.`);
      let group;

      try {
        group = await groupModel.find({ name: groupName }, ['members']);
        if (!group) {
          ctx.throw(404, `Group with ID ${ctx.params.id} doesn't exist`);
        }
      } catch (err) {
        log.error('HTTP 400 Error: ', err);
        ctx.throw(400, `Failed to parse query: ${err}`);
      }

      ctx.body = {
        status: 200,
        message: 'ok',
        data: group,
      };
      ctx.status = 200;
    },
    meta: {
      swagger: {
        operationId: 'GetGroup',
        summary:
          'Endpoint to GET one user group by ID from PREreview. Admin users only.',
        required: true,
      },
    },
  });

  groupsRouter.route({
    method: 'PUT',
    path: '/groups/:name',
    validate: validationSchema,
    pre: (ctx, next) => thisUser.can('access admin pages')(ctx, next),
    handler: async ctx => {
      if (ctx.invalid) {
        handleInvalid(ctx);
        return;
      }

      log.debug(`Updating group ${ctx.params.name}.`);
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
    meta: {
      swagger: {
        operationId: 'PutGroup',
        summary:
          'Endpoint to PUT one user group by ID from PREreview. Admin users only.',
        required: true,
      },
    },
  });

  groupsRouter.route({
    method: 'DELETE',
    path: '/groups/:id',
    pre: (ctx, next) => thisUser.can('access admin pages')(ctx, next),
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
    meta: {
      swagger: {
        operationId: 'DeleteGroup',
        summary:
          'Endpoint to DELETE one user group by ID from PREreview. Admin users only.',
        required: true,
      },
    },
  });

  // groupsRouter.route({
  //   method: 'put',
  //   path: '/groups/:id/members/:uid',
  //   validate: {
  //     body: {
  //       username: Joi.string(),
  //       password: Joi.string(),
  //       id: Joi.number(),
  //       firstName: Joi.string(),
  //       lastName: Joi.string(),
  //       email: Joi.string(),
  //       role: Joi.number(),
  //     },
  //     type: 'json',
  //   },
  //   pre: async (ctx, next) => {
  //     await thisUser.can('access admin pages');
  //     return next();
  //   },
  //   handler: async ctx => {
  //     log.debug(`Adding user ${ctx.params.uid} to group ${ctx.params.id}.`);
  //     let res;

  //     try {
  //       res = await groupModel.memberAdd(ctx.params.id, ctx.params.uid);
  //     } catch (err) {
  //       log.error('HTTP 400 Error: ', err);
  //       ctx.throw(400, `Failed to parse query: ${err}`);
  //     }

  //     if (res) {
  //       ctx.response.body = { statusCode: 201, status: 'created', data: res };
  //       ctx.response.status = 201;
  //     } else {
  //       log.error(
  //         `HTTP 404 Error: That mapping with gid ${ctx.params.id} and uid ${
  //           ctx.params.uid
  //         } does not exist.`,
  //       );
  //       ctx.throw(
  //         404,
  //         `That mapping with gid ${ctx.params.id} and uid ${
  //           ctx.params.uid
  //         } does not exist.`,
  //       );
  //     }
  //   },
  //  meta: {
  //    swagger: {
  //      operationId: 'GetGroupMember',
  //      summary:
  //        'Endpoint to GET one user from a group by ID from PREreview. Admin users only.',
  //      required: true,
  //    },
  //  },
  // });

  // groupsRouter.route({
  //   method: 'delete',
  //   path: '/groups/:id/members/:uid',
  //   pre: async (ctx, next) => {
  //     await thisUser.can('access admin pages');
  //     return next();
  //   },
  //   handler: async ctx => {
  //     log.debug(`Removing user ${ctx.params.uid} from group ${ctx.params.id}.`);
  //     let res;

  //     try {
  //       res = await groupModel.memberRemove(ctx.params.id, ctx.params.uid);
  //     } catch (err) {
  //       log.error('HTTP 400 Error: ', err);
  //       ctx.throw(400, `Failed to parse query: ${err}`);
  //     }

  //     if (res) {
  //       ctx.response.body = { statusCode: 200, status: 'ok', data: res };
  //       ctx.response.status = 200;
  //     } else {
  //       log.error(
  //         `HTTP 404 Error: That mapping with gid ${ctx.params.id} and uid ${
  //           ctx.params.uid
  //         } does not exist.`,
  //       );
  //       ctx.throw(
  //         404,
  //         `That mapping with gid ${ctx.params.id} and uid ${
  //           ctx.params.uid
  //         } does not exist.`,
  //       );
  //     }
  //   },
  //  meta: {
  //    swagger: {
  //      operationId: 'DeleteGroupMember',
  //      summary:
  //        'Endpoint to DELETE one user from a group by ID from PREreview. Admin users only.',
  //      required: true,
  //    },
  //  },
  // });

  return groupsRouter;
}
