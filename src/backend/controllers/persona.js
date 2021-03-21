import router from 'koa-joi-router';
import { QueryOrder } from '@mikro-orm/core';
import { PostgreSqlConnection } from '@mikro-orm/postgresql';
import { getLogger } from '../log.js';
import { getErrorMessages } from '../utils/errors';

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
  sort: Joi.string().allow(
    'name',
    'dateJoined',
    'recentRequests',
    'recentRapid',
    'recentFull',
    '',
  ),
});

export default function controller(personasModel, badgesModel, thisUser) {
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
        const populate = [
          'communities',
          'fullReviews',
          'rapidReviews',
          'requests',
          'badges',
        ];
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
        let queries = [];
        if (ctx.query.search && ctx.query.search !== '') {
          const connection = personasModel.em.getConnection();
          if (connection instanceof PostgreSqlConnection) {
            queries.push({
              $or: [
                { name: { $ilike: `%${ctx.query.search}%` } },
                { bio: { $ilike: `%${ctx.query.search}%` } },
              ],
            });
          } else {
            queries.push({
              $or: [
                { name: { $like: `%${ctx.query.search}%` } },
                { bio: { $like: `%${ctx.query.search}%` } },
              ],
            });
          }
        }

        if (ctx.query.badges) {
          const badges = ctx.query.badges.split(',');
          queries.push({ badges: { uuid: { $in: badges } } });
        }

        if (ctx.query.communities) {
          const communities = ctx.query.communities.split(',');
          queries.push({
            $or: [
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
            populate,
            orderBy,
            ctx.query.limit,
            ctx.query.offset,
          );
        } else {
          foundPersonas = await personasModel.findAll(
            populate,
            orderBy,
            ctx.query.limit,
            ctx.query.offset,
          );
          count = await personasModel.count();
        }
        if (foundPersonas) {
          ctx.body = {
            statusCode: 200,
            status: 'ok',
            totalCount: count,
            data: foundPersonas,
          };
        }
      } catch (err) {
        log.error('HTTP 400 Error: ', err);
        ctx.throw(400, `Failed to parse query: ${err}`);
      }
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
        persona = await personasModel.findOne({ uuid: ctx.params.id }, [
          'requests',
          'fullReviews.preprint',
          'rapidReviews.preprint',
          'badges',
          'identity',
          'identity.contacts'
        ]);
        if (!persona) {
          ctx.throw(404, `Persona with ID ${ctx.params.id} doesn't exist`);
        }
        if (persona.avatar && Buffer.isBuffer(persona.avatar)) {
          persona.avatar = persona.avatar.toString();
        }
      } catch (err) {
        log.error('HTTP 400 Error: ', err);
        ctx.throw(400, `Failed to parse schema: ${err}`);
      }

      ctx.body = {
        status: 200,
        message: 'ok',
        data: [persona],
      };
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
        name: Joi.string(),
        avatar: Joi.string(),
        bio: Joi.string().allow(''),
        isLocked: Joi.boolean(),
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
        persona = await personasModel.findOne({ uuid: ctx.params.id });
        if (!persona) {
          ctx.throw(
            404,
            `That persona with ID ${ctx.params.id} does not exist.`,
          );
        }
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
        ctx.throw(400, `Failed to add user to badge: ${err}`);
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
    path: '/personas/:id/badges/:bid',
    pre: thisUser.can('access admin pages'),
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
        ctx.throw(400, `Failed to remove user from group: ${err}`);
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

  // TODO: do we need delete?

  return personaRouter;
}
