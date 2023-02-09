import { v4 as uuidv4 } from 'uuid';
import router from 'koa-joi-router';
import { isString } from 'lodash';
import { ORCID as orcidUtils } from 'orcid-utils';
import anonymus from 'anonymus';
import { Key } from '../models/entities/index.ts';
import { getLogger } from '../log.ts';

const log = getLogger('backend:controllers:user');
const Joi = router.Joi;

const ANON_TRIES_LIMIT = 5;

export default function controller(users, personas, contacts, keys, thisUser) {
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
          'groups',
          'contacts',
          'keys',
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
          user.defaultPersona &&
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
            defaultPersona: {
              ...user.defaultPersona,
              avatar,
              identity: undefined,
            },
            personas: [...user.personas].map(persona => ({
              ...persona,
              avatar: undefined,
              identity: undefined,
            })),
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

      let updatedUser = ctx.request.body;
      const defaultPersona = updatedUser.defaultPersona;
      let newDefault;

      if (defaultPersona && isString(defaultPersona)) {
        const personas = user.personas.getItems();
        newDefault = personas.find(persona => persona.uuid === defaultPersona);
        if (!newDefault) {
          log.debug(
            `HTTP 400 Error: User with ID ${
              ctx.params.id
            } has no persona with ID ${defaultPersona}.`,
          );
          ctx.throw(
            400,
            `User with ID ${
              ctx.params.id
            } has no persona with ID ${defaultPersona}.`,
          );
        }
        updatedUser.defaultPersona = newDefault;
      }

      users.assign(user, updatedUser);
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
        schema: Joi.string(),
        value: Joi.string(),
        isNotified: Joi.boolean(),
        isPublic: Joi.boolean(),
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
        summary: 'Endpoint to DELETE contacts for a single user.',
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
        operationId: 'PostUser',
        summary: 'Endpoint to POST a user.',
        required: true,
      },
    },
    method: 'POST',
    path: '/users',
    pre: thisUser.can('access admin pages'),
    handler: async (ctx) => {
      if (typeof ctx.request.body.orcid !== 'string' || !orcidUtils.isValid(ctx.request.body.orcid)) {
        ctx.throw(400, 'Invalid ORCID');
      }

      const existing = await users.findOne({ orcid: ctx.request.body.orcid });
      if (existing) {
        ctx.throw(
          409,
          `User with ORCID ${ctx.request.body.orcid} already exists`,
        );
      }

      if(typeof ctx.request.body.name !== 'string') {
        ctx.throw(400, 'No name')
      }

      log.debug('Creating new user.');
      const newUser = users.create({ orcid: ctx.request.body.orcid });

      let anonName = anonymus
        .create()[0]
        .replace(/(^|\s)\S/g, (l) => l.toUpperCase());
      let tries = 0;
      while ((await personas.findOne({ name: anonName })) !== null) {
        log.debug('Anonymous name generation collision');
        anonName = anonymus
          .create()[0]
          .replace(/(^|\s)\S/g, (l) => l.toUpperCase());
        tries = tries + 1;
        if (tries >= ANON_TRIES_LIMIT) {
          anonName = anonName + ` ${tries - ANON_TRIES_LIMIT}`;
        }
      }

      const anonPersona = personas.create({
        name: anonName,
        identity: newUser,
        isAnonymous: true,
      });
      const publicPersona = personas.create({
        name: ctx.request.body.name,
        identity: newUser,
        isAnonymous: false,
      });

      newUser.defaultPersona = anonPersona;
      personas.persist([anonPersona, publicPersona]);
      users.persist(newUser);

      await users.em.flush();
      await personas.em.flush();

      ctx.status = 201;
      ctx.body = anonName;
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

  userRouter.route({
    meta: {
      swagger: {
        operationId: 'PostUserKey',
        summary: 'Endpoint to POST new API key for a single user.',
      },
    },
    method: 'POST',
    path: '/users/:id/keys',
    validate: {
      params: {
        id: Joi.string()
          .description('User id')
          .required(),
      },
      body: Joi.object({
        app: Joi.string().required(),
      }),
      type: 'json',
    },
    pre: thisUser.can('edit this user'), // TODO: can users delete their own account?
    handler: async ctx => {
      log.debug(`Adding a new API key to user ${ctx.params.id}`);
      let newKey, user;
      try {
        user = await users.findOneByUuidOrOrcid(ctx.params.id);
      } catch (err) {
        log.error('HTTP 400 Error: ', err);
        ctx.throw(400, `Failed to parse contact schema: ${err}`);
      }
      if (!user) {
        log.error(
          `HTTP 404 Error: That user with ID ${ctx.params.id} does not exist.`,
        );
        ctx.throw(404, `That user with ID ${ctx.params.id} does not exist.`);
      }

      let conflict, app;
      try {
        log.debug(`Create a new API key entry.`);
        ({ app } = ctx.request.body);

        conflict = await keys.findOne({ app, owner: user });
      } catch (err) {
        log.error('HTTP 400 Error: ', err);
        ctx.throw(400, `Failed to parse API key schema: ${err}`);
      }

      if (conflict) {
        log.error(
          `HTTP 409 Error: API key with identifier ${app} already exists for user ${
            ctx.params.id
          }`,
        );
        ctx.throw(
          409,
          `API key with identifier ${app} already exists for user ${
            ctx.params.id
          }`,
        );
      }

      try {
        newKey = new Key(user, app);
        await keys.persistAndFlush(newKey);
      } catch (err) {
        log.error('HTTP 400 Error: ', err);
        ctx.throw(400, `Failed to parse API key schema: ${err}`);
      }

      ctx.status = 201;
      ctx.body = {
        status: 201,
        message: 'created',
        data: newKey,
      };
    },
  });

  userRouter.route({
    meta: {
      swagger: {
        operationId: 'DeleteUserKeys',
        summary: 'Endpoint to DELETE key for a single user.',
      },
    },
    method: 'DELETE',
    path: '/users/:id/keys',
    validate: {
      params: {
        id: Joi.string()
          .description('User id')
          .required(),
      },
      query: {
        kid: Joi.string()
          .description('Key id')
          .required(),
      },
      type: 'json',
      continueOnError: true,
    },
    pre: thisUser.can('edit this user'), // TODO: can users delete their own account?
    handler: async ctx => {
      const keyId = ctx.query.kid;
      let user;
      log.debug(`Deleting key for user ${ctx.params.id}`);
      try {
        user = await users.findOneByUuidOrOrcid(ctx.params.id);
      } catch (err) {
        log.error('HTTP 400 Error: ', err);
        ctx.throw(400, `Failed to parse key schema: ${err}`);
      }
      if (!user) {
        ctx.throw(404, `That user with ID ${ctx.params.id} does not exist.`);
      }
      try {
        const exists = await keys.findOne({
          uuid: keyId,
          owner: user,
        });
        if (exists) {
          log.debug('Deleting key.');
          await keys.removeAndFlush(exists);
          ctx.status = 200;
          ctx.body = {
            status: 200,
            message: 'ok',
            data: exists,
          };
        } else {
          log.error('Key does not exist.');
          ctx.throw(
            404,
            `That key ${ctx.query.cid} for user with ID ${
              ctx.params.id
            } does not exist.`,
          );
        }
      } catch (err) {
        log.error('HTTP 400 Error: ', err);
        ctx.throw(400, `Failed to parse key schema: ${err}`);
      }
    },
  });

  return userRouter;
}
