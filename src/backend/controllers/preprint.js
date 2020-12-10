import router from 'koa-joi-router';
import { getLogger } from '../log.js';
import resolve from '../utils/resolve.js';
import { getErrorMessages } from '../utils/errors';

const log = getLogger('backend:controllers:preprint');
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
  query: Joi.string(),
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
      let data;
      try {
        data = await resolve(identifier);
        if (data) {
          log.debug(`Adding a preprint & its resolved metadata to database.`)
          const preprint = preprints.create(data);
          await preprints.persistAndFlush(preprint);
        }
      } catch (err) {
        log.error(`Preprint resolution failed: ${err}`);
        ctx.throw(400, `Preprint resolution failed: ${err}`);
      }

      if (!data) ctx.throw(404, 'No preprint found.');
      ctx.body = data;
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
    },
    handler: async ctx => {
      if (ctx.invalid) {
        handleInvalid(ctx);
        return;
      }

      log.debug(`Retrieving preprints.`);

      try {
        const populate = ['fullReviews', 'rapidReviews', 'requests'];
        let foundPreprints;
        if (ctx.query.query) {
          foundPreprints = await preprints.search(ctx.query.query, populate);
        } else {
          foundPreprints = await preprints.findAll(populate);
        }
        if (foundPreprints) {
          ctx.body = {
            statusCode: 200,
            status: 'ok',
            data: foundPreprints,
          };
        }
      } catch (err) {
        log.error('HTTP 400 Error: ', err);
        ctx.throw(400, `Failed to parse query: ${err}`);
      }
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
        id: Joi.alternatives()
          .try(Joi.number().integer(), Joi.string())
          .description('Preprint ID')
          .required(),
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
        log.debug(`Trying this!`)
        preprint = await preprints.findOneByIdOrHandle(ctx.params.id, [
          'fullReviews',
          'rapidReviews',
          'requests',
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
      //params: {
      //  id: Joi.alternatives().try(Joi.number().integer(), Joi.string()),
      //},
      params: {
        id: Joi.alternatives()
          .try(Joi.number().integer(), Joi.string())
          .description('Preprint ID')
          .required(),
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
        preprint = preprints.findOneByIdOrHandle(ctx.params.id);
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
      //params: {
      //  id: Joi.alternatives().try(Joi.number().integer(), Joi.string()),
      //},
      params: {
        id: Joi.alternatives()
          .try(Joi.number().integer(), Joi.string())
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
        preprint = preprints.findOneByIdOrHandle(ctx.params.id);
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
