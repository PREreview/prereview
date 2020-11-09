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

  // RESOLVE PREPRINT METADATA
  preprintRoutes.route({
    meta: {
      swagger: {
        summary: 'Endpoint to GET and resolve preprint metadata',
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

  // POST
  preprintRoutes.route({
    meta: {
      swagger: {
        summary: 'Endpoint to POST a new preprint',
      },
    },
    method: 'post',
    path: '/preprints',
    validate: {
      body: Joi.object({
        data: Joi.array().items(
          Joi.object({
          title: Joi.string(),
          url: Joi.string(),
          uuid: Joi.string().guid(),
        })).min(1),
       }), // #TODO
      type: 'json',
      continueOnError: true,
    },
    // pre:thisUserthisUser.can('access private pages'),
    handler: async (ctx, next) => {
      if (ctx.invalid) {
        log.error(
          'HTTP 400 Error. This is the error object: ',
          '\n',
          ctx.invalid,
        );

        ctx.response.status = 400;

        ctx.body = {
          statusCode: 400,
          status: 'HTTP 400 error',
          error: ctx.invalid.body ? ctx.invalid.body.name : ctx.invalid, // TODO: make dynamic
          message: ctx.invalid.body ? ` ${ctx.invalid.body.name}: ${ctx.invalid.body.msg}` : ctx.invalid 
        };

        return next()
      }

      log.debug('Adding new preprint.');
      let preprint;

      try {
        preprint = preprints.create(ctx.request.body.data[0]);
        await preprints.persistAndFlush(preprint);
        ctx.response.status = 201;
        ctx.body = {
          statusCode: 201,
          status: 'created',
          data: preprint,
        };
      } catch (err) {
        log.error('HTTP 400 Error: ', err);
        ctx.response.status = 400;
        ctx.body = {
          statusCode: 400, 
          status: 'HTTP 400 Error',
          message: err
        }
      }
    },
  });

  // GET 
  preprintRoutes.route({
    meta: {
      swagger: {
        summary: 'Endpoint to GET multiple preprints',
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
                  title: Joi.string(),
                  url: Joi.string(),
                  uuid: Joi.string().guid({
                    version: ['uuidv4', 'uuidv5'],
                  }),
                }).min(1),
              ),
            },
          },
        },
        continueOnError: true,
      },
    },
    handler: async ctx => {

      if (ctx.invalid) {
        log.error(
          'HTTP 400 Error. This is the error object: ',
          '\n',
          ctx.invalid,
        );

        ctx.response.status = 400;

        ctx.body = {
          statusCode: 400,
          status: 'HTTP 400 error',
          error: ctx.invalid // TODO: make dynamic
        };

        return next()
      }

      log.debug(`Retrieving preprints.`);

      try {
        const allPreprints = await preprints.findAll();
        if (allPreprints) {
          ctx.body = {
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
        summary: 'Endpoint to GET a single preprint',
      },
    },
    method: 'get',
    path: '/preprints/:id',
    validate: {
      params: {
        id: Joi.number().integer(),
      },
      output: {
        200: {
          body: {
            statusCode: 200,
            status: 'ok',
            data: Joi.array().items(Joi.object()).min(1),
          }
        },
      },
      failure: 400,
      continueOnError: false,
    },
    handler: async (ctx, next) => {
      log.debug('ctx!!!', ctx)
      // ctx.invalid ? log.debug('*******************ctx.invalid', ctx.invalid) : log.debug("Nothing to see here.")

      if (ctx.invalid) {
        log.error(
          'HTTP 400 Error. This is the error object: ',
          '\n',
          ctx.invalid,
        );

        ctx.response.status = 400;

        // ctx.body = {
        //   statusCode: 400,
        //   status: 'HTTP 400 error',
        //   error: ctx.invalid.body ? ctx.invalid.body.name : ctx.invalid, // TODO: make dynamic
        //   message: ctx.invalid.body ? ` ${ctx.invalid.body.name}: ${ctx.invalid.body.msg}` : ctx.invalid 
        // };

        return next()
      }

      log.debug(`Retrieving preprint ${ctx.params.id}.`);
      let preprint;

      try {
        preprint = await preprints.findOne(ctx.params.id);
      } catch (err) {
        log.error('HTTP 400 Error: ', err);
        ctx.throw(400, `Failed to parse query: ${err}`);
      }

      if (!!preprint) {
        ctx.response.body = { statusCode: 200, status: 'ok', data: [preprint] };
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
