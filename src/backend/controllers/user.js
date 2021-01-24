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
export default function controller(users, contacts, thisUser) {
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
    validate: {
      params: {
        id: Joi.alternatives()
          .try(Joi.number().integer(), Joi.string())
          .description('User id')
          .required(),
        // params: {
        //   id: Joi.string()
        //     .description('User id')
        //     .required(),      },
      },
      continueOnError: false,
      failure: 400,
    },
    handler: async ctx => {
      log.debug(`Retrieving user ${ctx.params.id}`);

      let user;
      try {
        user = await users.findOneByIdOrOrcid(ctx.params.id, [
          'personas',
          'personas.fullReviews',
          'personas.rapidReviews',
          'personas.requests',
          'groups',
          'contacts',
          'defaultPersona',
        ]);
      } catch (err) {
        log.debug(err);
        ctx.throw(400, err);
      }

      if (user) {
        let isAdmin = false;
        if (await thisUser.isMemberOf('admins', user.orcid)) {
          log.debug(`User ${user.orcid} is an administrator!`);
          isAdmin = true;
        }

        let isModerator = false;
        if (await thisUser.isMemberOf('moderators', user.orcid)) {
          log.debug(`User ${user.orcid} is a moderator!`);
          isModerator = true;
        }

        ctx.status = 200;
        ctx.body = {
          status: '200',
          message: 'ok',
          data: { ...user, isAdmin: isAdmin, isModerator: isModerator },
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
      },
    },
    method: 'put',
    path: '/users/:id',
    validate: {
      // body: Joi.object({
      //   name: Joi.string(),
      //   email: Joi.string(),
      // }),
      // type: 'json',
      params: {
        id: Joi.alternatives()
          .try(Joi.number().integer(), Joi.string())
          .description('User id')
          .required(),
      },
      // params: {
      //   id: Joi.string()
      //     .description('User id')
      //     .required(),
      // },
      continueOnError: false,
      false: 400,
    },
    // pre:thisUserthisUser.can('access private pages'), // TODO: can edit self only no?
    handler: async ctx => {
      log.debug(`Updating user ${ctx.params.id}.`);

      let user;
      try {
        user = await users.findOneByIdOrOrcid(ctx.params.id, [
          'personas',
          'groups',
          'contacts',
        ]);
      } catch (err) {
        ctx.throw(400, err);
      }

      if (!user) {
        ctx.throw(404, `That user with ID ${ctx.params.id} does not exist.`);
      }

      users.assign(user, ctx.request.body);
      await users.persistAndFlush(user);

      ctx.status = 204;
      ctx.body = {
        data: user,
      };
    },
  });

  userRouter.route({
    meta: {
      swagger: {
        operationId: 'PutUserContacts',
        summary: 'Endpoint to PUT contacts for a single user.',
      },
    },
    method: 'put',
    path: '/users/:id/contacts',
    // validate: {    },
    // pre: {},
    handler: async ctx => {
      let userId = ctx.params.id;
      let newContact;
      log.debug(`Adding a new contact email to user ${userId}`);

      try {
        log.debug(`Create a new email entry.`);
        newContact = contacts.create(ctx.request.body);
        await contacts.persistAndFlush(newContact);
      } catch (err) {
        log.error('HTTP 400 Error: ', err);
        ctx.throw(400, `Failed to parse contact schema: ${err}`);
      }

      ctx.status = 200;
      ctx.body = {
        status: 200,
        message: 'created',
        data: newContact,
      };
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
    method: 'DELETE',
    path: '/users/:id',
    validate: {
      params: {
        id: Joi.alternatives()
          .try(Joi.number().integer(), Joi.string())
          .description('User id')
          .required(),
      },
      // params: {
      //   id: Joi.string()
      //     .description('User id')
      //     .required(),
      // },
    },
    pre: (ctx, next) => thisUser.can('access admin pages')(ctx, next), // TODO: can users delete their own account?
    handler: async ctx => {
      log.debug(`Deleting user ${ctx.params.id}.`);

      let toDelete;

      try {
        toDelete = await users.findOne(ctx.params.id);
        if (!toDelete) {
          ctx.throw(404, `User with ID ${ctx.params.id} doesn't exist`);
        }
        await users.removeAndFlush(toDelete);
      } catch (err) {
        log.error('HTTP 400 Error: ', err);
        ctx.throw(400, `Failed to parse request schema: ${err}`);
      }
      // if deleted
      ctx.status = 204;
    },
  });

  return userRouter;
}
