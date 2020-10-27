import router from 'koa-joi-router';
import { getLogger } from '../log.js';
import resolve from '../utils/resolve.js';

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
});

// eslint-disable-next-line no-unused-vars
export default function controller(preprints) {
  const preprintRoutes = router();

  preprintRoutes.route({
    meta: {
      swagger: {
        summary: 'Endpoint to resolve preprint metadata',
      },
    },
    method: 'get',
    path: '/resolve',
    handler: async ctx => {
      const { identifier } = ctx.query;
      log.debug(`Resolving preprint with ID: ${identifier}`);
      const data = await resolve(identifier);
      ctx.body = data;
    },
  });

  preprintRoutes.route({
    meta: {
      swagger: {
        summary: 'Endpoint to post preprints',
      },
    },
    method: 'post',
    path: '/preprints',
    validate: {
      body: {
        doi: Joi.string(),
        title: Joi.string(),
        server: Joi.string(),
        url: Joi.string(),
        pdfUrl: Joi.string(),
      }, // #TODO
      type: 'json',
    },
    // pre:thisUserthisUser.can('access private pages'),
    handler: async ctx => {
      log.debug('Adding new preprint.');
      let preprint;

      try {
        preprint = preprints.create(ctx.request.body);
        await preprints.persistAndFlush(preprint);
      } catch (err) {
        log.error('HTTP 400 Error: ', err);
        ctx.throw(400, `Failed to parse preprint schema: ${err}`);
      }
    },
  });

  preprintRoutes.route({
    meta: {
      swagger: {
        summary: 'Endpoint to get preprints',
      },
    },
    method: 'get',
    path: '/preprints',
    validate: {
      query: querySchema,
      validate: {
        output: {
          200: {
            body: {
              statusCode: 200,
              status: 'ok',
              data: Joi.array().items(
                Joi.object({
                  doi: Joi.string(),
                  title: Joi.string(),
                  server: Joi.string(),
                  url: Joi.string(),
                  pdfUrl: Joi.string(),
                }).min(1),
              ),
            },
          },
        },
        failure: 400,
      },
    },
    handler: async ctx => {
      log.debug(`Retrieving preprints.`);

      try {
        const allPreprints = await preprints.findAll();
        if (allPreprints) {
          ctx.response.body = {
            statusCode: 200,
            status: 'ok',
            data: allPreprints,
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
        summary: 'Endpoint to get a single preprint',
      },
    },
    method: 'get',
    path: '/preprints/:id',
    validate: {
      params: {
        id: Joi.number().integer(),
      },
      failure: 400,
      output: {
        200: {
          body: {
            statusCode: 200,
            status: 'ok',
            data: Joi.array().items(
              Joi.object({
                doi: Joi.string(),
                title: Joi.string(),
                server: Joi.string(),
                url: Joi.string(),
                pdfUrl: Joi.string(),
              }).min(1),
            ),
          },
        },
      },
    },
    handler: async ctx => {
      log.debug(`Retrieving preprint ${ctx.params.id}.`);
      let preprint;

      try {
        preprint = await preprints.findOne(ctx.params.id);
      } catch (err) {
        log.error('HTTP 400 Error: ', err);
        ctx.throw(400, `Failed to parse query: ${err}`);
      }

      if (preprint.length) {
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
        summary: 'Endpoint to update preprints',
      },
    },
    method: 'put',
    path: '/preprints/:id',
    validate: {
      params: {
        id: Joi.number().integer(),
      },
    },
    // pre:thisUserthisUser.can('access admin pages'),
    handler: async ctx => {
      log.debug(`Updating preprint ${ctx.params.id}.`);
      let preprint;

      try {
        preprint = await preprints.findOne(
          ctx.params.id,
          ctx.request.body.data,
        );
      } catch (err) {
        log.error('HTTP 400 Error: ', err);
        ctx.throw(400, `Failed to parse query: ${err}`);
      }

      if (preprint.length && preprint.length > 0) {
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
        summary: 'Endpoint to delete preprints',
      },
    },
    method: 'delete',
    path: '/preprints/:id',
    // pre:thisUserthisUser.can('access admin pages'),
    handler: async ctx => {
      log.debug(`Deleting preprint ${ctx.params.id}.`);
      let preprint;

      try {
        preprint = preprints.findOne(ctx.params.id);
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
