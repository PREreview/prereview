import { v4 as uuidv4 } from 'uuid';
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
  group: Joi.string(),
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
    pre: thisUser.can('access admin pages'), // TODO: can users delete their own account?
    handler: async ctx => {
      log.debug(`Retrieving users.`);
      let allUsers;

      try {
        allUsers = await users.findAll(['defaultPersona']);
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
        id: Joi.string()
          .description('User id')
          .required(),
      },
      continueOnError: false,
      failure: 400,
    },
    pre: thisUser.can('edit this user'), // TODO: can users delete their own account?
    handler: async ctx => {
      log.debug(`Retrieving user ${ctx.params.id}`);

      let user;
      try {
        user = await users.findOneByUuidOrOrcid(ctx.params.id, [
          'personas',
          'personas.fullReviews',
          'personas.rapidReviews',
          'personas.requests',
          'groups',
          'contacts',
          'defaultPersona.badges',
        ]);
      } catch (err) {
        log.debug(err);
        ctx.throw(400, err);
      }

      let isAdmin,
        isModerator = false;
      if (user) {
        if (await thisUser.isMemberOf('admins', user.orcid)) {
          log.debug(`User ${user.orcid} is an administrator!`);
          isAdmin = true;
        }

        if (await thisUser.isMemberOf('moderators', user.orcid)) {
          log.debug(`User ${user.orcid} is a moderator!`);
          isModerator = true;
        }

        let avatar;
        if (
          user.defaultPersona.avatar &&
          Buffer.isBuffer(user.defaultPersona.avatar)
        ) {
          avatar = user.defaultPersona.avatar.toString();
        }
        ctx.status = 200;
        ctx.body = {
          status: '200',
          message: 'ok',
          data: {
            ...user,
            isAdmin: isAdmin,
            isModerator: isModerator,
            defaultPersona: { ...user.defaultPersona, avatar: avatar },
          },
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
      params: {
        id: Joi.string()
          .description('User id')
          .required(),
      },
      continueOnError: false,
      false: 400,
    },
    pre: thisUser.can('edit this user'), // TODO: can users delete their own account?
    handler: async ctx => {
      log.debug(`Updating user ${ctx.params.id}.`);

      let user;
      try {
        user = await users.findOneByUuidOrOrcid(ctx.params.id, [
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
        operationId: 'PostUserContacts',
        summary: 'Endpoint to POST new contacts for a single user.',
      },
    },
    method: 'POST',
    path: '/users/:id/contacts',
    validate: {
      params: {
        id: Joi.string()
          .description('User id')
          .required(),
      },
      body: Joi.object({
        schema: Joi.string(),
        value: Joi.string(),
      }),
      type: 'json',
    },
    pre: thisUser.can('edit this user'), // TODO: can users delete their own account?
    handler: async ctx => {
      log.debug(`Adding a new contact to user ${ctx.params.id}`);
      let newContact, user;
      try {
        user = await users.findOneByUuidOrOrcid(ctx.params.id);
      } catch (err) {
        log.error('HTTP 400 Error: ', err);
        ctx.throw(400, `Failed to parse contact schema: ${err}`);
      }
      if (!user) {
        ctx.throw(404, `That user with ID ${ctx.params.id} does not exist.`);
      }

      let conflict, schema, value;
      try {
        log.debug(`Create a new contact entry.`);
        ({ schema, value } = ctx.request.body);
        conflict = await contacts.findOne({ schema, value, identity: user });
      } catch (err) {
        log.error('HTTP 400 Error: ', err);
        ctx.throw(400, `Failed to parse contact schema: ${err}`);
      }

      if (conflict) {
        log.error(
          `HTTP 409 Error: Contact ${schema}:${value} already exists for user ${
            ctx.params.id
          }`,
        );
        ctx.throw(
          409,
          `Contact ${schema}:${value} already exists for user ${ctx.params.id}`,
        );
      }

      try {
        newContact = contacts.create({
          ...ctx.request.body,
          identity: user,
          isVerified: false,
          token: uuidv4(),
        });
        await contacts.persistAndFlush(newContact);
        await ctx.mail.send({
          template: 'verifyEmail',
          message: {
            to: newContact.value,
          },
          locals: {
            token: newContact.token,
          },
        });
      } catch (err) {
        log.error('HTTP 400 Error: ', err);
        ctx.throw(400, `Failed to parse contact schema: ${err}`);
      }

      ctx.status = 201;
      ctx.body = {
        status: 201,
        message: 'created',
        data: newContact,
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
    path: '/users/:id/contacts/:cid',
    validate: {
      params: {
        id: Joi.string()
          .description('User id')
          .required(),
        cid: Joi.string()
          .description('Contacts id')
          .required(),
      },
      body: Joi.object({
        schema: Joi.string().required(),
        value: Joi.string().required(),
        isNotified: Joi.boolean().required(),
      }),
      type: 'json',
    },
    // validate: {    },
    pre: thisUser.can('edit this user'), // TODO: can users delete their own account?
    handler: async ctx => {
      const contactId = ctx.params.cid;
      let newContact, user;
      log.debug(`Updating contact for user ${ctx.params.id}`);
      try {
        user = await users.findOneByUuidOrOrcid(ctx.params.id);
      } catch (err) {
        log.error('HTTP 400 Error: ', err);
        ctx.throw(400, `Failed to parse contact schema: ${err}`);
      }
      if (!user) {
        ctx.throw(404, `That user with ID ${ctx.params.id} does not exist.`);
      }
      try {
        const exists = await contacts.findOne({
          uuid: contactId,
          identity: user,
        });
        if (exists) {
          log.debug('Contact already exists, updating.');
          contacts.assign(exists, ctx.request.body);
          await contacts.persistAndFlush(exists);
          ctx.status = 200;
          ctx.body = {
            status: 200,
            message: 'ok',
            data: exists,
          };
        } else {
          log.debug('Contact does not yet exist, creating.');
          newContact = contacts.create({
            ...ctx.request.body,
            identity: user,
            token: uuidv4(),
          });
          await contacts.persistAndFlush(newContact);
          ctx.status = 201;
          ctx.body = {
            status: 201,
            message: 'created',
            data: newContact,
          };
        }
      } catch (err) {
        log.error('HTTP 400 Error: ', err);
        ctx.throw(400, `Failed to parse contact schema: ${err}`);
      }
    },
  });

  userRouter.route({
    meta: {
      swagger: {
        operationId: 'DeleteUserContacts',
        summary: 'Endpoint to PUT contacts for a single user.',
      },
    },
    method: 'DELETE',
    path: '/users/:id/contacts',
    validate: {
      params: {
        id: Joi.string()
          .description('User id')
          .required(),
      },
      query: {
        cid: Joi.string()
          .description('Contacts id')
          .required(),
      },
      type: 'json',
      continueOnError: true,
    },
    pre: thisUser.can('edit this user'), // TODO: can users delete their own account?
    handler: async ctx => {
      const contactId = ctx.query.cid;
      let user;
      log.debug(`Deleting contact for user ${ctx.params.id}`);
      try {
        user = await users.findOneByUuidOrOrcid(ctx.params.id);
      } catch (err) {
        log.error('HTTP 400 Error: ', err);
        ctx.throw(400, `Failed to parse contact schema: ${err}`);
      }
      if (!user) {
        ctx.throw(404, `That user with ID ${ctx.params.id} does not exist.`);
      }
      try {
        const exists = await contacts.findOne({
          uuid: contactId,
          identity: user,
        });
        if (exists) {
          log.debug('Deleting contact.');
          await contacts.removeAndFlush(exists);
          ctx.status = 200;
          ctx.body = {
            status: 200,
            message: 'ok',
            data: exists,
          };
        } else {
          log.error('Contact does not exist.');
          ctx.throw(
            404,
            `That contact ${ctx.query.cid} for user with ID ${
              ctx.params.id
            } does not exist.`,
          );
        }
      } catch (err) {
        log.error('HTTP 400 Error: ', err);
        ctx.throw(400, `Failed to parse contact schema: ${err}`);
      }
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
        id: Joi.string()
          .description('User id')
          .required(),
      },
    },
    pre: thisUser.can('access admin pages'), // TODO: can users delete their own account?
    handler: async ctx => {
      log.debug(`Deleting user ${ctx.params.id}.`);

      let toDelete;

      try {
        toDelete = await users.findOne({ uuid: ctx.params.id });
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

  userRouter.route({
    meta: {
      swagger: {
        operationId: 'GetValidateContact',
        summary: 'Endpoint to validate an email.',
        required: true,
      },
    },
    method: 'GET',
    path: '/valid-contacts/:token',
    validate: {
      params: {
        token: Joi.string()
          .description('Email validation token')
          .required(),
      },
    },
    pre: thisUser.can('access private pages'),
    handler: async ctx => {
      log.debug(`Validating contact w/ token ${ctx.params.token}.`);

      let contact;

      try {
        contact = await contacts.findOne({
          token: ctx.params.token,
          identity: ctx.state.user,
        });
        if (!contact) {
          log.error(
            `HTTP 404 Error: Contact with token ${
              ctx.params.token
            } doesn't exist`,
          );
          ctx.throw(
            404,
            `Contact with token ${ctx.params.token} doesn't exist`,
          );
        }
        if (contact.isVerified) {
          log.error(
            `HTTP 409 Error: Contact with token ${
              ctx.params.token
            } is already verified`,
          );
          ctx.throw(
            409,
            `Contact with token ${ctx.params.token} is already verified`,
          );
        }
        contact.isVerified = true;
        await contacts.persistAndFlush(contact);
      } catch (err) {
        log.error('HTTP 400 Error: ', err);
        ctx.throw(400, `Failed to retrieve contact: ${err}`);
      }
      // if verified
      ctx.status = 200;
      ctx.body = {
        status: 200,
        message: 'ok',
        data: { schema: contact.schema, value: contact.value },
      };
    },
  });

  return userRouter;
}
