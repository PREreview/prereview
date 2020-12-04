import router from 'koa-joi-router';
import { getLogger } from '../log.js';

const log = getLogger('backend:controllers:user');
const Joi = router.Joi;

// eslint-disable-next-line no-unused-vars
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
  group: Joi.number()
    .integer()
    .positive(),
});

// eslint-disable-next-line no-unused-vars
export default function controller(users, thisUser) {
  const userRouter = router();

  userRouter.route({
    meta: {
      swagger: {
        operationId: 'GetUsers',
        summary: 'Endpoint to GET all users.',
      },
    },
    method: 'get',
    path: '/users',
    // pre:thisUserthisUser.can('access private pages'),
    handler: async ctx => {
      log.debug(`Retrieving users.`);
      let allUsers;

      try {
        allUsers = await users.findAll();
      } catch (err) {
        log.error('HTTP 400 Error: ', err);
        ctx.throw(400, `Failed to parse query: ${err}`);
      }

      ctx.body = {
        statusCode: 200,
        status: 'ok',
        data: allUsers,
      };
      ctx.response.status = 200;
    },
  });

  userRouter.route({
    meta: {
      swagger: {
        operationId: 'GetUser',
        summary: 'Endpoint to GET a single user by ID.',
        required: true,
      },
    },
    method: 'get',
    path: '/users/:id',
    // pre:thisUserthisUser.can('access private pages'),
    validate: {
      params: Joi.object({
        id: Joi.number().integer(), // TODO should we be validating this?
      }),
      continueOnError: false,
      failure: 400,
    },
    handler: async ctx => {
      log.debug(`Retrieving user ${ctx.params.id}`);

      const user = await users.findOne(ctx.params.id, ['personas', 'groups']);

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
    meta: {
      swagger: {
        operationId: 'PutUser',
        summary: 'Endpoint to PUT a single user by ID.',
        required: true,
      },
    },
    method: 'put',
    path: '/users/:id',
    validate: {
      body: Joi.object({
        name: Joi.string(),
        email: Joi.string(),
      }),
      type: 'json',
      params: Joi.object({
        id: Joi.number().integer(),
      }),
      continueOnError: false,
      false: 400,
    },
    // pre:thisUserthisUser.can('access private pages'), // TODO: can edit self only no?
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
    meta: {
      swagger: {
        operationId: 'DeleteUser',
        summary: 'Endpoint to DELETE a single user by ID.',
        required: true,
      },
    },
    method: 'delete',
    path: '/users/:id',
    validate: {
      params: Joi.object({
        id: Joi.number().integer(),
      }),
    },
    // pre:thisUserthisUser.can('access admin pages'), // TODO: can users delete their own account?
    handler: async ctx => {
      log.debug(`Deleting user ${ctx.params.id}.`);

      const user = users.remove(ctx.params.id);
      await users.persistAndFlush(user);
    },
  });

  return userRouter;
}
