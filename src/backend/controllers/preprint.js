import router from 'koa-joi-router';
import { QueryOrder } from '@mikro-orm/core';
import { PostgreSqlConnection } from '@mikro-orm/postgresql';
import { getLogger } from '../log.js';
import { resolvePreprint } from '../utils/resolve.ts';
import { createPreprintId } from '../../common/utils/ids';
import { getErrorMessages } from '../utils/errors';

const log = getLogger('backend:controllers:preprint');
const Joi = router.Joi;

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
  tags: Joi.string().allow(''),
  sort: Joi.string().allow(
    'datePosted',
    'recentRequests',
    'recentRapid',
    'recentFull',
    '',
  ),
});

const preprintSchema = {};

const handleInvalid = ctx => {
  log.debug('Validation error!');
  log.error(ctx.invalid);
  ctx.status = 400;
  ctx.message = getErrorMessages(ctx.invalid);
};

// eslint-disable-next-line no-unused-vars
export default function controller(preprints, thisUser) {
  const preprintRoutes = router();

  // RESOLVE PREPRINT METADATA
  preprintRoutes.route({
    meta: {
      swagger: {
        operationId: 'GetResolvePreprints',
        summary: 'Endpoint to GET and resolve preprint metadata',
      },
    },
    method: 'GET',
    path: '/resolve',
    handler: async ctx => {
      const { identifier } = ctx.query;
      log.debug(`Resolving preprint with ID: ${identifier}`);
      let preprint, data;
      try {
        preprint = await preprints.findOneByUuidOrHandle(
          createPreprintId(identifier),
          [
            'fullReviews.authors',
            'fullReviews.drafts',
            'rapidReviews.author',
            'requests',
            'tags',
          ],
        );
        if (preprint) {
          log.debug(`Found cached preprint ${identifier}`);
          ctx.body = preprint;
          return;
        }
        data = await resolvePreprint(identifier);
        if (data) {
          log.debug('Adding a preprint & its resolved metadata to database.');
          preprint = preprints.create(data);
          await preprints.persistAndFlush(preprint);
        }
      } catch (err) {
        log.error(`Preprint resolution failed: ${err}`);
        ctx.throw(400, `Preprint resolution failed: ${err}`);
      }
      if (!data) ctx.throw(404, 'No preprint found.');
      ctx.body = preprint;
    },
  });

  // POST
  preprintRoutes.route({
    meta: {
      swagger: {
        operationId: 'PostPreprints',
        summary: 'Endpoint to POST a new preprint',
      },
    },
    method: 'POST',
    path: '/preprints',
    pre: (ctx, next) => thisUser.can('access private pages')(ctx, next),
    handler: async ctx => {
      if (ctx.invalid) {
        handleInvalid(ctx);
        return;
      }

      log.debug('Adding new preprint.');
      let preprint;

      try {
        preprint = preprints.create(ctx.request.body);
        await preprints.persistAndFlush(preprint);
      } catch (err) {
        log.error('HTTP 400 Error: ', err);
        ctx.throw(400, `Failed to add preprint: ${err}`);
      }

      ctx.response.status = 201;
      ctx.body = {
        statusCode: 201,
        status: 'created',
        data: preprint,
      };
    },
  });

  // GET
  preprintRoutes.route({
    meta: {
      swagger: {
        operationId: 'GetPreprints',
        summary:
          'Endpoint to GET multiple preprints and their associated reviews (both full-length and rapid), as well as requests for review.',
      },
    },
    method: 'GET',
    path: '/preprints',
    validate: {
      query: querySchema, // #TODO
      continueOnError: true,
    },
    handler: async ctx => {
      if (ctx.invalid) {
        handleInvalid(ctx);
        return;
      }

      log.debug(`Retrieving preprints.`);

      let foundPreprints, count;
      try {
        const populate = [
          'fullReviews',
          'fullReviews.authors',
          'rapidReviews',
          'rapidReviews.author',
          'requests',
          'requests.author',
          'communities',
          'tags',
        ];
        const order = ctx.query.asc
          ? QueryOrder.ASC_NULLS_LAST
          : QueryOrder.DESC_NULLS_LAST;
        let orderBy;
        switch (ctx.query.sort) {
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
            orderBy = { datePosted: order };
        }
        const queries = [];
        queries.push({
          isPublished: { $eq: true },
        });
        if (ctx.query.search && ctx.query.search !== '') {
          const connection = preprints.em.getConnection();
          if (connection instanceof PostgreSqlConnection) {
            queries.push({
              $or: [
                { title: { $ilike: `%${ctx.query.search}%` } },
                { handle: { $ilike: `%${ctx.query.search}%` } },
                { abstract_text: { $ilike: `%${ctx.query.search}%` } },
                { authors: { $ilike: `%${ctx.query.search}%` } },
              ],
            });
          } else {
            queries.push({
              $or: [
                { title: { $like: `%${ctx.query.search}%` } },
                { handle: { $like: `%${ctx.query.search}%` } },
                { abstract_text: { $like: `%${ctx.query.search}%` } },
                { authors: { $like: `%${ctx.query.search}%` } },
              ],
            });
          }
        }

        if (ctx.query.tags) {
          const tags = ctx.query.tags.split(',');
          queries.push({
            $or: [
              { tags: { uuid: { $in: tags } } },
              { tags: { name: { $in: tags } } },
            ],
          });
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
          log.debug('Querying preprints:', query);
          [foundPreprints, count] = await preprints.findAndCount(
            query,
            populate,
            orderBy,
            ctx.query.limit,
            ctx.query.offset,
          );
        } else {
          foundPreprints = await preprints.findAll(
            populate,
            orderBy,
            ctx.query.limit,
            ctx.query.offset,
          );
          count = await preprints.count();
        }
      } catch (err) {
        log.error('HTTP 400 Error: ', err);
        ctx.throw(400, `Failed to parse query: ${err}`);
      }

      if (!foundPreprints || count <= 0) {
        ctx.status = 204;
      }

      ctx.body = {
        statusCode: 200,
        status: 'ok',
        totalCount: count,
        data: foundPreprints,
      };
    },
  });

  preprintRoutes.route({
    meta: {
      swagger: {
        operationId: 'GetPreprint',
        summary:
          'Endpoint to GET a single preprint, as well as its full-length reviews, rapid reviews, and requests for review.',
        required: true,
      },
    },
    method: 'GET',
    path: '/preprints/:id',
    validate: {
      params: {
        id: Joi.string()
          .description('Preprint ID')
          .required(),
        //id: Joi.alternatives()
        //  .try(Joi.number().integer(), Joi.string())
        //  .description('Preprint ID')
        //  .required(),
      },
      continueOnError: true,
    },
    handler: async ctx => {
      if (ctx.invalid) {
        handleInvalid(ctx);
        return;
      }

      log.debug(`Retrieving preprint ${ctx.params.id}.`);
      let preprint;

      try {
        preprint = await preprints.findOneByUuidOrHandle(ctx.params.id, [
          'fullReviews.authors.identity',
          'fullReviews.drafts',
          'fullReviews.comments.author',
          'rapidReviews.author.identity',
          'requests',
          'tags',
        ]);
      } catch (err) {
        log.error('HTTP 400 Error: ', err);
        ctx.throw(400, err);
      }

      if (preprint) {
        ctx.response.body = { statusCode: 200, status: 'ok', data: [preprint] };
        ctx.response.status = 200;
      } else {
        log.error(
          `HTTP 404 Error: That preprint with ID ${
            ctx.params.id
          } does not exist.`,
        );

        ctx.response.status = 404;

        ctx.body = {
          statusCode: 404,
          status: `HTTP 404 Error.`,
          message: `That preprint with ID ${ctx.params.id} does not exist.`,
        };
      }
    },
  });

  preprintRoutes.route({
    meta: {
      swagger: {
        operationId: 'PutPreprint',
        summary: 'Endpoint to PUT updates on preprints',
        required: true,
      },
    },
    method: 'PUT',
    path: '/preprints/:id',
    validate: {
      params: {
        id: Joi.string()
          .description('Preprint ID')
          .required(),
        //id: Joi.alternatives()
        //  .try(Joi.number().integer(), Joi.string())
        //  .description('Preprint ID')
        //  .required(),
      },
      body: {
        data: preprintSchema,
      },
      type: 'json',
      failure: 400,
      continueOnError: true,
    },
    pre: async (ctx, next) => {
      await thisUser.can('access admin pages');
      return next();
    },
    handler: async ctx => {
      if (ctx.invalid) {
        handleInvalid(ctx);
        return;
      }
      log.debug(`Updating preprint ${ctx.params.id}.`);
      let preprint;

      try {
        preprint = preprints.findOneByUuidOrHandle(ctx.params.id);
        await preprints.persistAndFlush(ctx.request.body.data[0]);
      } catch (err) {
        log.error('HTTP 400 Error: ', err);
        ctx.throw(400, `Failed to parse query: ${err}`);
      }

      if (preprint) {
        ctx.response.body = { statusCode: 200, status: 'ok', data: preprint };
        ctx.response.status = 200;
      } else {
        log.error(
          `HTTP 404 Error: That preprint with ID ${
            ctx.params.id
          } does not exist.`,
        );
        ctx.throw(
          404,
          `That preprint with ID ${ctx.params.id} does not exist.`,
        );
      }
    },
  });

  preprintRoutes.route({
    meta: {
      swagger: {
        operationId: 'DeletePreprint',
        summary: 'Endpoint to DELETE preprints',
        required: true,
      },
    },
    method: 'DELETE',
    path: '/preprints/:id',
    validate: {
      params: {
        //id: Joi.alternatives()
        //  .try(Joi.number().integer(), Joi.string())
        //  .description('Preprint ID')
        //  .required(),
        id: Joi.string()
          .description('Preprint ID')
          .required(),
      },
    },
    pre: async (ctx, next) => {
      await thisUser.can('access admin pages');
      return next();
    },
    handler: async ctx => {
      log.debug(`Deleting preprint ${ctx.params.id}.`);
      let preprint;

      try {
        preprint = preprints.findOneByUuidOrHandle(ctx.params.id);
        await preprints.removeAndFlush(preprint);
      } catch (err) {
        log.error('HTTP 400 Error: ', err);
        ctx.throw(400, `Failed to parse query: ${err}`);
      }

      if (preprint.length && preprint.length > 0) {
        ctx.response.body = { status: 'success', data: preprint };
        ctx.response.status = 200;
      } else {
        log.error(
          `HTTP 404 Error: That preprint with ID ${
            ctx.params.id
          } does not exist.`,
        );
        ctx.throw(
          404,
          `That preprint with ID ${ctx.params.id} does not exist.`,
        );
      }
    },
  });

  return preprintRoutes;
}
