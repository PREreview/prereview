import router from 'koa-joi-router';
import { QueryOrder } from '@mikro-orm/core';
import { getLogger } from '../log.ts';
import { getErrorMessages } from '../utils/errors';
import { getFields } from '../utils/getFields.ts';

const log = getLogger('backend:controllers:persona');
const Joi = router.Joi;

const handleInvalid = ctx => {
  log.debug('Validation error!');
  log.error(ctx.invalid);
  ctx.status = 400;
  ctx.message = getErrorMessages(ctx.invalid);
};

const querySchema = Joi.object({
  limit: Joi.number()
    .integer()
    .greater(-1),
  offset: Joi.number()
    .integer()
    .greater(-1),
  asc: Joi.boolean(),
  search: Joi.string().allow(''),
  communities: Joi.string().allow(''),
  badges: Joi.string().allow(''),
  expertises: Joi.array(),
  include_images: Joi.string().allow(''),
  sort: Joi.string().allow(
    'name',
    'dateJoined',
    'recentRequests',
    'recentRapid',
    'recentFull',
    '',
  ),
});

export default function controller(
  personasModel,
  usersModel,
  badgesModel,
  expertisesModel,
  thisUser,
) {
  const personaRouter = router();

  // no POST because personas are only created by the auth controller when
  // a new user first registers with PREreview

  personaRouter.route({
    meta: {
      swagger: {
        operationId: 'GetPersonas',
        summary:
          'Each user registered on the PREreview platform has two corresponding personas: one which has their public name and another which is anonymous. This endpoint GETs all personas on PREreview and the reviews attributed to each. Returns a 200 if successful, and an array of personas in the `data` attribute of the response body.',
      },
    },
    method: 'GET',
    path: '/personas',
    validate: {
      query: querySchema, // #TODO
      continueOnError: true,
    },
    handler: async ctx => {
      if (ctx.invalid) {
        handleInvalid(ctx);
        return;
      }

      log.debug(`Retrieving personas.`);

      try {
        let foundPersonas, count;
        const order = ctx.query.asc
          ? QueryOrder.ASC_NULLS_LAST
          : QueryOrder.DESC_NULLS_LAST;
        let orderBy;
        switch (ctx.query.sort) {
          case 'dateJoined':
            orderBy = { createdAt: order };
            break;
          case 'recentRequests':
            orderBy = { requests: { createdAt: order } };
            break;
          case 'recentRapid':
            orderBy = { rapidReviews: { createdAt: order } };
            break;
          case 'recentFull':
            orderBy = { fullReviews: { createdAt: order } };
            break;
          default:
            orderBy = {
              name:
                order === QueryOrder.ASC_NULLS_LAST
                  ? QueryOrder.DESC_NULLS_LAST
                  : QueryOrder.ASC_NULLS_LAST,
            };
        }
        const options = {
          fields: getFields(
            'Persona',
            personasModel.em.getMetadata(),
            ctx.query.include_images
              ? ctx.query.include_images.split(',')
              : undefined,
          ),
          populate: [
            'communities',
            'fullReviews',
            'rapidReviews',
            'requests',
            'badges',
            'expertises',
          ],
          orderBy: orderBy,
          limit: ctx.query.limit,
          offset: ctx.query.offset,
        };
        let queries = [];
        if (ctx.query.search && ctx.query.search !== '') {
          queries.push({
            $or: [
              { name: { $ilike: `%${ctx.query.search}%` } },
              { bio: { $ilike: `%${ctx.query.search}%` } },
            ],
          });
        }

        if (ctx.query.badges) {
          const badges = ctx.query.badges.split(',');
          queries.push({
            $or: [
              { badges: { name: { $in: badges } } },
              { badges: { uuid: { $in: badges } } },
            ],
          });
        }

        if (ctx.query.communities) {
          const communities = ctx.query.communities.split(',');
          queries.push({
            $or: [
              { communities: { name: { $in: communities } } },
              { communities: { uuid: { $in: communities } } },
              { communities: { slug: { $in: communities } } },
            ],
          });
        }

        if (queries.length > 0) {
          let query;
          if (queries.length > 1) {
            query = { $and: queries };
          } else {
            query = queries[0];
          }
          log.debug('Querying personas:', query);
          [foundPersonas, count] = await personasModel.findAndCount(
            query,
            options,
          );
        } else {
          foundPersonas = await personasModel.findAll(options);
          count = await personasModel.count();
        }

        let personasWithAvatar;

        if (foundPersonas) {
          personasWithAvatar = foundPersonas.map(persona => {
            if (persona.avatar && Buffer.isBuffer(persona.avatar)) {
              return {
                ...persona,
                id: undefined,
                avatar: persona.avatar.toString(),
              };
            } else {
              return persona;
            }
          });

          ctx.body = {
            statusCode: 200,
            status: 'ok',
            totalCount: count,
            data: personasWithAvatar,
          };
        }
      } catch (err) {
        log.error('HTTP 400 Error: ', err);
        ctx.throw(400, `Failed to parse query: ${err}`);
      }
    },
  });

  personaRouter.route({
    meta: {
      swagger: {
        operationId: 'DeletePersonas',
      },
    },
    method: 'DELETE',
    path: '/personas/:id',
    pre: thisUser.can('access admin pages'),
    handler: async ctx => {
      log.debug(`Deleting persona with id ${ctx.params.id}.`);
      let persona;

      try {
        persona = await personasModel.findOne({ uuid: ctx.params.id });
        if (!persona) {
          ctx.throw(404, `Persona with ID ${ctx.params.id} doesn't exist`);
        }
        await personasModel.removeAndFlush(persona);
      } catch (err) {
        log.error('HTTP 400 Error: ', err);
        ctx.throw(400, `Failed to parse community schema: ${err}`);
      }

      // if deleted
      ctx.status = 204;
    },
  });

  personaRouter.route({
    method: 'GET',
    path: '/personas/:id',
    // validate: {}
    handler: async ctx => {
      log.debug(`Retrieving persona ${ctx.params.id}.`);
      let persona;

      try {
        const options = {
          fields: getFields(
            'Persona',
            personasModel.em.getMetadata(),
            ctx.query.include_images
              ? ctx.query.include_images.split(',')
              : undefined,
          ),
          populate: [
            'requests',
            'fullReviews.preprint',
            'rapidReviews.preprint',
            'requests.preprint',
            'badges',
            'expertises',
            'communities',
          ],
        };
        persona = await personasModel.findOne({ uuid: ctx.params.id }, options);
      } catch (err) {
        log.error('HTTP 400 Error: ', err);
        ctx.throw(400, `Failed to parse schema: ${err}`);
      }

      if (!persona) {
        ctx.throw(404, `Persona with ID ${ctx.params.id} doesn't exist`);
      }
      if (persona.avatar && Buffer.isBuffer(persona.avatar)) {
        persona.avatar = persona.avatar.toString();
      }

      let user;
      if (!persona.isAnonymous) {
        log.debug('This is a public persona, retrieving user data.');
        try {
          user = await usersModel.findOneByPersona(persona.uuid, [
            'contacts',
            'works',
          ]);
        } catch (err) {
          log.error('HTTP 400 Error: ', err);
          ctx.throw(400, `Failed to parse schema: ${err}`);
        }
      }

      delete persona.identity;
      if (user) {
        log.debug('Found corresponding user:', user);
        ctx.body = {
          status: 200,
          message: 'ok',
          data: [
            {
              orcid: user.orcid,
              contacts: user.contacts
                .getItems()
                .filter(contact => contact.isPublic),
              works: user.works,
              ...persona,
            },
          ],
        };
      } else {
        ctx.body = {
          status: 200,
          message: 'ok',
          data: [persona],
        };
      }
      ctx.status = 200;
    },
    meta: {
      swagger: {
        operationId: 'GetPersona',
        description:
          'GET a single user persona. Returns a 200 if successful, and a single-member array of the persona object in the `data` attribute of the response body.',
      },
    },
  });

  personaRouter.route({
    method: 'PUT',
    path: '/personas/:id',
    validate: {
      body: Joi.object({
        name: Joi.string().allow(''),
        avatar: Joi.string().allow(''),
        bio: Joi.string().allow(''),
        badges: Joi.array().allow(''),
        //expertises: Joi.array().allow(''),
        isLocked: Joi.boolean(),
      }).options({
        stripUnknown: true,
      }),
      type: 'json',
      params: {
        id: Joi.string().required(),
      },
      continueOnError: true,
      false: 400,
    },
    pre: thisUser.can('edit this persona'),
    handler: async ctx => {
      if (ctx.invalid) {
        handleInvalid(ctx);
        return;
      }

      log.debug(`Updating persona ${ctx.params.id}.`);
      let persona;

      try {
        persona = await personasModel.findOne({ uuid: ctx.params.id }, [
          'badges',
        ]);
        if (!persona) {
          ctx.throw(
            404,
            `That persona with ID ${ctx.params.id} does not exist.`,
          );
        }
        const expertises = ctx.request.body.expertises || [];
        const newExpertises = [];
        if (expertises.length > 0) {
          for (let p of expertises) {
            const exp = await expertisesModel.findOneOrFail({ uuid: p.uuid });
            exp.personas.add(persona);
            newExpertises.push(exp);
          }
        }

        if (newExpertises.length) {
          persona.expertises.set(newExpertises);
          delete ctx.request.body.expertises;
        }

        const badges = ctx.request.body.badges;
        const user = await thisUser.getUser(ctx);
        const isAdmin = user
          ? await thisUser.isMemberOf('admins', user.orcid)
          : false;
        if (Array.isArray(badges) && isAdmin) {
          log.debug('Updating badges');
          for (let oldBadge of persona.badges.getItems()) {
            if (!badges.some(b => oldBadge.uuid === b.uuid)) {
              await oldBadge.personas.loadItems();
              oldBadge.personas.remove(persona);
            }
          }
          for (let newBadge of badges) {
            const badge = await badgesModel.findOneOrFail(
              { uuid: newBadge.uuid },
              ['personas'],
            );
            badge.personas.add(persona);
          }
        }
        badgesModel.em.flush();
        delete ctx.request.body.badges;

        personasModel.assign(persona, ctx.request.body);
        await personasModel.persistAndFlush(persona);
      } catch (err) {
        log.error('HTTP 400 Error: ', err);
        ctx.throw(400, `Failed to parse schema: ${err}`);
      }

      if (persona.avatar && Buffer.isBuffer(persona.avatar)) {
        persona.avatar = persona.avatar.toString();
      }

      // if updated
      ctx.status = 200;
      ctx.body = {
        status: 200,
        message: 'ok',
        data: persona,
      };
    },
    meta: {
      swagger: {
        operationId: 'PutPersona',
        summary: 'Endpoint to PUT one persona by ID. Admin users only.',
        required: true,
      },
    },
  });

  personaRouter.route({
    method: 'put',
    path: '/personas/:id/badges/:bid',
    validate: {
      type: 'json',
      params: {
        id: Joi.string()
          .description('Persona id')
          .required(),
        bid: Joi.string()
          .description('Badge id')
          .required(),
      },
    },
    pre: thisUser.can('access admin pages'),
    handler: async ctx => {
      log.debug(`Adding badge ${ctx.params.uid} to persona ${ctx.params.id}.`);
      let persona, badge;

      try {
        badge = await badgesModel.findOneByIdOrName(ctx.params.bid, [
          'personas',
        ]);
        persona = await personasModel.findOne({ uuid: ctx.params.id });
      } catch (err) {
        log.error('HTTP 400 Error: ', err);
        ctx.throw(400, `Failed to parse query: ${err}`);
      }

      try {
        log.debug(
          `Persona ${persona.id} found. Adding badge ${badge.id} to persona.`,
        );
        badge.personas.add(persona);
        await badgesModel.persistAndFlush(badge);
      } catch (err) {
        log.error('HTTP 400 Error: ', err);
        ctx.throw(400, `Failed to add badge to persona: ${err}`);
      }

      ctx.body = { status: 200, message: 'ok', data: persona };
      ctx.status = 200;
    },
    meta: {
      swagger: {
        operationId: 'PutPersonaBadge',
        summary:
          'Endpoint to PUT one badge to a persona by ID from PREreview. Admin users only.',
        required: true,
      },
    },
  });

  personaRouter.route({
    method: 'DELETE',
    path: '/personas/:id/badges',
    pre: thisUser.can('access admin pages'),
    validate: {
      query: Joi.object({
        bid: Joi.string(),
      }),
      params: {
        id: Joi.string()
          .description('Persona id')
          .required(),
      },
      type: 'json',
      continueOnError: true,
    },
    handler: async ctx => {
      log.debug(
        `Removing badge ${ctx.params.bid} from persona ${ctx.params.id}.`,
      );
      let persona, badge;

      try {
        badge = await badgesModel.findOneByIdOrName(ctx.params.bid, [
          'personas',
        ]);
        persona = await personasModel.findOne({ uuid: ctx.params.id });
      } catch (err) {
        log.error('HTTP 400 Error: ', err);
        ctx.throw(400, `Failed to parse query: ${err}`);
      }

      try {
        log.debug(
          `Persona ${persona.id} found. Removing badge ${
            badge.id
          } from persona.`,
        );
        badge.personas.remove(persona);
        await badgesModel.persistAndFlush(badge);
      } catch (err) {
        log.error('HTTP 400 Error: ', err);
        ctx.throw(400, `Failed to remove badge from persona: ${err}`);
      }

      // if deleted
      ctx.status = 204;
    },
    meta: {
      swagger: {
        operationId: 'DeletePersonaBadge',
        summary:
          'Endpoint to DELETE one badge from a persona by ID from PREreview. Admin users only.',
        required: true,
      },
    },
  });

  personaRouter.route({
    method: 'put',
    path: '/personas/:id/expertises/:bid',
    validate: {
      type: 'json',
      params: {
        id: Joi.string()
          .description('Persona id')
          .required(),
        bid: Joi.string()
          .description('Expertise id')
          .required(),
      },
    },
    pre: thisUser.can('edit this persona'),
    handler: async ctx => {
      log.debug(
        `Adding expertise ${ctx.params.uid} to persona ${ctx.params.id}.`,
      );
      let persona, expertise;

      try {
        expertise = await expertisesModel.findOneByIdOrName(ctx.params.bid, [
          'personas',
        ]);
        persona = await personasModel.findOne({ uuid: ctx.params.id });
      } catch (err) {
        log.error('HTTP 400 Error: ', err);
        ctx.throw(400, `Failed to parse query: ${err}`);
      }

      try {
        log.debug(
          `Persona ${persona.id} found. Adding expertise ${
            expertise.id
          } to persona.`,
        );
        expertise.personas.add(persona);
        await expertisesModel.persistAndFlush(expertise);
      } catch (err) {
        log.error('HTTP 400 Error: ', err);
        ctx.throw(400, `Failed to add expertise to persona: ${err}`);
      }

      ctx.body = { status: 200, message: 'ok', data: persona };
      ctx.status = 200;
    },
    meta: {
      swagger: {
        operationId: 'PutPersonaExpertise',
        summary:
          'Endpoint to PUT one expertise to a persona by ID from PREreview.',
        required: true,
      },
    },
  });

  personaRouter.route({
    method: 'DELETE',
    path: '/personas/:id/expertises/:bid',
    pre: thisUser.can('edit this persona'),
    handler: async ctx => {
      log.debug(
        `Removing expertise ${ctx.params.bid} from persona ${ctx.params.id}.`,
      );
      let persona, expertise;

      try {
        expertise = await expertisesModel.findOneByIdOrName(ctx.params.bid, [
          'personas',
        ]);
        persona = await personasModel.findOne({ uuid: ctx.params.id });
      } catch (err) {
        log.error('HTTP 400 Error: ', err);
        ctx.throw(400, `Failed to parse query: ${err}`);
      }

      try {
        log.debug(
          `Persona ${persona.id} found. Removing expertise ${
            expertise.id
          } from persona.`,
        );
        expertise.personas.remove(persona);
        await expertisesModel.persistAndFlush(expertise);
      } catch (err) {
        log.error('HTTP 400 Error: ', err);
        ctx.throw(400, `Failed to remove expertise from persona: ${err}`);
      }

      // if deleted
      ctx.status = 204;
    },
    meta: {
      swagger: {
        operationId: 'DeletePersonaExpertise',
        summary:
          'Endpoint to DELETE one expertise from a persona by ID from PREreview.',
        required: true,
      },
    },
  });
  // TODO: do we need delete?

  return personaRouter;
}
