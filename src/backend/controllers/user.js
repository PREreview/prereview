import router from 'koa-joi-router';
import { getLogger } from '../log.js';

const log = getLogger('backend:controllers:user');
const Joi = router.Joi;

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
  library: Joi.number()
    .integer()
    .positive(),
  group: Joi.number()
    .integer()
    .positive(),
});

/**
 * Initialize the user auth controller
 *
 * @param {Object} users - User model
 * @returns {Object} Auth controller Koa router
 */
export default function controller(users, thisUser) {
  const userRouter = router();

  userRouter.route({
    method: 'get',
    path: '/users',
    pre: thisUser.can('access private pages'),
    validate: {
      query: querySchema,
    },
    handler: async ctx => {
      log.debug(`Retrieving users.`);
      const users = await users.findAll();
      ctx.body = {
        data: users,
      };
    },
  });

  userRouter.route({
    method: 'get',
    path: '/users/:id',
    pre: thisUser.can('access private pages'),
    validate: {
      params: Joi.object({
        id: Joi.integer(),
      }),
      continueOnError: false,
      failure: 400,
    },
    handler: async ctx => {
      log.debug(`Retrieving user ${ctx.params.id}.`);

      const user = await users.findOne(ctx.params.id);

      if (user) {
        ctx.status = 200;
        ctx.body = {
          data: user,
        };
      } else {
        ctx.throw(404, `That user with ID ${ctx.params.id} does not exist.`);
      }
    },
  });

  userRouter.route({
    method: 'put',
    path: '/users/:id',
    validate: {
      body: Joi.object({
        name: Joi.string(),
        email: Joi.string(),
      }),
      type: 'json',
      params: Joi.object({
        id: Joi.integer(),
      }),
      continueOnError: false,
      false: 400,
    },
    pre: thisUser.can('access private pages'), // TODO: can edit self only no?
    handler: async ctx => {
      log.debug(`Updating user ${ctx.params.id}.`);

      const user = await users.findOne(ctx.params.id);

      if (!user) {
        ctx.throw(404, `That user with ID ${ctx.params.id} does not exist.`);
      }

      users.assign(user, ctx.request.body);
      await users.persistAndFlush(user);
    },
  });

  userRouter.route({
    method: 'delete',
    path: '/users/:id',
    validate: {
      params: Joi.object({
        id: Joi.integer(),
      }),
    },
    pre: thisUser.can('access admin pages'), // TODO: can users delete their own account?
    handler: async ctx => {
      log.debug(`Deleting user ${ctx.params.id}.`);

      const user = users.remove(ctx.params.id);
      await users.persistAndFlush(user);
    },
  });

  return userRouter;
}
